import { NextRequest, NextResponse } from "next/server";
import { getTeamUser, hasPermission } from "@/lib/teamAuth";

export async function GET(req: NextRequest) {
  try {
    const user = await getTeamUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated", authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        active: user.active,
        lastLogin: user.last_login,
      },
      permissions: {
        canViewDashboard: true,
        canViewParticipants: hasPermission(user.role, "coordinator"),
        canEditParticipants: user.role === "super_admin",
        canScanQR: hasPermission(user.role, "scanner"),
        canCheckIn: hasPermission(user.role, "scanner"),
        canAwardPoints: hasPermission(user.role, "coordinator"),
        canRevokePoints: user.role === "super_admin",
        canViewAuditLogs: hasPermission(user.role, "coordinator"),
        canManageMembers: user.role === "super_admin",
        canManageSettings: user.role === "super_admin",
      },
    });
  } catch (err) {
    console.error("Auth Me exception:", err);
    return NextResponse.json(
      { success: false, error: "Authentication verification failed.", authenticated: false },
      { status: 500 }
    );
  }
}
