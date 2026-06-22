"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { PhotoMetadata } from "@/types";
import { withTransform, LIGHTBOX_FULL, DOWNLOAD_ORIGINAL } from "@/lib/cloudinary";

async function saveOrSharePhoto(photo: PhotoMetadata): Promise<void> {
  const originalUrl = photo.blobUrl;

  // On iOS Safari, the Web Share API with files opens the native share sheet,
  // which includes "Save Image" — that one routes to the Photos library.
  // The <a download> fallback lands in Files, which is what we're trying to avoid on mobile.
  try {
    const res = await fetch(originalUrl);
    const blob = await res.blob();
    const file = new File([blob], photo.fileName, { type: blob.type || photo.mimeType });

    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: photo.fileName });
      return;
    }

    // Desktop / unsupported: trigger a normal download via blob URL.
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = photo.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    // User cancelled the share sheet, or fetch failed (CORS, network). Fall back to direct link.
    if (err instanceof Error && err.name === "AbortError") return;
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
