import { NextRequest, NextResponse } from "next/server";
import { requireRole, logTeamAudit } from "@/lib/teamAuth";
import { supabaseAdmin, type TeamMemberRow, type TeamRole } from "@/lib/supabase";
import { cleanText, getClientIp, isValidEmail } from "@/lib/security";

const VALID_ROLES: TeamRole[] = ["super_admin", "coordinator", "scanner", "viewer"];

export async function GET(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { data: members, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch members error:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch team members." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      members: members || [],
    });
  } catch (err) {
    console.error("Members GET exception:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    const { name, email, password, role, department, userId } = body as Record<string, unknown>;

    const cleanName = cleanText(name, 80);
    const cleanEmail = cleanText(email, 254).toLowerCase();
    const cleanRole = (typeof role === "string" ? role.toLowerCase() : "viewer") as TeamRole;
    const cleanDept = cleanText(department, 80) || "General Operations";
    const pass = typeof password === "string" ? password : "";

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ success: false, error: "A valid name is required." }, { status: 400 });
    }
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }
    if (!VALID_ROLES.includes(cleanRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    let authUserId = typeof userId === "string" && userId ? userId : null;

    // If password provided and no userId, create user in Supabase Auth
    if (!authUserId && pass) {
      if (pass.length < 6) {
        return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
      }

      const { data: newAuthUser, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: pass,
        email_confirm: true,
        user_metadata: { name: cleanName, department: cleanDept },
      });

      if (authCreateError) {
        // If user already exists in Auth, try to find their UID
        if (authCreateError.message.toLowerCase().includes("already registered")) {
          const { data: existingUserList } = await supabaseAdmin.auth.admin.listUsers();
          const found = existingUserList?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
          if (found) {
            authUserId = found.id;
          } else {
            return NextResponse.json(
              { success: false, error: "User already exists in Supabase Auth with a different configuration." },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: `Supabase Auth error: ${authCreateError.message}` },
            { status: 400 }
          );
        }
      } else if (newAuthUser?.user) {
        authUserId = newAuthUser.user.id;
      }
    }

    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: "Password is required to create a new team account." },
        { status: 400 }
      );
    }

    // Insert into `team_members`
    const { data: newMember, error: insertError } = await supabaseAdmin
      .from("team_members")
      .insert({
        user_id: authUserId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        department: cleanDept,
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert team member error:", insertError);
      return NextResponse.json(
        { success: false, error: `Failed to insert team member: ${insertError.message}` },
        { status: 400 }
      );
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "TEAM_MEMBER_CREATED",
      targetId: String(newMember.id),
      details: { addedName: cleanName, addedEmail: cleanEmail, assignedRole: cleanRole, department: cleanDept },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Team member ${cleanName} created with role '${cleanRole}'.`,
      member: newMember,
    });
  } catch (err) {
    console.error("Members POST exception:", err);
    return NextResponse.json({ success: false, error: "Failed to create team member." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    const { id, role, active, department, name } = body as Record<string, unknown>;
    const memberId = Number(id);

    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ success: false, error: "Valid team member ID is required." }, { status: 400 });
    }

    // Fetch existing member
    const { data: targetMember, error: fetchErr } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (fetchErr || !targetMember) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    const existing = targetMember as TeamMemberRow;

    // Self-lockout prevention
    if (existing.user_id === user.user_id) {
      if (active === false) {
        return NextResponse.json(
          { success: false, error: "Security restriction: You cannot deactivate your own Super Admin account." },
          { status: 400 }
        );
      }
      if (role && role !== "super_admin") {
        return NextResponse.json(
          { success: false, error: "Security restriction: You cannot demote your own Super Admin role." },
          { status: 400 }
        );
      }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role && VALID_ROLES.includes(role as TeamRole)) {
      updatePayload.role = role;
    }
    if (typeof active === "boolean") {
      updatePayload.active = active;
    }
    if (typeof department === "string") {
      updatePayload.department = cleanText(department, 80);
    }
    if (typeof name === "string") {
      updatePayload.name = cleanText(name, 80);
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("team_members")
      .update(updatePayload)
      .eq("id", memberId)
      .select()
      .single();

    if (updateErr || !updated) {
      return NextResponse.json({ success: false, error: "Failed to update team member." }, { status: 500 });
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "TEAM_MEMBER_UPDATED",
      targetId: String(memberId),
      details: { targetEmail: existing.email, changes: updatePayload },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Team member ${existing.name} updated successfully.`,
      member: updated,
    });
  } catch (err) {
    console.error("Members PATCH exception:", err);
    return NextResponse.json({ success: false, error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const roleResult = await requireRole(req, ["super_admin"]);
    if ("error" in roleResult) return roleResult.error;

    const { user } = roleResult;
    const ip = getClientIp(req);

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const memberId = Number(idParam);

    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ success: false, error: "Valid team member ID is required." }, { status: 400 });
    }

    // Check target
    const { data: targetMember } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    // Self-lockout check
    if (targetMember.user_id === user.user_id) {
      return NextResponse.json(
        { success: false, error: "Security restriction: You cannot delete your own account." },
        { status: 400 }
      );
    }

    const { error: delErr } = await supabaseAdmin.from("team_members").delete().eq("id", memberId);
    if (delErr) {
      return NextResponse.json({ success: false, error: "Failed to remove team member." }, { status: 500 });
    }

    await logTeamAudit({
      userId: user.user_id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "TEAM_MEMBER_DELETED",
      targetId: String(memberId),
      details: { deletedEmail: targetMember.email, deletedName: targetMember.name },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Team access removed for ${targetMember.name}.`,
    });
  } catch (err) {
    console.error("Members DELETE exception:", err);
    return NextResponse.json({ success: false, error: "Failed to delete team member." }, { status: 500 });
  }
}
