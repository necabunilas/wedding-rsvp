"use client";

import { useState, useEffect } from "react";

interface WelcomeSplashProps {
  onEnter: () => void;
}

export default function WelcomeSplash({ onEnter }: WelcomeSplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const handleEnter = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onEnter();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-wedding-off-white flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-wedding-gold text-4xl mb-8 animate-pulse">✦</div>

      <div className="text-center max-w-sm">
        <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-4">
          You&apos;re Invited To
        </p>
        <h1 className="text-5xl md:text-6xl font-serif text-wedding-wine mb-4 italic">
          Nic & Ban
        </h1>
        <p className="text-wedding-charcoal text-sm tracking-wider uppercase mb-8">
          Wedding Celebration
        </p>

        <button
          onClick={handleEnter}
          className="px-10 py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
        >
          Tap to Enter
        </button>

        <p className="text-wedding-gray text-xs mt-6">
          Best experienced with sound
        </p>
      </div>

      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
    </div>
  );
}
