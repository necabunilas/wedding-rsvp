"use client";

import { useState } from "react";
import type { PhotoMetadata } from "@/types";

interface AdminPhotoGridProps {
  initialPhotos: PhotoMetadata[];
}

export default function AdminPhotoGrid({ initialPhotos }: AdminPhotoGridProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos(photos.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-wedding-gold/10">
        <div className="text-5xl mb-4">📷</div>
        <p className="text-wedding-gray">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative bg-white rounded-xl overflow-hidden border border-wedding-gold/10 shadow-sm"
        >
          <div className="aspect-square">
            <img
              src={photo.blobUrl}
              alt={`Photo by ${photo.uploaderName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3">
            <p className="text-wedding-charcoal text-sm font-medium truncate">
              {photo.uploaderName}
            </p>
            <p className="text-wedding-gray text-xs">
              {new Date(photo.uploadedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Delete button */}
          {confirmDelete === photo.id ? (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 p-4">
              <p className="text-white text-sm text-center">Delete this photo?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting === photo.id ? "..." : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(photo.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
              title="Delete photo"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
