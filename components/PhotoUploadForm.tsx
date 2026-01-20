"use client";

import { useState, useRef } from "react";

interface PhotoUploadFormProps {
  onSuccess?: () => void;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

export default function PhotoUploadForm({ onSuccess }: PhotoUploadFormProps) {
  const [uploaderName, setUploaderName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded for now - env vars not being bundled properly
  const cloudName = "dahumsxt9";
  const uploadPreset = "nic-ban-wedding";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Limit to 10 files
    const newFiles = [...files, ...selectedFiles].slice(0, 10);
    setFiles(newFiles);

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    // Cleanup old previews
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(newPreviews);
    setError("");
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset || "nic-ban-wedding");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!uploaderName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one photo");
      return;
    }

    if (!cloudName) {
      // Fall back to local upload if Cloudinary not configured
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("uploaderName", uploaderName.trim());
        files.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to upload photos");
        }

        setSuccess(true);
        setFiles([]);
        setPreviews([]);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload photos");
      } finally {
        setUploading(false);
      }
      return;
    }

    // Cloudinary upload
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedPhotos = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round((i / files.length) * 100));

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file);

        // Save metadata to our backend
        const metadataRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cloudinaryUrl: cloudinaryResult.secure_url,
            uploaderName: uploaderName.trim(),
            fileName: file.name,
            fileSize: cloudinaryResult.bytes,
            mimeType: `image/${cloudinaryResult.format}`,
          }),
        });

        if (!metadataRes.ok) {
          const errorData = await metadataRes.json();
          throw new Error(errorData.error || "Failed to save photo metadata");
        }

        uploadedPhotos.push(await metadataRes.json());
      }

      setUploadProgress(100);
      setSuccess(true);
      setFiles([]);
      setPreviews([]);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-wedding-gold/20 flex items-center justify-center">
          <span className="text-4xl">📸</span>
        </div>
        <h3 className="text-2xl font-serif text-wedding-wine mb-3 italic">
          Photos Uploaded!
        </h3>
        <p className="text-wedding-gray mb-6">
          Thank you for sharing your memories
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setUploaderName("");
          }}
          className="py-3 px-6 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-colors"
        >
          Upload More Photos
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label className="block text-xs font-medium text-wedding-gray uppercase tracking-wider mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={uploaderName}
          onChange={(e) => setUploaderName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3.5 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold text-wedding-charcoal placeholder:text-wedding-gray/60"
          maxLength={100}
        />
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-xs font-medium text-wedding-gray uppercase tracking-wider mb-2">
          Select Photos
          <span className="normal-case tracking-normal font-normal ml-1">(max 10)</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-wedding-gold/30 rounded-xl p-8 text-center cursor-pointer hover:border-wedding-gold hover:bg-wedding-gold/5 transition-all"
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="text-wedding-charcoal font-medium mb-1">
            Tap to select photos
          </p>
          <p className="text-wedding-gray text-sm">
            or take a new photo with your camera
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div>
          <p className="text-xs text-wedding-gray mb-2">
            {files.length} photo{files.length !== 1 ? "s" : ""} selected
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || files.length === 0}
        className="w-full py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Uploading{uploadProgress > 0 ? ` ${uploadProgress}%` : "..."}
          </span>
        ) : (
          `Upload ${files.length > 0 ? files.length : ""} Photo${files.length !== 1 ? "s" : ""}`
        )}
      </button>
    </form>
  );
}
