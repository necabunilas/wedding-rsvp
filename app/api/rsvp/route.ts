import { NextRequest, NextResponse } from "next/server";
import { getGuestById, saveRsvp, getRsvp } from "@/lib/guests";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const guestId = searchParams.get("guestId");

  if (!guestId) {
    return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
  }

  try {
    const rsvp = await getRsvp(guestId);
    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error("Error fetching RSVP:", error);
    return NextResponse.json({ rsvp: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, seatsConfirmed, dietaryRestrictions } = body;

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID required" }, { status: 400 });
    }

    const guest = getGuestById(guestId);
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Validate seats confirmed
    const seats = Number(seatsConfirmed);
    if (isNaN(seats) || seats < 0 || seats > guest.seatsAllocated) {
      return NextResponse.json(
        { error: `Seats must be between 0 and ${guest.seatsAllocated}` },
        { status: 400 }
      );
    }

    const rsvp = await saveRsvp(guestId, seats, dietaryRestrictions || "");

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return NextResponse.json(
      { error: "Failed to save RSVP" },
      { status: 500 }
    );
  }
}
