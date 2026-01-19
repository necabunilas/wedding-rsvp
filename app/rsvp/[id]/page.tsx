"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Guest, RsvpResponse } from "@/types";

export default function RsvpPage() {
  const params = useParams();
  const guestId = params.id as string;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<RsvpResponse | null>(null);
  const [seatsConfirmed, setSeatsConfirmed] = useState<number>(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch guest info
        const guestRes = await fetch(`/api/guests?id=${guestId}`);
        if (!guestRes.ok) {
          setError("Guest not found");
          setLoading(false);
          return;
        }
        const guestData = await guestRes.json();
        setGuest(guestData.guest);
        setSeatsConfirmed(guestData.guest.seatsAllocated);

        // Fetch existing RSVP if any
        const rsvpRes = await fetch(`/api/rsvp?guestId=${guestId}`);
        if (rsvpRes.ok) {
          const rsvpData = await rsvpRes.json();
          if (rsvpData.rsvp) {
            setExistingRsvp(rsvpData.rsvp);
            setSeatsConfirmed(rsvpData.rsvp.seatsConfirmed);
            setDietaryRestrictions(rsvpData.rsvp.dietaryRestrictions || "");
          }
        }
      } catch (err) {
        setError("Failed to load guest information");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [guestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          seatsConfirmed,
          dietaryRestrictions,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit RSVP");
      }

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-wedding-gold/30 border-t-wedding-gold rounded-full animate-spin"></div>
          <p className="text-wedding-charcoal text-sm">Loading your invitation...</p>
        </div>
      </main>
    );
  }

  if (error && !guest) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-wedding-gold text-4xl mb-6">✦</div>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/" className="text-wedding-wine hover:text-wedding-gold underline">
          Go back to search
        </Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
        <div className="text-wedding-gold text-4xl mb-8">✦</div>
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-10 border border-wedding-gold/10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-wedding-gold-light flex items-center justify-center">
            <span className="text-4xl">
              {seatsConfirmed === 0 ? "💌" : "🎉"}
            </span>
          </div>
          <h1 className="text-3xl font-serif text-wedding-wine mb-3 italic">
            Thank You!
          </h1>
          <p className="text-wedding-charcoal font-medium text-lg mb-1">
            {guest?.name}
          </p>
          <p className="text-wedding-gray text-sm mb-6">
            Your RSVP has been {existingRsvp ? "updated" : "received"}
          </p>
          <div className="py-4 px-6 bg-wedding-cream rounded-xl mb-8">
            <p className="text-wedding-charcoal">
              {seatsConfirmed === 0
                ? "We'll miss you at the celebration"
                : (
                  <>
                    <span className="text-3xl font-serif text-wedding-wine">{seatsConfirmed}</span>
                    <span className="text-wedding-gray ml-2">
                      {seatsConfirmed === 1 ? "guest" : "guests"} attending
                    </span>
                  </>
                )}
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/details"
              className="block w-full py-3 px-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-colors font-medium"
            >
              View Event Details
            </Link>
            <Link
              href="/"
              className="block w-full py-3 px-4 border border-wedding-gold/30 text-wedding-wine rounded-xl hover:bg-wedding-gold/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      <div className="text-wedding-gold text-4xl mb-8">✦</div>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-2 italic">
            Nic & Ban
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-wedding-gold/50"></span>
            <p className="text-sm text-wedding-charcoal tracking-wider uppercase">June 20, 2026</p>
            <span className="h-px w-8 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* RSVP Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-wedding-gold/10">
          <div className="text-center mb-8">
            <p className="text-xs text-wedding-gold uppercase tracking-[0.2em] mb-2">
              You&apos;re Invited
            </p>
            <h2 className="text-2xl font-serif text-wedding-wine italic">
              {guest?.name}
            </h2>
            <p className="text-wedding-gray text-sm mt-2">
              {guest?.seatsAllocated}{" "}
              {guest?.seatsAllocated === 1 ? "seat" : "seats"} reserved
            </p>
            {existingRsvp && (
              <p className="text-wedding-gold text-xs mt-3 px-3 py-1 bg-wedding-gold/10 rounded-full inline-block">
                Update your previous response
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-medium text-wedding-gray uppercase tracking-wider mb-4 text-center">
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setSeatsConfirmed(guest?.seatsAllocated || 0)}
                  className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                    seatsConfirmed === guest?.seatsAllocated
                      ? "bg-wedding-wine text-white border-wedding-wine shadow-lg"
                      : "border-wedding-gold/30 hover:border-wedding-gold bg-wedding-cream text-wedding-charcoal"
                  }`}
                >
                  <span className="block text-lg mb-1">Yes!</span>
                  <span className="text-xs opacity-80">All {guest?.seatsAllocated} attending</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeatsConfirmed(0)}
                  className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 ${
                    seatsConfirmed === 0
                      ? "bg-wedding-charcoal text-white border-wedding-charcoal shadow-lg"
                      : "border-wedding-gray/30 hover:border-wedding-gray bg-wedding-off-white text-wedding-charcoal"
                  }`}
                >
                  <span className="block text-lg mb-1">Sorry</span>
                  <span className="text-xs opacity-80">Can&apos;t make it</span>
                </button>
              </div>
              {guest && guest.seatsAllocated > 1 && seatsConfirmed > 0 && (
                <div className="mt-6 p-4 bg-wedding-cream rounded-xl">
                  <label className="block text-xs text-wedding-gray mb-3 text-center">
                    Number of guests attending
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max={guest.seatsAllocated}
                      value={seatsConfirmed}
                      onChange={(e) => setSeatsConfirmed(Number(e.target.value))}
                      className="flex-1 h-2 bg-wedding-gold/20 rounded-lg appearance-none cursor-pointer accent-wedding-wine"
                    />
                    <span className="text-2xl font-serif text-wedding-wine w-10 text-center">
                      {seatsConfirmed}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {seatsConfirmed > 0 && (
              <div>
                <label className="block text-xs font-medium text-wedding-gray uppercase tracking-wider mb-3">
                  Dietary Restrictions
                  <span className="normal-case tracking-normal font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g., vegetarian, allergies, etc."
                  rows={2}
                  className="w-full px-4 py-3 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold resize-none text-wedding-charcoal placeholder:text-wedding-gray/60"
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting...
                </span>
              ) : existingRsvp ? (
                "Update RSVP"
              ) : (
                "Confirm RSVP"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Search</span>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
    </main>
  );
}
