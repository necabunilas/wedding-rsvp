import type { PhotoMetadata } from "@/types";
import fs from "fs";
import path from "path";

// Check if Vercel Blob is configured
const isBlobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

// Check if Vercel KV is configured (for metadata storage)
const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Local file storage paths (used when Vercel services are not available)
const LOCAL_PHOTOS_FILE = path.join(process.cwd(), "data", "photos.json");
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Validation constants
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_UPLOAD = 10;

// Helper to read local photos metadata
function getLocalPhotos(): PhotoMetadata[] {
  try {
    if (fs.existsSync(LOCAL_PHOTOS_FILE)) {
      const data = fs.readFileSync(LOCAL_PHOTOS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading local photos:", error);
  }
  return [];
}

// Helper to save local photos metadata
function saveLocalPhotos(photos: PhotoMetadata[]): void {
  try {
    fs.writeFileSync(LOCAL_PHOTOS_FILE, JSON.stringify(photos, null, 2));
  } catch (error) {
    console.error("Error saving local photos:", error);
  }
}

// Ensure uploads directory exists
function ensureUploadsDir(): void {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
}

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not supported. Use JPEG, PNG, WebP, or HEIC.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is 10MB.` };
  }
  return { valid: true };
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Save a photo
export async function savePhoto(
  file: File,
  uploaderName: string
): Promise<PhotoMetadata> {
  const id = generateId();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storedFileName = `${id}-${safeFileName}`;

  let blobUrl: string;

  if (isBlobConfigured) {
    // Production: Use Vercel Blob
    const { put } = await import("@vercel/blob");
    const blob = await put(`photos/${storedFileName}`, file, {
      access: "public",
    });
    blobUrl = blob.url;
  } else {
    // Development: Use local filesystem
    ensureUploadsDir();
    const localPath = path.join(LOCAL_UPLOADS_DIR, storedFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    blobUrl = `/uploads/${storedFileName}`;
  }

  const metadata: PhotoMetadata = {
    id,
    uploaderName,
    fileName: file.name,
    blobUrl,
    uploadedAt: new Date().toISOString(),
    fileSize: file.size,
    mimeType: file.type,
  };

  // Save metadata
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    await kv.set(`photo:${id}`, metadata);
    await kv.lpush("photo-ids", id);
  } else {
    const photos = getLocalPhotos();
    photos.unshift(metadata); // Add to beginning (newest first)
    saveLocalPhotos(photos);
  }

  return metadata;
}

// Get all photos
export async function getAllPhotos(): Promise<PhotoMetadata[]> {
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    const ids = await kv.lrange<string>("photo-ids", 0, -1);
    const photos: PhotoMetadata[] = [];

    for (const id of ids) {
      const photo = await kv.get<PhotoMetadata>(`photo:${id}`);
      if (photo) {
        photos.push(photo);
      }
    }

    return photos;
  } else {
    return getLocalPhotos();
  }
}

// Get a single photo by ID
export async function getPhotoById(id: string): Promise<PhotoMetadata | null> {
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    return await kv.get<PhotoMetadata>(`photo:${id}`);
  } else {
    const photos = getLocalPhotos();
    return photos.find((p) => p.id === id) || null;
  }
}

// Delete a photo
export async function deletePhoto(id: string): Promise<boolean> {
  const photo = await getPhotoById(id);
  if (!photo) return false;

  // Delete the actual file
  if (isBlobConfigured) {
    const { del } = await import("@vercel/blob");
    try {
      await del(photo.blobUrl);
    } catch (error) {
      console.error("Error deleting blob:", error);
    }
  } else {
    // Delete local file
    const localPath = path.join(process.cwd(), "public", photo.blobUrl);
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (error) {
      console.error("Error deleting local file:", error);
    }
  }

  // Delete metadata
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    await kv.del(`photo:${id}`);
    await kv.lrem("photo-ids", 1, id);
  } else {
    const photos = getLocalPhotos();
    const filtered = photos.filter((p) => p.id !== id);
    saveLocalPhotos(filtered);
  }

  return true;
}

// Get photo count
export async function getPhotoCount(): Promise<number> {
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    return await kv.llen("photo-ids");
  } else {
    return getLocalPhotos().length;
  }
}
