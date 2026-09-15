import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const participants = await db.getParticipants();
    const activities = await db.getRecentActivities(25);

    // Calculate domain breakdown
    const domainStats: Record<string, number> = {};
    participants.forEach((p) => {
      domainStats[p.domain] = (domainStats[p.domain] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      totalParticipants: participants.length,
      participants,
      activities,
      domainStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Leaderboard API error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
