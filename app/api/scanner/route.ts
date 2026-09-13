import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncToGoogleSheets } from "@/lib/sheets";
import { cleanText, getClientIp, rateLimit, requireOrganizerAuth } from "@/lib/security";

// Hard ceiling for a single award — well above the UI presets (50/100/150/250)
// so legitimate custom values still work, but a spoofed/typo'd huge number
// can never be written.
const MAX_POINTS_PER_AWARD = 500;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }
    const { action, identifier, qrData, points, activityTitle, scannedBy } = body as Record<string, unknown>;

    // ACTION: AUTH-CHECK (Fast, harmless verification of organizer passcode)
    if (action === "auth-check") {
      const authError = requireOrganizerAuth(req);
      if (authError) return authError;
      return NextResponse.json({ success: true, message: "Organizer credentials verified." });
    }

    // Only "lookup" is safe for an unauthenticated scan (used to preview an
    // agent's card before deciding to award). Any action that mutates state
    // ("award") — and the bulk "verify" endpoint used for the same purpose —
    // requires a valid organizer token so random visitors can't self-award.
    if (action === "award") {
      const authError = requireOrganizerAuth(req);
      if (authError) return authError;

      const limited = rateLimit(`scanner-award:${getClientIp(req)}`, {
        limit: 60,
        windowMs: 60 * 1000,
      });
      if (limited) return limited;
    } else {
      const limited = rateLimit(`scanner-lookup:${getClientIp(req)}`, {
        limit: 30,
        windowMs: 60 * 1000,
      });
      if (limited) return limited;
    }

    // Parse identifier from raw QR data if provided
    let targetId = typeof identifier === "string" ? identifier : "";
    if (typeof qrData === "string" && qrData) {
      try {
        const parsed = JSON.parse(qrData);
        targetId = parsed.id || parsed.prn || qrData;
      } catch {
        // If not JSON, it might be URL or direct agentId
        const match = qrData.match(/TECH15-[A-Z]+-\d+/i) || qrData.match(/dashboard\/([^/?#]+)/i);
        if (match) {
          targetId = match[1] || match[0];
        } else {
          targetId = qrData;
        }
      }
    }
    targetId = cleanText(targetId, 64);

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "QR code data or participant identifier is required." },
        { status: 400 }
      );
    }

    // ACTION: LOOKUP / VERIFY
    if (action === "lookup" || action === "verify") {
      const participant = db.getParticipantById(targetId);
      if (!participant) {
        return NextResponse.json(
          { success: false, error: `No agent found matching '${targetId}'.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        participant,
      });
    }

    // ACTION: AWARD POINTS (organizer-authenticated above)
    if (action === "award") {
      const numPoints = parseInt(String(points), 10);
      if (isNaN(numPoints) || numPoints <= 0) {
        return NextResponse.json(
          { success: false, error: "Valid positive points value required." },
          { status: 400 }
        );
      }
      if (numPoints > MAX_POINTS_PER_AWARD) {
        return NextResponse.json(
          {
            success: false,
            error: `Points per award are capped at ${MAX_POINTS_PER_AWARD}. Award multiple times for larger totals.`,
          },
          { status: 400 }
        );
      }

      const title = cleanText(activityTitle, 100) || "Stall Challenge Victory";
      const coordinator = cleanText(scannedBy, 60) || "Stall Coordinator";

      const result = await db.awardPoints(targetId, numPoints, title, coordinator);
      if (!result) {
        return NextResponse.json(
          { success: false, error: `Unable to award points. Agent '${targetId}' not found.` },
          { status: 404 }
        );
      }

      // Sync point allocation to Google Sheets webhook
      syncToGoogleSheets({
        action: "award_points",
        agentId: result.participant.agentId,
        prn: result.participant.prn,
        name: result.participant.name,
        activityTitle: title,
        pointsAwarded: numPoints,
        totalPoints: result.participant.points,
        scannedBy: coordinator,
      }).catch((err) => console.error("Sheet award sync error:", err));

      return NextResponse.json({
        success: true,
        participant: result.participant,
        activity: result.activity,
        message: `Awarded +${numPoints} PTS to ${result.participant.name}!`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action specified. Must be 'lookup' or 'award'." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Scanner API error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
