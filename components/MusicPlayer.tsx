"use client";

import { useState, useRef, useEffect } from "react";
import WelcomeSplash from "./WelcomeSplash";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if user has already entered (persisted in session)
  useEffect(() => {
    const entered = sessionStorage.getItem("wedding-entered");
    if (entered === "true") {
      setHasEntered(true);
    }
    setIsLoaded(true);
  }, []);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio("/music/background.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    audioRef.current = audio;

    // If already entered (returning visitor in same session), try to autoplay
    if (hasEntered) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay still blocked, wait for interaction
          const handleInteraction = () => {
            audio.play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
            document.removeEventListener("click", handleInteraction);
            document.removeEventListener("touchstart", handleInteraction);
          };
          document.addEventListener("click", handleInteraction);
          document.addEventListener("touchstart", handleInteraction);
        });
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [hasEntered]);

  const handleEnter = () => {
    sessionStorage.setItem("wedding-entered", "true");
    setHasEntered(true);

    // Start playing music on user gesture
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

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

  // Don't render anything until we check session storage
  if (!isLoaded) return null;

  return (
    <>
      {!hasEntered && <WelcomeSplash onEnter={handleEnter} />}

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
    </>
  );
}
