"use client";

import { useState } from "react";
import type { GuestWithRsvp } from "@/types";

type FilterType = "all" | "attending" | "declined" | "no-response";

interface AdminDashboardProps {
  guests: GuestWithRsvp[];
}

export default function AdminDashboard({ guests }: AdminDashboardProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredGuests = guests.filter((guest) => {
    switch (filter) {
      case "attending":
        return guest.respondedAt && (guest.seatsConfirmed ?? 0) > 0;
      case "declined":
        return guest.respondedAt && guest.seatsConfirmed === 0;
      case "no-response":
        return !guest.respondedAt;
      default:
        return true;
    }
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-wedding-gold/10">
      {/* Filter Tabs */}
      <div className="p-6 border-b border-wedding-gold/10 bg-wedding-cream">
        <p className="text-xs text-wedding-gray uppercase tracking-wider mb-4 text-center">Filter Guests</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(
            [
              { key: "all", label: "All Guests" },
              { key: "attending", label: "Attending" },
              { key: "declined", label: "Declined" },
              { key: "no-response", label: "No Response" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "bg-wedding-wine text-white shadow-lg"
                  : "bg-white text-wedding-charcoal hover:bg-wedding-gold/20 border border-wedding-gold/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-wedding-off-white border-b border-wedding-gold/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Allocated
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Confirmed
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Dietary
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Responded
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-wedding-gray uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wedding-gold/10">
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="hover:bg-wedding-gold/5 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-wedding-charcoal">{guest.name}</td>
                <td className="px-6 py-4 text-sm text-wedding-charcoal text-center font-medium">
                  {guest.seatsAllocated}
                </td>
                <td className="px-6 py-4 text-sm text-wedding-charcoal text-center font-medium">
                  {guest.seatsConfirmed ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm text-wedding-gray max-w-xs truncate">
                  {guest.dietaryRestrictions || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-wedding-gray">
                  {formatDate(guest.respondedAt)}
                </td>
                <td className="px-6 py-4 text-center">
                  {!guest.respondedAt ? (
                    <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-wedding-gold/20 text-wedding-gold">
                      Pending
                    </span>
                  ) : guest.seatsConfirmed === 0 ? (
                    <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      Declined
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Attending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredGuests.length === 0 && (
        <div className="p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-wedding-gold-light mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-wedding-gray">No guests match this filter.</p>
        </div>
      )}
    </div>
  );
}
