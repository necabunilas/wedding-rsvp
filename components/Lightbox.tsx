"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { PhotoMetadata } from "@/types";
import { withTransform, LIGHTBOX_FULL, DOWNLOAD_ORIGINAL } from "@/lib/cloudinary";

function extFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}

async function saveOrSharePhoto(photo: PhotoMetadata): Promise<void> {
  const originalUrl = photo.blobUrl;

  try {
    const res = await fetch(originalUrl);
    const blob = await res.blob();
    const mime = blob.type || photo.mimeType;
    const file = new File([blob], photo.fileName, { type: mime });

    const isCoarsePointer =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    // Mobile path: native share sheet → "Save Image" routes to the Photos library.
    if (isCoarsePointer && nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: photo.fileName });
      return;
    }

    // Desktop Chromium: ask the user where to save via the File System Access API.
    const win = window as Window & {
      showSaveFilePicker?: (opts: {
        suggestedName?: string;
        types?: Array<{ description?: string; accept: Record<string, string[]> }>;
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: BlobPart) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    };

    if (typeof win.showSaveFilePicker === "function") {
      const ext = extFromName(photo.fileName);
      const handle = await win.showSaveFilePicker({
        suggestedName: photo.fileName,
        types: ext ? [{ description: "Image", accept: { [mime]: [ext] } }] : undefined,
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    // Safari / Firefox desktop: anchor-driven download into the default Downloads folder.
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = photo.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // User cancelled the share sheet or save dialog → silently bail.
    if (err instanceof Error && (err.name === "AbortError" || err.name === "NotAllowedError")) return;
    window.open(withTransform(originalUrl, DOWNLOAD_ORIGINAL), "_blank");
  }
}

interface LightboxProps {
  photos: PhotoMetadata[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}: LightboxProps) {
  const currentPhoto = photos[currentIndex];
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrevious, onNext]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    setSwipeOffset(diff);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;

    const threshold = 50; // minimum swipe distance

    if (swipeOffset > threshold && currentIndex > 0) {
      onPrevious();
    } else if (swipeOffset < -threshold && currentIndex < photos.length - 1) {
      onNext();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, currentIndex, photos.length, onPrevious, onNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
        aria-label="Close"
      >
        <span className="text-2xl">×</span>
      </button>

      {/* Download / Save to Photos button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void saveOrSharePhoto(currentPhoto);
        }}
        className="absolute top-4 right-16 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
        aria-label="Save photo"
        title="Save photo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

      {/* Photo counter */}
      <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          aria-label="Previous photo"
        >
          <span className="text-2xl">‹</span>
        </button>
      )}

      {/* Next button */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          aria-label="Next photo"
        >
          <span className="text-2xl">›</span>
        </button>
      )}

      {/* Main image */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center transition-transform duration-100"
        style={{ transform: `translateX(${swipeOffset * 0.5}px)` }}
      >
        <img
          src={withTransform(currentPhoto.blobUrl, LIGHTBOX_FULL)}
          alt={`Photo by ${currentPhoto.uploaderName}`}
          className="max-w-full max-h-[75vh] object-contain rounded-lg select-none pointer-events-none"
          draggable={false}
        />
        <div className="mt-4 text-center">
          <p className="text-white font-medium">{currentPhoto.uploaderName}</p>
          <p className="text-white/60 text-sm">
            {new Date(currentPhoto.uploadedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Swipe hint for mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs md:hidden">
        Swipe or tap arrows to navigate
      </div>
    </div>
  );
}
