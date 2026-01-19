import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { getGuestsWithRsvp, getGuests } from "@/lib/guests";
import AdminDashboard from "@/components/AdminDashboard";
import ClearRsvpsButton from "@/components/ClearRsvpsButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  let guests;
  let error = null;

  try {
    guests = await getGuestsWithRsvp();
  } catch (e) {
    // Vercel KV not configured - show guests without RSVP data
    error = "Vercel KV not configured. RSVP data unavailable.";
    guests = getGuests().map((g) => ({
      ...g,
      seatsConfirmed: null,
      dietaryRestrictions: "",
      respondedAt: null,
    }));
  }

  // Calculate stats
  const totalAllocated = guests.reduce((sum, g) => sum + g.seatsAllocated, 0);
  const responded = guests.filter((g) => g.respondedAt !== null);
  const attending = responded.filter((g) => (g.seatsConfirmed ?? 0) > 0);
  const declined = responded.filter((g) => g.seatsConfirmed === 0);
  const noResponse = guests.filter((g) => g.respondedAt === null);
  const totalConfirmed = guests.reduce(
    (sum, g) => sum + (g.seatsConfirmed ?? 0),
    0
  );

  return (
    <main className="min-h-screen py-12 px-6 md:px-8">
      {/* Decorative top */}
      <div className="text-center mb-8">
        <div className="text-wedding-gold text-4xl">✦</div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            Wedding RSVP
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-wedding-wine mb-3 italic">
            Admin Dashboard
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-wedding-gold/50"></span>
            <span className="text-wedding-gold text-xl">♥</span>
            <span className="h-px w-12 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <a
            href="/api/admin/export"
            className="px-6 py-3 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
          >
            Export to Excel
          </a>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-wedding-gold/30 rounded-xl hover:bg-wedding-gold/10 hover:border-wedding-gold/50 transition-all duration-200 text-sm font-medium text-wedding-charcoal"
          >
            View Site
          </Link>
          <ClearRsvpsButton />
        </div>

        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm text-center">
            {error}
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-wedding-gold/10 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-wedding-gold-light mx-auto mb-3">
              <span className="text-xl">👥</span>
            </div>
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-1">Total Guests</p>
            <p className="text-3xl font-serif text-wedding-wine">{guests.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-wedding-gold/10 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-wedding-gold-light mx-auto mb-3">
              <span className="text-xl">💺</span>
            </div>
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-1">Seats Allocated</p>
            <p className="text-3xl font-serif text-wedding-wine">{totalAllocated}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-wedding-gold/10 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-3">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-1">Seats Confirmed</p>
            <p className="text-3xl font-serif text-green-600">{totalConfirmed}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-wedding-gold/10 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-wedding-gold-light mx-auto mb-3">
              <span className="text-xl">⏳</span>
            </div>
            <p className="text-xs text-wedding-gray uppercase tracking-wider mb-1">Awaiting Response</p>
            <p className="text-3xl font-serif text-wedding-gold">{noResponse.length}</p>
          </div>
        </div>

        {/* Response Summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-3xl font-serif text-green-700 mb-1">{attending.length}</p>
            <p className="text-sm text-green-600 font-medium">Attending</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-3xl font-serif text-red-700 mb-1">{declined.length}</p>
            <p className="text-sm text-red-600 font-medium">Declined</p>
          </div>
          <div className="bg-wedding-gold/10 border border-wedding-gold/30 rounded-2xl p-6 text-center">
            <p className="text-3xl font-serif text-wedding-gold mb-1">{noResponse.length}</p>
            <p className="text-sm text-wedding-gold font-medium">No Response</p>
          </div>
        </div>

        <AdminDashboard guests={guests} />
      </div>

      {/* Decorative bottom */}
      <div className="text-center mt-12 text-wedding-gold/50 text-2xl tracking-widest">
        ✦ ✦ ✦
      </div>
    </main>
  );
}
