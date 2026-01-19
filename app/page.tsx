"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Guest } from "@/types";

const MIN_CHARS = 2; // Minimum characters before showing suggestions

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-search as user types
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmedQuery = query.trim();

    // Clear results if query is too short
    if (trimmedQuery.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Debounce the search
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guests?q=${encodeURIComponent(trimmedQuery)}`);
        const data = await res.json();
        setResults(data.guests || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      {/* Decorative top element */}
      <div className="mb-8 text-wedding-gold text-4xl tracking-widest">✦</div>

      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-10">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            You&apos;re Invited
          </p>
          <h1 className="text-5xl md:text-6xl font-serif text-wedding-wine mb-3 italic">
            Nic & Ban
          </h1>
          <div className="flex items-center justify-center gap-4 text-wedding-charcoal">
            <span className="h-px w-12 bg-wedding-gold/50"></span>
            <p className="text-sm tracking-wider uppercase">June 20, 2026</p>
            <span className="h-px w-12 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-wedding-gold/10">
          <p className="text-wedding-gray text-sm mb-6">
            Enter your name to RSVP for the celebration
          </p>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-5 py-3.5 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold text-wedding-charcoal placeholder:text-wedding-gray/70 transition-all"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-wedding-gold/30 border-t-wedding-gold rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {query.trim().length >= MIN_CHARS && results.length === 0 && !loading && (
            <p className="mt-6 text-wedding-gray text-sm">
              No guests found. Please check the spelling and try again.
            </p>
          )}

          {results.length > 0 && (
            <div className="mt-8 space-y-3">
              <p className="text-xs text-wedding-gray uppercase tracking-wider mb-4">
                Select your name
              </p>
              {results.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => router.push(`/rsvp/${guest.id}`)}
                  className="w-full text-left px-5 py-4 bg-wedding-cream hover:bg-wedding-gold-light rounded-xl transition-all duration-200 border border-wedding-gold/20 hover:border-wedding-gold/50 group"
                >
                  <span className="font-medium text-wedding-charcoal group-hover:text-wedding-wine transition-colors">
                    {guest.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/details"
          className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
        >
          <span>View Event Details</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Decorative bottom element */}
      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
    </main>
  );
}
