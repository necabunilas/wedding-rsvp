import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  nickname: string;
  score: number;
  date: string;
}

const LEADERBOARD_FILE = path.join(process.cwd(), "data", "leaderboard.json");
const MAX_ENTRIES = 10;

// Helper to read local leaderboard
function readLocalLeaderboard(): LeaderboardEntry[] {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading local leaderboard:", e);
  }
  return [];
}

// Helper to write local leaderboard
function writeLocalLeaderboard(entries: LeaderboardEntry[]) {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries, null, 2));
  } catch (e) {
    console.error("Error writing local leaderboard:", e);
  }
}

// GET - Fetch leaderboard
export async function GET() {
  try {
    // Try Vercel KV first
    const entries = await kv.get<LeaderboardEntry[]>("game-leaderboard");
    return NextResponse.json({ leaderboard: entries || [] });
  } catch {
    // Fall back to local file
    const entries = readLocalLeaderboard();
    return NextResponse.json({ leaderboard: entries });
  }
}

// POST - Add new score
export async function POST(request: Request) {
  try {
    const { nickname, score } = await request.json();

    if (!nickname || typeof score !== "number") {
      return NextResponse.json(
        { error: "Invalid nickname or score" },
        { status: 400 }
      );
    }

    const newEntry: LeaderboardEntry = {
      nickname: nickname.slice(0, 20), // Limit nickname length
      score,
      date: new Date().toISOString(),
    };

    try {
      // Try Vercel KV
      let entries = (await kv.get<LeaderboardEntry[]>("game-leaderboard")) || [];
      entries.push(newEntry);
      entries.sort((a, b) => b.score - a.score);
      entries = entries.slice(0, MAX_ENTRIES);
      await kv.set("game-leaderboard", entries);
      return NextResponse.json({ success: true, leaderboard: entries });
    } catch {
      // Fall back to local file
      let entries = readLocalLeaderboard();
      entries.push(newEntry);
      entries.sort((a, b) => b.score - a.score);
      entries = entries.slice(0, MAX_ENTRIES);
      writeLocalLeaderboard(entries);
      return NextResponse.json({ success: true, leaderboard: entries });
    }
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}
