import { NextRequest, NextResponse } from "next/server";
import { requireRole, logTeamAudit } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow } from "@/lib/supabase";
import { cleanText, getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["scanner", "coordinator", "super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { identifier, force } = body as Record<string, unknown>;
    const cleanId = cleanText(identifier, 64);

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Participant identifier (Agent ID, PRN, or Email) is required." },
        { status: 400 }
      );
    }

    // Find student in Supabase
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

    // Check duplicate check-in
    if (student.checked_in && !force) {
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        error: `Participant ${student.name} (${student.agent_id}) was ALREADY checked in on ${student.checked_in_at ? new Date(student.checked_in_at).toLocaleString() : "previously"}.`,
        participant: student,
      });
    }

    const nowIso = new Date().toISOString();
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("students")
      .update({
        checked_in: true,
        checked_in_at: nowIso,
        checked_in_by: `${user.name} (${user.role})`,
      })
      .eq("id", student.id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { success: false, error: "Failed to record check-in in database." },
        { status: 500 }
      );
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "PARTICIPANT_CHECKIN",
      targetId: String(student.agent_id),
      details: {
        participantName: student.name,
        prn: student.prn,
        domain: student.domain,
      },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Check-in confirmed for ${student.name}!`,
      participant: updated,
    });
  } catch (err) {
    console.error("Check-in API exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal check-in error." },
      { status: 500 }
    );
  }
}
