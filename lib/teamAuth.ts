import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, type TeamMemberRow, type TeamRole } from "./supabase";
import { getClientIp } from "./security";

export const TEAM_SESSION_COOKIE = "techopedia15_team_session";

/** Role hierarchy level */
const ROLE_LEVEL: Record<TeamRole, number> = {
  viewer: 1,
  scanner: 2,
  coordinator: 3,
  super_admin: 4,
};

export function hasPermission(userRole: TeamRole, requiredRole: TeamRole): boolean {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[requiredRole] || 0);
}

/**
 * Extracts session token from Cookie or Authorization header or custom header
 */
export function getSessionToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(TEAM_SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const customHeader = req.headers.get("x-team-token");
  if (customHeader) return customHeader.trim();

  return null;
}

/**
 * Authenticates user from Supabase token and loads their active team profile
 */
export async function getTeamUser(req: NextRequest): Promise<TeamMemberRow | null> {
  try {
    const token = getSessionToken(req);
    if (!token) return null;

    // Verify token using Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return null;
    }

    const authUser = authData.user;

    // Fetch team member profile from `team_members`
    const { data: member, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    if (memberError || !member) {
      return null;
    }

    const teamMember = member as TeamMemberRow;

    // Ensure member account is active
    if (!teamMember.active) {
      return null;
    }

    return teamMember;
  } catch (err) {
    console.error("getTeamUser exception:", err);
    return null;
  }
}

/**
 * Requires an authenticated, active team member
 */
export async function requireTeamUser(
  req: NextRequest
): Promise<{ user: TeamMemberRow } | { error: NextResponse }> {
  const user = await getTeamUser(req);
  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Active team credentials are required.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Requires one of the allowed roles
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: TeamRole[]
): Promise<{ user: TeamMemberRow } | { error: NextResponse }> {
  const authResult = await requireTeamUser(req);
  if ("error" in authResult) {
    return authResult;
  }

  const { user } = authResult;
  if (!allowedRoles.includes(user.role) && user.role !== "super_admin") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Role '${user.role}' does not have sufficient permission for this operation.`,
          code: "FORBIDDEN",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Logs an administrative / team action into `team_audit_logs`
 */
export async function logTeamAudit(params: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  targetId?: string | null;
  details?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    const {
      userId = null,
      userName = null,
      userEmail = null,
      userRole = null,
      action,
      targetId = null,
      details = {},
      ip = "unknown",
    } = params;

    await supabaseAdmin.from("team_audit_logs").insert({
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      user_role: userRole,
      action,
      target_id: targetId,
      details,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("logTeamAudit error (non-fatal):", err);
  }
}

/**
 * Sets secure HttpOnly cookie for team sessions
 */
export function setTeamSessionCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: TEAM_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears team session cookie on logout
 */
export function clearTeamSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: TEAM_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
