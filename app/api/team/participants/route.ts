import { NextRequest, NextResponse } from "next/server";
import { requireRole, requireTeamUser, logTeamAudit } from "@/lib/teamAuth";
import { supabaseAdmin, type StudentRow } from "@/lib/supabase";
import { cleanText, getClientIp, isValidEmail, isValidPhone, isValidPrn } from "@/lib/security";
import { syncToGoogleSheets } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireTeamUser(req);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(req.url);
    const search = cleanText(searchParams.get("search") || "", 60).toLowerCase();
    const domainFilter = cleanText(searchParams.get("domain") || "", 40);
    const statusFilter = cleanText(searchParams.get("status") || "", 20); // "checked_in", "pending", "all"

    let query = supabaseAdmin
      .from("students")
      .select("*")
      .order("points", { ascending: false });

    if (domainFilter && domainFilter !== "ALL") {
      query = query.eq("domain", domainFilter);
    }

    if (statusFilter === "checked_in") {
      query = query.eq("checked_in", true);
    } else if (statusFilter === "pending") {
      query = query.eq("checked_in", false);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Participants query error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to query participants." },
        { status: 500 }
      );
    }

    let rows = (data || []) as StudentRow[];

    // In-memory filter for multi-field search
    if (search) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.prn.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.agent_id.toLowerCase().includes(search) ||
          (p.team_name && p.team_name.toLowerCase().includes(search))
      );
    }

    const participants = rows.map((r, idx) => ({
      id: r.id,
      agentId: r.agent_id,
      name: r.name,
      prn: r.prn,
      email: r.email,
      phone: r.phone || "",
      college: r.college || "SIES GST",
      teamName: r.team_name || "Solo",
      teamSize: r.team_size || "1",
      domain: r.domain,
      points: r.points || 0,
      rank: idx + 1,
      checkedIn: Boolean(r.checked_in),
      checkedInAt: r.checked_in_at || null,
      checkedInBy: r.checked_in_by || null,
      registeredAt: r.registered_at,
      qrCodeUrl: r.qr_code_url,
    }));

    return NextResponse.json({
      success: true,
      count: participants.length,
      participants,
    });
  } catch (err) {
    console.error("Participants API exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    const { id, agentId, name, prn, email, phone, college, teamName, domain, points } = body as Record<string, unknown>;

    if (!id && !agentId) {
      return NextResponse.json(
        { success: false, error: "Participant ID or Agent ID is required." },
        { status: 400 }
      );
    }

    const cleanName = cleanText(name, 80);
    const cleanPrn = cleanText(prn, 32).toUpperCase();
    const cleanEmail = cleanText(email, 254).toLowerCase();
    const cleanPhone = cleanText(phone, 20);
    const cleanCollege = cleanText(college, 120);
    const cleanTeamName = cleanText(teamName, 60);
    const cleanDomain = cleanText(domain, 60);
    const numPoints = typeof points === "number" ? Math.max(0, points) : undefined;

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email address format." }, { status: 400 });
    }
    if (cleanPrn && !isValidPrn(cleanPrn)) {
      return NextResponse.json({ success: false, error: "Invalid PRN format." }, { status: 400 });
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number format." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (cleanName) updatePayload.name = cleanName;
    if (cleanPrn) updatePayload.prn = cleanPrn;
    if (cleanEmail) updatePayload.email = cleanEmail;
    if (cleanPhone !== undefined) updatePayload.phone = cleanPhone;
    if (cleanCollege) updatePayload.college = cleanCollege;
    if (cleanTeamName) updatePayload.team_name = cleanTeamName;
    if (cleanDomain) updatePayload.domain = cleanDomain;
    if (numPoints !== undefined) updatePayload.points = numPoints;

    let updateQuery = supabaseAdmin.from("students").update(updatePayload);
    if (id) {
      updateQuery = updateQuery.eq("id", id);
    } else {
      updateQuery = updateQuery.eq("agent_id", agentId);
    }

    const { data: updated, error } = await updateQuery.select().single();
    if (error || !updated) {
      console.error("Update participant error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update participant record." },
        { status: 500 }
      );
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "PARTICIPANT_EDITED",
      targetId: String(updated.agent_id),
      details: { updatedFields: Object.keys(updatePayload) },
      ip,
    });

    // Real-time synchronization to Google Sheets
    syncToGoogleSheets({
      action: "register",
      agentId: updated.agent_id,
      name: updated.name,
      prn: updated.prn,
      email: updated.email,
      phone: updated.phone || "",
      college: updated.college || "SIES Graduate School of Technology",
      teamName: updated.team_name || "Avengers Initiative",
      teamSize: updated.team_size || "1",
      domain: updated.domain,
      points: updated.points,
      checkedIn: Boolean(updated.checked_in),
      checkedInAt: updated.checked_in_at || null,
      checkedInBy: updated.checked_in_by || null,
      dashboardUrl: `/dashboard/${updated.agent_id}`,
    }).catch((err) => console.error("Sheets update sync error:", err));

    return NextResponse.json({
      success: true,
      message: "Participant record updated successfully.",
      participant: updated,
    });
  } catch (err) {
    console.error("Edit participant exception:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update participant." },
      { status: 500 }
    );
  }
}
