"use client";

import { useState } from "react";

export default function ClearRsvpsButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/admin/clear-rsvps", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert("Failed to clear RSVPs: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to clear RSVPs");
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleClear}
          disabled={isClearing}
          className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-medium disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Yes, Clear All"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isClearing}
          className="px-4 py-3 border-2 border-wedding-gold/30 rounded-xl hover:bg-wedding-gold/10 transition-all duration-200 text-sm font-medium text-wedding-charcoal disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-200 text-sm font-medium"
    >
      Clear All RSVPs
    </button>
  );
}
