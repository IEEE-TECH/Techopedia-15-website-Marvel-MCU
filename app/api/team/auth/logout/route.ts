import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/security";
import { clearTeamSessionCookie, getTeamUser, logTeamAudit } from "@/lib/teamAuth";

export async function POST(req: NextRequest) {
  try {
    const user = await getTeamUser(req);
    const ip = getClientIp(req);

    if (user) {
      await logTeamAudit({
        userId: user.user_id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: "TEAM_LOGOUT",
        targetId: String(user.id),
        ip,
      });
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    clearTeamSessionCookie(response);
    return response;
  } catch (err) {
    console.error("Logout API exception:", err);
    const response = NextResponse.json({ success: true });
    clearTeamSessionCookie(response);
    return response;
  }
}
