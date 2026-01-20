"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#5A0F2E", // wedding-wine
            light: "#FDF9F3", // wedding-cream
          },
        },
        (err) => {
          if (err) {
            console.error("QR Code error:", err);
            setError("Failed to generate QR code");
          }
        }
      );
    }
  }, [url]);

  const downloadQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: "#5A0F2E",
          light: "#FFFFFF",
        },
      });

      const link = document.createElement("a");
      link.download = "wedding-photo-qr.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="inline-block p-4 bg-wedding-cream rounded-2xl border border-wedding-gold/20">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <p className="text-wedding-gray text-sm mt-4 mb-3">
        Guests scan this to upload photos
      </p>
      <button
        onClick={downloadQR}
        className="text-sm text-wedding-wine hover:text-wedding-gold transition-colors underline"
      >
        Download QR Code
      </button>
      <p className="text-wedding-gray/60 text-xs mt-2 break-all max-w-xs mx-auto">
        {url}
      </p>
    </div>
  );
}
