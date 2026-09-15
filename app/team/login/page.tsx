"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/team/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/team/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {});
  }, [redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      sound.playBlip(300, 0.08);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/team/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Check credentials.");
        sound.playBlip(300, 0.08);
        return;
      }

      sound.playSuccess();
      router.push(redirectPath);
    } catch {
      setError("Unable to connect to security gateway. Please check your connection.");
      sound.playBlip(300, 0.08);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.teamShell}
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        minHeight: "100vh",
      }}
    >
      <div
        className={styles.panel}
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem 2rem",
          borderColor: "rgba(237, 29, 36, 0.35)",
          boxShadow: "0 0 50px rgba(0,0,0,0.85), 0 0 30px rgba(237, 29, 36, 0.15)",
        }}
      >
        {/* Branding Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(237, 29, 36, 0.12)",
              border: "1px solid rgba(237, 29, 36, 0.35)",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#ff4d4d",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            <span className={styles.statusDot} style={{ width: 6, height: 6 }} />
            IEEE SIESGST · S.H.I.E.L.D. SECURE GATEWAY
          </div>

          <h1
            style={{
              fontFamily: '"AVENGEANCE HEROIC AVENGER", "Outfit", sans-serif',
              fontSize: "2rem",
              letterSpacing: "0.08em",
              color: "#ffffff",
              margin: 0,
              textShadow: "0 0 16px rgba(237, 29, 36, 0.4)",
            }}
          >
            TECHOPEDIA <span style={{ color: "#ed1d24" }}>15</span>
          </h1>

          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Authorized Event Coordinator &amp; Staff Access Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`${styles.toast} ${styles.toastError}`}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Team Member Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="coordinator@ieee-siesgst.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Access Passcode</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ width: "100%", padding: "0.8rem", marginTop: "1rem", fontSize: "0.9rem" }}
            disabled={loading}
          >
            {loading ? "▸ VERIFYING CREDENTIALS..." : "▸ ACCESS MISSION CONTROL"}
          </button>
        </form>

        {/* Footer info & links */}
        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.45)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowRoleInfo(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#00e5ff",
              cursor: "pointer",
              fontSize: "0.75rem",
              padding: 0,
            }}
          >
            ⓘ Role Clearance Info
          </button>

          <Link href="/" style={{ color: "rgba(255, 255, 255, 0.5)", textDecoration: "none" }}>
            ← Public Website
          </Link>
        </div>
      </div>

      {/* Role Clearance Modal */}
      {showRoleInfo && (
        <div className={styles.modalOverlay} onClick={() => setShowRoleInfo(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Security Clearance Levels</h3>
              <button className={styles.closeBtn} onClick={() => setShowRoleInfo(false)}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(237,29,36,0.1)", border: "1px solid rgba(237,29,36,0.3)", borderRadius: 6 }}>
                <strong style={{ color: "#ff4d4d" }}>1. SUPER ADMIN:</strong>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Full control across all tools, user management, participant data modification, audit logs, and Google Sheets synchronization.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6 }}>
                <strong style={{ color: "#ffd700" }}>2. EVENT COORDINATOR:</strong>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Participant roster viewing, QR scanning, attendance check-in, points allocation with mandatory activity justification.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 6 }}>
                <strong style={{ color: "#00e5ff" }}>3. SCANNER TEAM:</strong>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Camera QR scanning, attendee identity verification, and attendance check-in stamping.
                </p>
              </div>

              <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6 }}>
                <strong style={{ color: "#cbd5e1" }}>4. VIEWER:</strong>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                  Read-only access to registration metrics, leaderboards, and domain distributions.
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: "1.25rem" }}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowRoleInfo(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className={styles.teamShell}
          style={{ alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
        >
          <div className={styles.loadingPulse}>INITIALIZING SECURE TERMINAL...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
