"use client";

import { useState, useRef, useEffect } from "react";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/music/background.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // Try to autoplay
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked - wait for user interaction
            const handleInteraction = () => {
              if (audioRef.current && !isPlaying) {
                audioRef.current.play()
                  .then(() => setIsPlaying(true))
                  .catch(() => {});
              }
              document.removeEventListener("click", handleInteraction);
              document.removeEventListener("touchstart", handleInteraction);
            };
            document.addEventListener("click", handleInteraction);
            document.addEventListener("touchstart", handleInteraction);
          });
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.log("Audio play failed:", e));
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white shadow-lg border border-wedding-gold/20 flex items-center justify-center hover:bg-wedding-gold-light transition-all duration-200 group"
      aria-label={isPlaying ? "Pause music" : "Play music"}
      title={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? (
        <span className="text-wedding-wine text-lg">⏸</span>
      ) : (
        <span className="text-xl group-hover:scale-110 transition-transform">🎵</span>
      )}
    </button>
  );
}
