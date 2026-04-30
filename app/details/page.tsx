import Link from "next/link";
import { getEventDetails } from "@/lib/guests";

export default function DetailsPage() {
  const event = getEventDetails();

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ceremonyMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}, ${event.address}`
  )}`;

  const receptionMapsUrl = event.receptionVenue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.receptionVenue}, ${event.receptionAddress || event.address}`
      )}`
    : null;

  return (
    <main className="min-h-screen py-12 px-6 md:px-8">
      {/* Decorative top */}
      <div className="text-center mb-8">
        <div className="text-wedding-gold text-4xl">✦</div>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-wedding-gold uppercase tracking-[0.3em] text-xs mb-3">
            Wedding Celebration
          </p>
          <h1 className="text-5xl md:text-6xl font-serif text-wedding-wine mb-3 italic">
            {event.coupleName}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-wedding-gold/50"></span>
            <span className="text-wedding-gold text-xl">♥</span>
            <span className="h-px w-12 bg-wedding-gold/50"></span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-wedding-gold/10">
          {/* Date Banner */}
          <div className="bg-wedding-wine text-white py-8 px-8 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+')]"></div>
            <p className="text-lg font-medium relative">{formattedDate}</p>
            <p className="text-wedding-gold text-2xl font-serif mt-1 relative">{event.time}</p>
          </div>

          {/* Details */}
          <div className="p-10 md:p-12 space-y-10">
            {/* Ceremony Venue */}
            <section className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mb-5">
                <span className="text-2xl">⛪</span>
              </div>
              <h2 className="text-xs font-medium text-wedding-gold uppercase tracking-[0.25em] mb-3">
                Ceremony
              </h2>
              <p className="text-2xl font-serif text-wedding-wine">{event.venue}</p>
              <p className="text-wedding-gray text-sm mt-2">{event.address}</p>
              <p className="text-wedding-charcoal text-sm mt-3 font-medium">{event.time}</p>
              <a
                href={ceremonyMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
              >
                <span>View on Google Maps</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </section>

            {event.receptionVenue && (
              <>
                <div className="h-px bg-wedding-gold/20 mx-8"></div>

                {/* Reception Venue */}
                <section className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mb-5">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h2 className="text-xs font-medium text-wedding-gold uppercase tracking-[0.25em] mb-3">
                    Reception
                  </h2>
                  <p className="text-2xl font-serif text-wedding-wine">{event.receptionVenue}</p>
                  <p className="text-wedding-gray text-sm mt-2">{event.receptionAddress || event.address}</p>
                  <p className="text-wedding-charcoal text-sm mt-3 font-medium">Following the ceremony</p>
                  {receptionMapsUrl && (
                    <a
                      href={receptionMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-wedding-wine hover:text-wedding-gold text-sm transition-colors group"
                    >
                      <span>View on Google Maps</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  )}
                </section>
              </>
            )}

            <div className="h-px bg-wedding-gold/20 mx-8"></div>

            {/* Dress Code */}
            <section className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mb-5">
                <span className="text-2xl">👗</span>
              </div>
              <h2 className="text-xs font-medium text-wedding-gold uppercase tracking-[0.25em] mb-3">
                Dress Code
              </h2>

              <p className="text-wedding-charcoal text-base mt-2">
                Feel free to wear anything you&rsquo;re comfortable in that&rsquo;s within the color palette below:
              </p>

              <div className="mt-4 rounded-xl overflow-hidden bg-white border border-wedding-gold/10">
                <img
                  src="/IMG_5718.jpeg"
                  alt="Wedding color palette: Crimson Bloom, Soft Lilac, Antique Petal, Butter, Citron"
                  className="w-full h-auto"
                />
              </div>

              <p className="text-wedding-charcoal text-base mt-10">
                Here are sample attires if you need ideas:
              </p>

              <div className="mt-4">
                <img
                  src="/IMG_5715.png"
                  alt="Dress code attire inspiration"
                  className="w-full h-auto"
                />
              </div>

              <p className="italic font-bold text-wedding-wine text-sm mt-6">
                For the ceremony, we kindly request you bring a cover-up if your dress is too revealing (as per the church&rsquo;s guidelines).
              </p>
            </section>

            <div className="h-px bg-wedding-gold/20 mx-8"></div>

            {/* Church Guidelines */}
            <section className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mb-5">
                <span className="text-2xl">🕊️</span>
              </div>
              <h2 className="text-xs font-medium text-wedding-gold uppercase tracking-[0.25em] mb-3">
                Church Guidelines
              </h2>
              <p className="text-wedding-gray text-sm mt-2 mb-6">
                A few kind reminders for the ceremony
              </p>

              <ul className="text-left text-wedding-charcoal text-sm space-y-3 max-w-md mx-auto">
                <li className="flex gap-3">
                  <span className="text-wedding-gold mt-0.5">•</span>
                  <span>Please arrive 15–30 minutes before the ceremony to settle in.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-wedding-gold mt-0.5">•</span>
                  <span>Kindly put your phones and devices on silent mode during the ceremony.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-wedding-gold mt-0.5">•</span>
                  <span>As much as possible, please let our official photographers and videographers capture the moment, especially during the ceremony. Live in the moment. Put the phone down :)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-wedding-gold mt-0.5">•</span>
                  <span>To keep the ceremony intimate, children can go outside the church to run around and be children…with parental guidance, of course.</span>
                </li>
              </ul>
            </section>

            <div className="h-px bg-wedding-gold/20 mx-8"></div>

            {/* RSVP Deadline */}
            <section className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-wedding-gold-light mb-5">
                <span className="text-2xl">⏰</span>
              </div>
              <h2 className="text-xs font-medium text-wedding-gold uppercase tracking-[0.25em] mb-3">
                Please Respond By
              </h2>
              <p className="text-2xl font-serif text-wedding-wine">
                {new Date(event.rsvpDeadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </section>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-block py-4 px-12 bg-wedding-wine text-white rounded-xl hover:bg-wedding-gold transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            RSVP Now
          </Link>
        </div>

        {/* Footer decoration */}
        <div className="text-center mt-12 text-wedding-gold/50 text-2xl tracking-widest">
          ✦ ✦ ✦
        </div>
      </div>
    </main>
  );
}
