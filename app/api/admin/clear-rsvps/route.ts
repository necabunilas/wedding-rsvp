import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { getGuests } from "@/lib/guests";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guests = getGuests();
    let deletedCount = 0;

    // Delete RSVP for each guest
    for (const guest of guests) {
      const key = `rsvp:${guest.id}`;
      const existed = await kv.del(key);
      if (existed) deletedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount} RSVPs`
    });
  } catch (error) {
    console.error("Error clearing RSVPs:", error);
    return NextResponse.json(
      { error: "Failed to clear RSVPs" },
      { status: 500 }
    );
  }
}
