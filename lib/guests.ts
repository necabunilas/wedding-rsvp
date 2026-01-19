import guestData from "@/data/guests.json";
import type { Guest, GuestData, RsvpResponse, GuestWithRsvp, EventDetails } from "@/types";
import fs from "fs";
import path from "path";

// Check if Vercel KV is configured
const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Local file storage path for RSVPs (used when Vercel KV is not available)
const LOCAL_RSVP_FILE = path.join(process.cwd(), "data", "rsvps.json");

// Helper to read local RSVPs
function getLocalRsvps(): Record<string, RsvpResponse> {
  try {
    if (fs.existsSync(LOCAL_RSVP_FILE)) {
      const data = fs.readFileSync(LOCAL_RSVP_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading local RSVPs:", error);
  }
  return {};
}

// Helper to save local RSVPs
function saveLocalRsvps(rsvps: Record<string, RsvpResponse>): void {
  try {
    fs.writeFileSync(LOCAL_RSVP_FILE, JSON.stringify(rsvps, null, 2));
  } catch (error) {
    console.error("Error saving local RSVPs:", error);
  }
}

// Get all guests from the JSON file
export function getGuests(): Guest[] {
  return (guestData as GuestData).guests;
}

// Get event details from the JSON file
export function getEventDetails(): EventDetails {
  return (guestData as GuestData).eventDetails;
}

// Search guests by name (case-insensitive partial match)
export function searchGuests(query: string): Guest[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return getGuests().filter((guest) =>
    guest.name.toLowerCase().includes(normalizedQuery)
  );
}

// Get a single guest by ID
export function getGuestById(id: string): Guest | undefined {
  return getGuests().find((guest) => guest.id === id);
}

// Save RSVP response (uses Vercel KV in production, local file in development)
export async function saveRsvp(
  guestId: string,
  seatsConfirmed: number,
  dietaryRestrictions: string
): Promise<RsvpResponse> {
  const guest = getGuestById(guestId);
  const response: RsvpResponse = {
    guestId,
    guestName: guest?.name || "Unknown",
    seatsConfirmed,
    dietaryRestrictions,
    respondedAt: new Date().toISOString(),
  };

  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    await kv.set(`rsvp:${guestId}`, response);
  } else {
    // Use local file storage
    const rsvps = getLocalRsvps();
    rsvps[guestId] = response;
    saveLocalRsvps(rsvps);
  }

  return response;
}

// Get RSVP response (uses Vercel KV in production, local file in development)
export async function getRsvp(guestId: string): Promise<RsvpResponse | null> {
  if (isKvConfigured) {
    const { kv } = await import("@vercel/kv");
    return await kv.get<RsvpResponse>(`rsvp:${guestId}`);
  } else {
    // Use local file storage
    const rsvps = getLocalRsvps();
    return rsvps[guestId] || null;
  }
}

// Get all RSVP responses
export async function getAllRsvps(): Promise<RsvpResponse[]> {
  const guests = getGuests();
  const responses: RsvpResponse[] = [];

  for (const guest of guests) {
    const rsvp = await getRsvp(guest.id);
    if (rsvp) {
      responses.push(rsvp);
    }
  }

  return responses;
}

// Get all guests with their RSVP status merged
export async function getGuestsWithRsvp(): Promise<GuestWithRsvp[]> {
  const guests = getGuests();
  const guestsWithRsvp: GuestWithRsvp[] = [];

  for (const guest of guests) {
    const rsvp = await getRsvp(guest.id);
    guestsWithRsvp.push({
      ...guest,
      seatsConfirmed: rsvp?.seatsConfirmed ?? null,
      dietaryRestrictions: rsvp?.dietaryRestrictions ?? "",
      respondedAt: rsvp?.respondedAt ?? null,
    });
  }

  return guestsWithRsvp;
}
