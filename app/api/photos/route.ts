import { NextRequest, NextResponse } from "next/server";
import {
  savePhoto,
  getAllPhotos,
  validateFile,
  MAX_FILES_PER_UPLOAD,
} from "@/lib/photos";

// GET - List all photos
export async function GET() {
  try {
    const photos = await getAllPhotos();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST - Upload photos
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploaderName = formData.get("uploaderName") as string;
    const files = formData.getAll("files") as File[];

    // Validate uploader name
    if (!uploaderName || uploaderName.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }

    if (uploaderName.length > 100) {
      return NextResponse.json(
        { error: "Name is too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_UPLOAD} files per upload` },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `${file.name}: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Save all files
    const savedPhotos = [];
    for (const file of files) {
      const photo = await savePhoto(file, uploaderName.trim());
      savedPhotos.push(photo);
    }

    return NextResponse.json({
      success: true,
      photos: savedPhotos,
      message: `${savedPhotos.length} photo(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}
