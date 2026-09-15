import { NextRequest, NextResponse } from "next/server";
import { requireRole, logTeamAudit } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow } from "@/lib/supabase";
import { cleanText, getClientIp, rateLimit } from "@/lib/security";
import { syncToGoogleSheets } from "@/lib/sheets";

const MAX_POINTS_PER_AWARD = 500;

export async function POST(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["coordinator", "super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const limited = rateLimit(`team-award:${user.user_id}`, { limit: 40, windowMs: 60 * 1000 });
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid award payload." },
        { status: 400 }
      );
    }

    const { identifier, points, reason, eventId } = body as Record<string, unknown>;
    const cleanId = cleanText(identifier, 64);
    const cleanReason = cleanText(reason, 120);
    const cleanEventId = cleanText(eventId, 40) || "STALL-AWARD";
    const numPoints = Number(points);

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Participant identifier (Agent ID, PRN, or Email) is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(numPoints) || numPoints <= 0 || numPoints > MAX_POINTS_PER_AWARD) {
      return NextResponse.json(
        {
          success: false,
          error: `Points must be a positive integer between 1 and ${MAX_POINTS_PER_AWARD}.`,
        },
        { status: 400 }
      );
    }

    if (!cleanReason || cleanReason.length < 3) {
      return NextResponse.json(
        { success: false, error: "A valid reason/activity description is required for point allocation." },
        { status: 400 }
      );
    }

    // 1. Fetch participant
    const { data: studentData, error: findError } = await supabaseAdmin
      .from("students")
      .select("*")
      .or(`agent_id.ilike.${cleanId},prn.ilike.${cleanId},email.ilike.${cleanId}`)
      .single();

    if (findError || !studentData) {
      return NextResponse.json(
        { success: false, error: `Participant '${cleanId}' not found in registry.` },
        { status: 404 }
      );
    }

    const student = studentData as StudentRow;
    const previousPoints = student.points || 0;
    const newTotalPoints = previousPoints + Math.round(numPoints);

    // 2. Update student points
    const { data: updatedStudent, error: updateError } = await supabaseAdmin
      .from("students")
      .update({ points: newTotalPoints })
      .eq("id", student.id)
      .select()
      .single();

    if (updateError || !updatedStudent) {
      return NextResponse.json(
        { success: false, error: "Failed to update participant points in database." },
        { status: 500 }
      );
    }

    // 3. Record point transaction
    const nowIso = new Date().toISOString();
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("point_transactions")
      .insert({
        agent_id: student.agent_id,
        event_id: cleanEventId,
        points: Math.round(numPoints),
        reason: cleanReason,
        awarded_by: `${user.name} (${user.role})`,
        created_at: nowIso,
      })
      .select()
      .single();

    if (txError) {
      console.error("Failed to insert transaction log:", txError);
    }

    // 4. Audit Log
    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "POINTS_AWARDED",
      targetId: String(student.agent_id),
      details: {
        pointsAwarded: Math.round(numPoints),
        previousPoints,
        newTotalPoints,
        reason: cleanReason,
        eventId: cleanEventId,
      },
      ip,
    });

    syncToGoogleSheets({
      action: "award_points",
      agentId: student.agent_id,
      prn: student.prn,
      name: student.name,
      activityTitle: cleanReason,
      pointsAwarded: Math.round(numPoints),
      totalPoints: newTotalPoints,
      scannedBy: `${user.name} (${user.role})`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `+${Math.round(numPoints)} Points successfully awarded to ${student.name}!`,
      participant: {
        id: updatedStudent.id,
        agentId: updatedStudent.agent_id,
        name: updatedStudent.name,
        prn: updatedStudent.prn,
        domain: updatedStudent.domain,
        points: updatedStudent.points,
      },
      transaction,
    });
  } catch (err) {
    console.error("Points API exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal point allocation error." },
      { status: 500 }
    );
  }
}
