"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./team.module.css";
import type { TeamRole } from "@/lib/supabase";

export interface TeamUser {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  department: string | null;
  active: boolean;
  lastLogin: string | null;
}

export interface TeamPermissions {
  canViewDashboard: boolean;
  canViewParticipants: boolean;
  canEditParticipants: boolean;
  canScanQR: boolean;
  canCheckIn: boolean;
  canAwardPoints: boolean;
  canRevokePoints: boolean;
  canViewAuditLogs: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
}

interface TeamLayoutProps {
  children: React.ReactNode;
  requiredRole?: TeamRole;
  requiredPermission?: keyof TeamPermissions;
}

export default function TeamLayout({
  children,
  requiredRole,
  requiredPermission,
}: TeamLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<TeamUser | null>(null);
  const [permissions, setPermissions] = useState<TeamPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/team/auth/me");
        if (!res.ok) {
          if (isMounted) {
            router.push(`/team/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
          if (isMounted) {
            setUser(data.user);
            setPermissions(data.permissions);
          }
        } else {
          if (isMounted) {
            router.push(`/team/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch {
        if (isMounted) {
          setError("Failed to verify credentials with security server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/team/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/team/login");
    }
  };

  if (loading) {
    return (
      <div className={styles.teamShell} style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className={styles.statusDot} style={{ width: 14, height: 14, margin: "0 auto 1rem" }} />
          <div style={{ fontFamily: "monospace", fontSize: "0.88rem", letterSpacing: "0.15em", color: "#00e5ff" }}>
            [ AUTHENTICATING S.H.I.E.L.D. CLEARANCE... ]
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || !permissions) {
    return (
      <div className={styles.teamShell} style={{ alignItems: "center", justifyContent: "center" }}>
        <div className={styles.modalBox} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
          <h2 style={{ color: "#ff4d4d", marginBottom: "0.5rem" }}>Authentication Required</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            {error || "Your session is invalid or expired. Please sign in to the team portal."}
          </p>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push("/team/login")}>
            ▸ Go to Team Login
          </button>
        </div>
      </div>
    );
  }

  // Check required permission or role
  let hasAccess = true;
  if (requiredRole && user.role !== "super_admin") {
    const roles: TeamRole[] = ["viewer", "scanner", "coordinator", "super_admin"];
    const userIndex = roles.indexOf(user.role);
    const reqIndex = roles.indexOf(requiredRole);
    if (userIndex < reqIndex) {
      hasAccess = false;
    }
  }

  if (requiredPermission && !permissions[requiredPermission] && user.role !== "super_admin") {
    hasAccess = false;
  }

  const roleBadgeClass =
    user.role === "super_admin"
      ? styles.roleSuperAdmin
      : user.role === "coordinator"
      ? styles.roleCoordinator
      : user.role === "scanner"
      ? styles.roleScanner
      : styles.roleViewer;

  return (
    <div className={styles.teamShell}>
      {/* Top HUD Banner */}
      <header className={styles.topNav}>
        <div className={styles.brandGroup}>
          <Link href="/team/dashboard" className={styles.brandLogo}>
            <span className={styles.brandBadge}>
              TECHOPEDIA <span className={styles.brandLevel}>15</span>
            </span>
          </Link>
          <div className={styles.subBrand}>
            <span className={styles.statusDot} />
            <span>TEAM MISSION CONTROL</span>
          </div>
        </div>

        <div className={styles.userStrip}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <div className={styles.userMeta}>
              <span className={`${styles.roleBadge} ${roleBadgeClass}`}>
                {user.role.replace("_", " ")}
              </span>
              {user.department && <span className={styles.deptText}>· {user.department}</span>}
            </div>
          </div>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out of mission control"
          >
            {loggingOut ? "EXITING..." : "LOGOUT ⏻"}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className={styles.layoutBody}>
        {/* Sidebar Nav */}
        <aside className={styles.sidebar}>
          <span className={styles.navSectionLabel}>COMMAND</span>

          <Link
            href="/team/dashboard"
            className={`${styles.navItem} ${pathname === "/team/dashboard" ? styles.navItemActive : ""}`}
          >
            <span className={styles.navIcon}>📊</span>
            <span>Dashboard</span>
          </Link>

          {permissions.canViewParticipants && (
            <Link
              href="/team/participants"
              className={`${styles.navItem} ${pathname === "/team/participants" ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>📋</span>
              <span>Participants</span>
            </Link>
          )}

          {permissions.canScanQR && (
            <Link
              href="/team/scanner"
              className={`${styles.navItem} ${pathname === "/team/scanner" ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>⚡</span>
              <span>QR Scanner</span>
            </Link>
          )}

          {permissions.canAwardPoints && (
            <Link
              href="/team/points"
              className={`${styles.navItem} ${pathname === "/team/points" ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>🏆</span>
              <span>Award Points</span>
            </Link>
          )}

          <Link href="/leaderboard" target="_blank" className={styles.navItem}>
            <span className={styles.navIcon}>📈</span>
            <span>Public Board ↗</span>
          </Link>

          {(permissions.canManageMembers || permissions.canViewAuditLogs) && (
            <>
              <span className={styles.navSectionLabel}>ADMINISTRATION</span>

              {permissions.canManageMembers && (
                <Link
                  href="/team/members"
                  className={`${styles.navItem} ${pathname === "/team/members" ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon}>👥</span>
                  <span>Team Accounts</span>
                </Link>
              )}

              {permissions.canViewAuditLogs && (
                <Link
                  href="/team/audit-logs"
                  className={`${styles.navItem} ${pathname === "/team/audit-logs" ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon}>📜</span>
                  <span>Audit Logs</span>
                </Link>
              )}

              {permissions.canManageSettings && (
                <Link
                  href="/team/settings"
                  className={`${styles.navItem} ${pathname === "/team/settings" ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon}>⚙️</span>
                  <span>Settings &amp; Sync</span>
                </Link>
              )}
            </>
          )}
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          {!hasAccess ? (
            <div className={styles.panel} style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🚫</div>
              <h2 style={{ color: "#ff4d4d", marginBottom: "0.5rem" }}>Clearance Level Insufficient</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 460, margin: "0 auto 1.5rem" }}>
                Your assigned role (<strong>{user.role.replace("_", " ").toUpperCase()}</strong>) does not have authorization to access this terminal section.
              </p>
              <Link href="/team/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                ▸ Return to Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
