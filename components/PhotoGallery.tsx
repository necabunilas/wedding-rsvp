"use client";

import { useState } from "react";
import type { PhotoMetadata } from "@/types";
import Lightbox from "./Lightbox";

interface PhotoGalleryProps {
  photos: PhotoMetadata[];
  showUploader?: boolean;
}

export default function PhotoGallery({
  photos,
  showUploader = true,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <p className="text-wedding-gray">No photos yet</p>
        <p className="text-wedding-gray/60 text-sm mt-1">
          Be the first to share a memory!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square group cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={photo.blobUrl}
              alt={`Photo by ${photo.uploaderName}`}
              className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-[1.02]"
              loading="lazy"
            />
            {showUploader && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-3">
                <p className="text-white text-sm font-medium truncate">
                  {photo.uploaderName}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrevious={() =>
            setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
          }
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null && prev < photos.length - 1 ? prev + 1 : prev
            )
          }
        />
      )}
    </>
  );
}
