import { NextRequest, NextResponse } from "next/server";
import { searchGuests, getGuestById } from "@/lib/guests";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const id = searchParams.get("id");

  if (id) {
    const guest = getGuestById(id);
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    return NextResponse.json({ guest });
  }

  if (!query) {
    return NextResponse.json({ guests: [] });
  }

  const guests = searchGuests(query);
  return NextResponse.json({ guests });
}
