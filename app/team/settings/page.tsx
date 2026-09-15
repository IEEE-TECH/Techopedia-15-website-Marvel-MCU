"use client";

import React, { useState } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

export default function TeamSettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleTriggerSync = async () => {
    setSyncing(true);
    setToast(null);

    try {
      const res = await fetch("/api/team/sync", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({
          type: "error",
          message: data.error || "Google Sheets synchronization failed.",
        });
        return;
      }

      sound.playSuccess();
      setToast({
        type: "success",
        message: data.message || "All records successfully synchronized to Google Sheets!",
      });
    } catch {
      setToast({ type: "error", message: "Network error triggering Google Sheets sync." });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <TeamLayout requiredRole="super_admin">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            SUPER ADMIN MASTER SETTINGS
          </div>
          <h1 className={styles.pageTitle}>System Configuration &amp; Sync</h1>
          <p className={styles.pageDesc}>
            Manage cloud synchronization pipelines, database security rules, and event parameters.
          </p>
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Google Sheets Sync Card */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Google Sheets Synchronization</h3>
            <span style={{ fontSize: "0.75rem", color: "#4ade80" }}>● Ready</span>
          </div>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Triggers a full bulk synchronization from the Supabase PostgreSQL database into the linked IEEE SIESGST Google Spreadsheet.
          </p>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.4rem" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Sync Target:</span>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>Google Sheets Apps Script API</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Trigger Mode:</span>
              <span style={{ color: "#00e5ff" }}>Hybrid (Auto on Reg/Award + Manual Bulk)</span>
            </div>
          </div>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleTriggerSync}
            disabled={syncing}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {syncing ? "SYNCHRONIZING WITH GOOGLE APPS SCRIPT..." : "▸ TRIGGER FULL GOOGLE SHEETS SYNC"}
          </button>
        </div>

        {/* Security & RLS Status */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Security &amp; RLS Checklist</h3>
            <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>🛡️ ENFORCED</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Server-Side Session Verification</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  HttpOnly session cookies authenticated against Supabase Auth &amp; team_members.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Row Level Security (RLS)</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  Active on team_members, team_audit_logs, students, and point_transactions.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Sliding-Window Rate Limiting</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  Protects login gateway, point awards, and scanner against brute-force attacks.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Self-Lockout Safeguard</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  Super Admins cannot accidentally demote, deactivate, or delete their own account.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeamLayout>
  );
}
