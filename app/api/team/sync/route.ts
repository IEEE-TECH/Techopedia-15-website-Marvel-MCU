import { NextRequest, NextResponse } from "next/server";
import { requireRole, logTeamAudit, requireTeamUser } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow, type PointTransactionRow } from "@/lib/supabase";
import { syncToGoogleSheets, testGoogleSheetsConnection, getGoogleSheetsWebhookUrl } from "@/lib/sheets";
import { getClientIp } from "@/lib/security";

/**
 * GET: Check Google Sheets webhook configuration status & test connectivity
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireTeamUser(req);
    if ("error" in authResult) return authResult.error;

    const webhookUrl = getGoogleSheetsWebhookUrl();
    const isConfigured = Boolean(webhookUrl && webhookUrl.startsWith("http"));

    if (!isConfigured) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: "Google Sheets Webhook URL is not configured yet in .env.local",
      });
    }

    // Attempt test connection ping
    const testResult = await testGoogleSheetsConnection();

    return NextResponse.json({
      success: true,
      configured: true,
      webhookUrlMasked: webhookUrl ? `${webhookUrl.slice(0, 35)}...` : "",
      connected: testResult.success,
      testDetails: testResult.data || null,
      error: testResult.error || null,
    });
  } catch (err) {
    console.error("Sync GET status exception:", err);
    return NextResponse.json(
      { success: false, error: "Failed to check Google Sheets status." },
      { status: 500 }
    );
  }
}

/**
 * POST: Trigger full bulk synchronization of all Supabase records to Google Sheets
 */
export async function POST(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const webhookUrl = getGoogleSheetsWebhookUrl();
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured in .env.local.",
        },
        { status: 400 }
      );
    }

    // 1. Fetch all participants from Supabase
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("registered_at", { ascending: false });

    if (studentsError || !students) {
      return NextResponse.json(
        { success: false, error: "Failed to read database records from Supabase." },
        { status: 500 }
      );
    }

    // 2. Fetch point transactions from Supabase
    const { data: transactions, error: txError } = await supabaseAdmin
      .from("point_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (txError) {
      console.warn("Could not fetch transactions for bulk sync:", txError);
    }

    const studentRows = students as StudentRow[];
    const txRows = (transactions || []) as PointTransactionRow[];

    // Map student name lookup for transactions
    const studentNameMap = new Map<string, { name: string; prn: string }>();
    studentRows.forEach((s) => {
      studentNameMap.set(s.agent_id, { name: s.name, prn: s.prn });
    });

    // 3. Dispatch high-speed bulk sync payload to Google Sheets in 1 batch
    const syncRes = await syncToGoogleSheets({
      action: "bulk_sync",
      participants: studentRows.map((s) => ({
        agentId: s.agent_id,
        name: s.name,
        prn: s.prn,
        email: s.email,
        phone: s.phone || "",
        college: s.college || "",
        teamName: s.team_name || "",
        teamSize: s.team_size || "1",
        domain: s.domain,
        points: s.points || 0,
        checkedIn: Boolean(s.checked_in),
        checkedInAt: s.checked_in_at || null,
        checkedInBy: s.checked_in_by || null,
        dashboardUrl: `/dashboard/${s.agent_id}`,
        registeredAt: s.registered_at,
      })),
      transactions: txRows.map((t) => {
        const studentInfo = studentNameMap.get(t.agent_id);
        return {
          agentId: t.agent_id,
          prn: studentInfo?.prn || "",
          name: studentInfo?.name || t.agent_id,
          activityTitle: t.reason,
          pointsAwarded: t.points,
          totalPoints: 0,
          scannedBy: t.awarded_by,
          createdAt: t.created_at,
        };
      }),
    });

    if (!syncRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: syncRes.error || "Failed to push bulk data to Google Sheets webhook.",
        },
        { status: 502 }
      );
    }

    // 4. Record audit log
    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "GOOGLE_SHEETS_BULK_SYNC",
      targetId: "ALL_RECORDS",
      details: {
        totalParticipantsSynced: studentRows.length,
        totalTransactionsSynced: txRows.length,
      },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Full sync completed: ${studentRows.length} participants and ${txRows.length} point logs synchronized to Google Sheets!`,
      totalParticipants: studentRows.length,
      totalTransactions: txRows.length,
      details: syncRes.data,
    });
  } catch (err) {
    console.error("Sync API exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal bulk sync error." },
      { status: 500 }
    );
  }
}
