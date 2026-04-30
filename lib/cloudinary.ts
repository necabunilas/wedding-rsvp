// Inject Cloudinary URL transformations after `/image/upload/`.
// Returns the URL unchanged for non-Cloudinary URLs (e.g. legacy local /uploads/ paths).
export function withTransform(url: string, transform: string): string {
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  return (
    url.slice(0, idx + marker.length) + transform + "/" + url.slice(idx + marker.length)
  );
}

// Square thumbnail for grid views — content-aware crop, auto quality/format.
// ~30–50 KB per image vs ~400 KB for the full asset.
export const GRID_THUMBNAIL = "w_400,h_400,c_fill,g_auto,q_auto,f_auto";

// Lightbox / full-screen view — auto quality/format, no resize.
export const LIGHTBOX_FULL = "q_auto,f_auto";
