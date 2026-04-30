interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 2400,
  quality: 0.75,
};

// Browser canvas can't decode HEIC; let Cloudinary handle those server-side.
function isCompressible(file: File): boolean {
  return /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  if (!isCompressible(file)) return file;

  const { maxDimension, quality } = { ...DEFAULT_OPTIONS, ...options };

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);

    let { naturalWidth: width, naturalHeight: height } = img;
    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!blob || blob.size >= file.size) return file;

    const compressedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], compressedName, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
