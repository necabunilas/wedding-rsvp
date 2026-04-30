import crypto from "crypto";

// Extract a Cloudinary public_id from a delivery URL.
// Handles URLs with optional transformation segments and the version prefix.
// Example: https://res.cloudinary.com/x/image/upload/v123/folder/asset.jpg → folder/asset
export function extractPublicId(url: string): string | null {
  const match = url.match(
    /\/image\/upload\/(?:[^/]+\/)*v\d+\/(.+?)(?:\.[a-z0-9]+)?$/i
  );
  return match ? match[1] : null;
}

// Delete an asset from Cloudinary. Requires CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.
// Returns true on success or "not found" (idempotent), false otherwise.
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    console.warn("Cloudinary admin credentials missing — skipping asset delete");
    return false;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: timestamp.toString(),
    api_key: apiKey,
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    console.error("Cloudinary destroy failed:", res.status, await res.text());
    return false;
  }

  const data = (await res.json()) as { result?: string };
  return data.result === "ok" || data.result === "not found";
}
