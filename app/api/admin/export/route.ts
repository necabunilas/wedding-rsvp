import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getGuestsWithRsvp, getGuests } from "@/lib/guests";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let guests;

  try {
    guests = await getGuestsWithRsvp();
  } catch (e) {
    // Vercel KV not configured - export guests without RSVP data
    guests = getGuests().map((g) => ({
      ...g,
      seatsConfirmed: null,
      dietaryRestrictions: "",
      respondedAt: null,
    }));
  }

  // Prepare data for Excel
  const data = guests.map((guest) => ({
    Name: guest.name,
    Email: guest.email || "",
    "Seats Allocated": guest.seatsAllocated,
    "Seats Confirmed": guest.seatsConfirmed ?? "",
    Status:
      guest.respondedAt === null
        ? "No Response"
        : guest.seatsConfirmed === 0
          ? "Declined"
          : "Attending",
    "Dietary Restrictions": guest.dietaryRestrictions || "",
    "Response Date": guest.respondedAt
      ? new Date(guest.respondedAt).toLocaleDateString()
      : "",
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Seats Allocated
    { wch: 15 }, // Seats Confirmed
    { wch: 12 }, // Status
    { wch: 25 }, // Dietary
    { wch: 15 }, // Response Date
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Guest List");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Return as downloadable file
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="wedding-rsvp-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
