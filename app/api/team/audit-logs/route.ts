import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/teamAuth";
import { supabaseAdmin } from "@/lib/supabase";
import { cleanText } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["coordinator", "super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { searchParams } = new URL(req.url);
    const actionFilter = cleanText(searchParams.get("action") || "", 40);
    const userFilter = cleanText(searchParams.get("user") || "", 60).toLowerCase();
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 50));

    let query = supabaseAdmin
      .from("team_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (actionFilter && actionFilter !== "ALL") {
      query = query.eq("action", actionFilter);
    }

    const { data: logs, error } = await query;
    if (error) {
      console.error("Audit query error:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch audit logs." }, { status: 500 });
    }

    let results = logs || [];
    if (userFilter) {
      results = results.filter(
        (l) =>
          (l.user_name && l.user_name.toLowerCase().includes(userFilter)) ||
          (l.user_email && l.user_email.toLowerCase().includes(userFilter)) ||
          (l.target_id && l.target_id.toLowerCase().includes(userFilter))
      );
    }

    return NextResponse.json({
      success: true,
      logs: results,
    });
  } catch (err) {
    console.error("Audit logs API exception:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
