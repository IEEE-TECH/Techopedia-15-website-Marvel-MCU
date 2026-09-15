import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, type TeamMemberRow } from "@/lib/supabase";
import { cleanText, getClientIp, rateLimit } from "@/lib/security";
import { logTeamAudit, setTeamSessionCookie } from "@/lib/teamAuth";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limited = rateLimit(`team-login:${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid login payload." },
        { status: 400 }
      );
    }

    const email = cleanText(body.email, 254).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session || !authData.user) {
      // Generic error response to prevent user enumeration
      return NextResponse.json(
        { success: false, error: "Invalid team credentials or password." },
        { status: 401 }
      );
    }

    const user = authData.user;
    const sessionToken = authData.session.access_token;

    // Fetch team profile from `team_members`
    let { data: memberData, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Auto-link: If not found by user_id, search by email and link the authenticated user_id
    if (!memberData && user.email) {
      const { data: emailMatch } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      if (emailMatch) {
        await supabaseAdmin
          .from("team_members")
          .update({ user_id: user.id })
          .eq("id", emailMatch.id);
        memberData = { ...emailMatch, user_id: user.id };
        memberError = null;
      }
    }

    if (memberError || !memberData) {
      return NextResponse.json(
        {
          success: false,
          error: "Account authenticated, but no authorized team profile was found. Please contact Super Admin.",
        },
        { status: 403 }
      );
    }

    const teamMember = memberData as TeamMemberRow;

    if (!teamMember.active) {
      return NextResponse.json(
        {
          success: false,
          error: "Your team account is deactivated. Contact Super Admin for clearance.",
        },
        { status: 403 }
      );
    }

    // Update last_login
    const nowIso = new Date().toISOString();
    await supabaseAdmin
      .from("team_members")
      .update({ last_login: nowIso })
      .eq("id", teamMember.id);

    // Audit log
    await logTeamAudit({
      userId: teamMember.user_id,
      userName: teamMember.name,
      userEmail: teamMember.email,
      userRole: teamMember.role,
      action: "TEAM_LOGIN",
      targetId: String(teamMember.id),
      details: { department: teamMember.department, userAgent: req.headers.get("user-agent") || "" },
      ip,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: teamMember.id,
        userId: teamMember.user_id,
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        department: teamMember.department,
        active: teamMember.active,
        lastLogin: nowIso,
      },
      token: sessionToken,
    });

    setTeamSessionCookie(response, sessionToken);
    return response;
  } catch (err) {
    console.error("Login API exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal authentication error. Please try again." },
      { status: 500 }
    );
  }
}
