"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
      {/* Decorative top */}
      <div className="text-wedding-gold text-4xl mb-8">✦</div>

      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            Wedding RSVP
          </p>
          <h1 className="text-4xl font-serif text-wedding-wine italic">
            Admin Portal
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-wedding-gold/10">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mx-auto mb-6">
            <span className="text-2xl">🔐</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-wedding-gray uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-wedding-cream border border-wedding-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 focus:border-wedding-gold text-wedding-charcoal placeholder:text-wedding-gray/70 transition-all"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Decorative bottom */}
      <div className="mt-12 text-wedding-gold/50 text-2xl tracking-widest">✦ ✦ ✦</div>
    </main>
  );
}
