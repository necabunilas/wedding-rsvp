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
  { word: "VANESSA", hint: "Bride" },
  { word: "FOREVER", hint: "How long love lasts" },
  { word: "LOVE", hint: "The reason for it all" },
  { word: "NICOLE", hint: "Groom" },
  { word: "CHAPEL", hint: "A place to wed" },
  { word: "HONEYMOON", hint: "Trip after the wedding" },
];

interface LeaderboardEntry {
  nickname: string;
  score: number;
  date: string;
}

function scrambleWord(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.join("") === word && word.length > 1) {
    return scrambleWord(word);
  }
  return arr.join("");
}

export default function GamesPage() {
  // Game state
  const [gameState, setGameState] = useState<"nickname" | "playing" | "complete">("nickname");
  const [nickname, setNickname] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
    }
  };

  const saveScore = async () => {
    if (scoreSaved) return;
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, score }),
      });
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      setScoreSaved(true);
    } catch (e) {
      console.error("Failed to save score:", e);
    }
  };

  const startGame = () => {
    if (!nickname.trim()) return;
    setGameState("playing");
    const randomIndex = Math.floor(Math.random() * WEDDING_WORDS.length);
    setCurrentIndex(randomIndex);
    setScrambled(scrambleWord(WEDDING_WORDS[randomIndex].word));
    setUsedIndices([randomIndex]);
  };

  const getNextWord = () => {
    const availableIndices = WEDDING_WORDS.map((_, i) => i).filter(
      (i) => !usedIndices.includes(i)
    );
    if (availableIndices.length === 0) {
      setGameState("complete");
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

  // Save score when game completes
  useEffect(() => {
    if (gameState === "complete" && !scoreSaved) {
      saveScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

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
    setScoreSaved(false);
    setGameState("playing");
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

  // Leaderboard Component
  const LeaderboardPanel = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-wedding-gold/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-wedding-wine">Leaderboard</h2>
        <button
          onClick={() => setShowLeaderboard(false)}
          className="text-wedding-gray hover:text-wedding-wine text-sm"
        >
          Close
        </button>
      </div>
      {leaderboard.length === 0 ? (
        <p className="text-wedding-gray text-sm text-center py-4">
          No scores yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl ${
                index === 0
                  ? "bg-wedding-gold/20"
                  : index === 1
                  ? "bg-wedding-gold/10"
                  : index === 2
                  ? "bg-wedding-gold/5"
                  : "bg-wedding-cream"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0
                      ? "bg-wedding-gold text-white"
                      : index === 1
                      ? "bg-gray-400 text-white"
                      : index === 2
                      ? "bg-amber-600 text-white"
                      : "bg-wedding-gray/20 text-wedding-gray"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-wedding-charcoal">
                  {entry.nickname}
                </span>
              </div>
              <span className="text-wedding-wine font-medium">{entry.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Nickname Entry Screen
  if (gameState === "nickname") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
        <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

        <div className="max-w-md w-full text-center">
          <div className="mb-10">
            <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
              Secret Game
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-3 italic">
              Word Scramble
            </h1>
            <div className="flex items-center justify-center gap-4 text-wedding-charcoal">
              <span className="h-px w-12 bg-wedding-gold/50"></span>
              <p className="text-sm tracking-wider">Unscramble wedding words</p>
              <span className="h-px w-12 bg-wedding-gold/50"></span>
            </div>
          </div>

          {showLeaderboard ? (
            <LeaderboardPanel />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-wedding-gold/10">
              <p className="text-wedding-gray text-sm mb-6">
                Enter your nickname to start playing
              </p>
              <form onSubmit={(e) => { e.preventDefault(); startGame(); }} className="space-y-4">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  maxLength={20}
                  className="w-full px-5 py-3.5 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold text-wedding-charcoal placeholder:text-wedding-gray/70 transition-all text-center"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!nickname.trim()}
                  className="w-full py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Game
                </button>
              </form>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="mt-4 text-wedding-wine hover:text-wedding-gold text-sm transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
      </main>
    );
  }

  // Game Complete Screen
  if (gameState === "complete") {
    const playerRank = leaderboard.findIndex(e => e.nickname === nickname && e.score === score) + 1;

    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
        <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

        <div className="max-w-md w-full text-center">
          <div className="mb-10">
            <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
              Congratulations
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-3 italic">
              Game Complete!
            </h1>
          </div>

          {showLeaderboard ? (
            <LeaderboardPanel />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-wedding-gold/10">
              <p className="text-wedding-gray text-sm mb-2">Well done, {nickname}!</p>
              <p className="text-6xl font-serif text-wedding-wine mb-2">{score}</p>
              <p className="text-wedding-gold text-sm uppercase tracking-wider mb-2">points</p>
              {playerRank > 0 && playerRank <= 10 && (
                <p className="text-wedding-charcoal text-sm">
                  You ranked <span className="font-medium text-wedding-wine">#{playerRank}</span> on the leaderboard!
                </p>
              )}

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleRestart}
                  className="w-full px-6 py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full px-6 py-4 bg-wedding-cream text-wedding-charcoal rounded-xl hover:bg-wedding-gold/20 transition-all duration-200 font-medium border border-wedding-gold/20"
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
      </main>
    );
  }

  // Playing Screen
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

      <div className="max-w-md w-full text-center">
        <div className="mb-10">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            Playing as {nickname}
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

        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-wedding-gray text-sm">
            Word {usedIndices.length} of {WEDDING_WORDS.length}
          </span>
          <span className="text-wedding-wine font-medium">Score: {score}</span>
        </div>

        <div
          className={`bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border transition-all duration-200 ${
            feedback === "correct"
              ? "border-green-400 bg-green-50/50"
              : feedback === "wrong"
              ? "border-red-300 animate-shake"
              : "border-wedding-gold/10"
          }`}
        >
          <div className="mb-8">
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-4">
              Unscramble this word
            </p>
            <p className="text-4xl md:text-5xl font-serif text-wedding-wine tracking-[0.2em]">
              {scrambled}
            </p>
          </div>

          {showHint && (
            <div className="mb-6 p-4 bg-wedding-cream rounded-xl border border-wedding-gold/20">
              <p className="text-wedding-charcoal text-sm">
                <span className="text-wedding-gold">Hint:</span> {currentWord.hint}
              </p>
            </div>
          )}

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
