import { NextRequest, NextResponse } from "next/server";
import { requireRole, logTeamAudit } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow } from "@/lib/supabase";
import { syncToGoogleSheets } from "@/lib/sheets";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: "GOOGLE_SHEETS_SCRIPT_URL is not configured in .env.local.",
      }, { status: 400 });
    }

    // Fetch all participants
    const { data: students, error } = await supabaseAdmin.from("students").select("*");
    if (error || !students) {
      return NextResponse.json({ success: false, error: "Failed to read database records." }, { status: 500 });
    }

    const rows = students as StudentRow[];
    let synced = 0;
    let failed = 0;

    for (const s of rows) {
      const ok = await syncToGoogleSheets({
        action: "register",
        agentId: s.agent_id,
        name: s.name,
        prn: s.prn,
        email: s.email,
        phone: s.phone || "",
        college: s.college || "",
        teamName: s.team_name || "",
        teamSize: s.team_size || "",
        domain: s.domain,
        points: s.points || 0,
        dashboardUrl: `/dashboard/${s.agent_id}`,
      });

      if (ok) synced++;
      else failed++;
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "GOOGLE_SHEETS_SYNC",
      targetId: "ALL_RECORDS",
      details: { totalRecords: rows.length, syncedCount: synced, failedCount: failed },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${synced} records synced to Google Sheets (${failed} failed).`,
      totalRecords: rows.length,
      synced,
      failed,
    });
  } catch (err) {
    console.error("Sync API exception:", err);
    return NextResponse.json({ success: false, error: "Internal sync error." }, { status: 500 });
  }
}
