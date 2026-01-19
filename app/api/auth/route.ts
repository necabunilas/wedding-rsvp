import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, setAuthenticated, isAuthenticated, clearAuthentication } from "@/lib/auth";

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === getAdminPassword()) {
      await setAuthenticated();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAuthentication();
  return NextResponse.json({ success: true });
}
