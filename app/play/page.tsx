"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const WEDDING_WORDS = [
  { word: "WEDDING", hint: "The big celebration" },
  { word: "BRIDE", hint: "She walks down the aisle" },
  { word: "GROOM", hint: "He waits at the altar" },
  { word: "CEREMONY", hint: "The official event" },
  { word: "RECEPTION", hint: "The party after" },
  { word: "BOUQUET", hint: "Flowers the bride carries" },
  { word: "VOWS", hint: "Promises made at the altar" },
  { word: "RINGS", hint: "Symbols of eternal love" },
  { word: "DANCE", hint: "First one as a couple" },
  { word: "TOAST", hint: "Raise your glass!" },
  { word: "FOREVER", hint: "How long love lasts" },
  { word: "LOVE", hint: "The reason for it all" },
  { word: "MARRIED", hint: "Officially together" },
  { word: "CHAPEL", hint: "A place to wed" },
  { word: "HONEYMOON", hint: "Trip after the wedding" },
];

function scrambleWord(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's actually scrambled
  if (arr.join("") === word && word.length > 1) {
    return scrambleWord(word);
  }
  return arr.join("");
}

export default function GamesPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  const getNextWord = () => {
    const availableIndices = WEDDING_WORDS.map((_, i) => i).filter(
      (i) => !usedIndices.includes(i)
    );
    if (availableIndices.length === 0) {
      setGameComplete(true);
      return;
    }
    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setCurrentIndex(randomIndex);
    setScrambled(scrambleWord(WEDDING_WORDS[randomIndex].word));
    setUsedIndices([...usedIndices, randomIndex]);
    setGuess("");
    setShowHint(false);
    setFeedback(null);
  };

  useEffect(() => {
    getNextWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentWord = WEDDING_WORDS[currentIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.toUpperCase() === currentWord.word) {
      setFeedback("correct");
      setScore(score + (showHint ? 5 : 10));
      setTimeout(() => {
        getNextWord();
      }, 1000);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const handleSkip = () => {
    getNextWord();
  };

  const handleRestart = () => {
    setScore(0);
    setUsedIndices([]);
    setGameComplete(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * WEDDING_WORDS.length);
      setCurrentIndex(randomIndex);
      setScrambled(scrambleWord(WEDDING_WORDS[randomIndex].word));
      setUsedIndices([randomIndex]);
      setGuess("");
      setShowHint(false);
      setFeedback(null);
    }, 0);
  };

  if (gameComplete) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
        {/* Decorative top element */}
        <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

        <div className="max-w-md w-full text-center">
          {/* Header */}
          <div className="mb-10">
            <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
              Congratulations
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-3 italic">
              Game Complete!
            </h1>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-wedding-gold/10">
            <p className="text-wedding-gray text-sm mb-4">Your final score</p>
            <p className="text-6xl font-serif text-wedding-wine mb-2">{score}</p>
            <p className="text-wedding-gold text-sm uppercase tracking-wider">points</p>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleRestart}
                className="w-full px-6 py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium"
              >
                Play Again
              </button>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Decorative bottom element */}
        <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      {/* Decorative top element */}
      <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-10">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            Secret Game
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-3 italic">
            Word Scramble
          </h1>
          <div className="flex items-center justify-center gap-4 text-wedding-charcoal">
            <span className="h-px w-12 bg-wedding-gold/50"></span>
            <p className="text-sm tracking-wider">Unscramble the wedding words</p>
            <span className="h-px w-12 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* Progress & Score */}
        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-wedding-gray text-sm">
            Word {usedIndices.length} of {WEDDING_WORDS.length}
          </span>
          <span className="text-wedding-wine font-medium">
            Score: {score}
          </span>
        </div>

        {/* Game Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border transition-all duration-200 ${
            feedback === "correct"
              ? "border-green-400 bg-green-50/50"
              : feedback === "wrong"
              ? "border-red-300 animate-shake"
              : "border-wedding-gold/10"
          }`}
        >
          {/* Scrambled Word */}
          <div className="mb-8">
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-4">
              Unscramble this word
            </p>
            <p className="text-4xl md:text-5xl font-serif text-wedding-wine tracking-[0.2em]">
              {scrambled}
            </p>
          </div>

          {/* Hint */}
          {showHint && (
            <div className="mb-6 p-4 bg-wedding-cream rounded-xl border border-wedding-gold/20">
              <p className="text-wedding-charcoal text-sm">
                <span className="text-wedding-gold">Hint:</span> {currentWord.hint}
              </p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              placeholder="Your answer"
              className="w-full px-5 py-3.5 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold text-wedding-charcoal placeholder:text-wedding-gray/70 transition-all text-center text-xl uppercase tracking-wider"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium"
            >
              Check Answer
            </button>
          </form>

          {/* Actions */}
          <div className="flex justify-center gap-6 mt-6">
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="text-wedding-gray hover:text-wedding-wine text-sm transition-colors"
              >
                Show Hint (-5 pts)
              </button>
            )}
            <button
              onClick={handleSkip}
              className="text-wedding-gray hover:text-wedding-wine text-sm transition-colors"
            >
              Skip Word
            </button>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Decorative bottom element */}
      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </main>
  );
}
