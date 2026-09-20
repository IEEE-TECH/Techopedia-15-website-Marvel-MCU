import { NextRequest, NextResponse } from "next/server";
import { requireTeamUser } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow, type PointTransactionRow } from "@/lib/supabase";
import { getGoogleSheetsWebhookUrl } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireTeamUser(req);
    if ("error" in authResult) return authResult.error;

    // 1. Fetch participants
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("registered_at", { ascending: false });

    if (studentsError) {
      console.error("Dashboard students query error:", studentsError);
    }

    const studentList = (students || []) as StudentRow[];
    const totalRegistrations = studentList.length;

    // Today's registrations
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();
    const todayRegistrations = studentList.filter(
      (s) => s.registered_at && s.registered_at >= todayIso
    ).length;

    // Checked-in count
    const checkedInCount = studentList.filter((s) => s.checked_in).length;

    // Total points
    const totalPointsAwarded = studentList.reduce((acc, curr) => acc + (curr.points || 0), 0);

    // 2. Domain breakdown
    const domainCounts: Record<string, number> = {
      "Debate Competition": 0,
      "Quiz Competition": 0,
      "Gun Game": 0,
      "National Symposium": 0,
    };

    studentList.forEach((s) => {
      const d = s.domain || "Debate Competition";
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    // 3. Fetch active team members count
    const { count: activeMembersCount } = await supabaseAdmin
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    // 4. Fetch recent transactions
    const { data: transactions } = await supabaseAdmin
      .from("point_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    // 5. System Health Telemetry
    const dbConnected = !studentsError;
    const sheetsConfigured = Boolean(getGoogleSheetsWebhookUrl());
    const mailerConfigured = Boolean(process.env.SMTP_USER || process.env.EMAIL_SERVER);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRegistrations,
        todayRegistrations,
        checkedInCount,
        checkedInPercentage:
          totalRegistrations > 0
            ? Math.round((checkedInCount / totalRegistrations) * 100)
            : 0,
        totalPointsAwarded,
        activeMembersCount: activeMembersCount || 0,
      },
      domainBreakdown: domainCounts,
      recentRegistrations: studentList.slice(0, 8).map((s) => ({
        id: s.id,
        agentId: s.agent_id,
        name: s.name,
        prn: s.prn,
        domain: s.domain,
        points: s.points,
        teamName: s.team_name,
        checkedIn: Boolean(s.checked_in),
        registeredAt: s.registered_at,
      })),
      recentTransactions: ((transactions || []) as PointTransactionRow[]).map((t) => ({
        id: t.id,
        agentId: t.agent_id,
        points: t.points,
        reason: t.reason,
        awardedBy: t.awarded_by,
        createdAt: t.created_at,
      })),
      systemHealth: {
        database: dbConnected ? "operational" : "degraded",
        googleSheets: sheetsConfigured ? "configured" : "unconfigured",
        mailer: mailerConfigured ? "operational" : "simulation_mode",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard metrics." },
      { status: 500 }
    );
  }
}
