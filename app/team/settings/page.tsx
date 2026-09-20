"use client";

import React, { useState, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1sKzIh_jD7QEvnZzFQ31TlEcOGXe7vbNhBvOaBrtFiaI/edit?usp=sharing";

const APPS_SCRIPT_SNIPPET = `/**
 * TECHOPEDIA LEVEL 15 // IEEE SIESGST
 * GOOGLE APPS SCRIPT REAL-TIME SYNC ENGINE (SUPABASE <-> GOOGLE SHEETS)
 *
 * 1. In your Google Sheet, click Extensions > Apps Script
 * 2. Delete default code, paste this entire file, and click Save (💾)
 * 3. Click Deploy > New deployment > Select type "Web app"
 * 4. Set Description: "Techopedia 15 Realtime Engine"
 * 5. Set Execute as: "Me", Who has access: "Anyone"
 * 6. Click Deploy, Authorize access, and copy the Web App URL!
 * 7. Add it to .env.local: GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Registrations
  let regSheet = ss.getSheetByName("Registrations");
  if (!regSheet) {
    regSheet = ss.insertSheet("Registrations", 0);
    regSheet.appendRow([
      "Timestamp", "Agent ID", "Full Name", "PRN", "Email Address",
      "WhatsApp / Phone", "College / Institution", "Team Name", "Team Size",
      "Event Domain", "Total Points", "Checked In", "Checked In At", "Checked In By", "Digital Pass URL"
    ]);
    regSheet.getRange(1, 1, 1, 15).setBackground("#ed1d24").setFontColor("#ffffff").setFontWeight("bold");
    regSheet.setFrozenRows(1);
  }

  // 2. Points Log
  let logSheet = ss.getSheetByName("Points Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Points Log", 1);
    logSheet.appendRow([
      "Timestamp", "Agent ID", "PRN", "Agent Name", "Activity / Game / Stall",
      "Points Awarded", "New Total Points", "Scanned By / Desk"
    ]);
    logSheet.getRange(1, 1, 1, 8).setBackground("#d97706").setFontColor("#ffffff").setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }

  // 3. Check-in Log
  let checkinSheet = ss.getSheetByName("Check-in Log");
  if (!checkinSheet) {
    checkinSheet = ss.insertSheet("Check-in Log", 2);
    checkinSheet.appendRow(["Timestamp", "Agent ID", "PRN", "Full Name", "Domain", "Checked In By"]);
    checkinSheet.getRange(1, 1, 1, 6).setBackground("#059669").setFontColor("#ffffff").setFontWeight("bold");
    checkinSheet.setFrozenRows(1);
  }

  return { ss, regSheet, logSheet, checkinSheet };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const { ss, regSheet, logSheet, checkinSheet } = setupSheets();
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "register";
    const timestamp = data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (action === "register") {
      const agentId = String(data.agentId || "").trim();
      const prn = String(data.prn || "").trim();
      const regData = regSheet.getDataRange().getValues();
      let existingRow = -1;
      for (let i = 1; i < regData.length; i++) {
        if ((agentId && String(regData[i][1]).toLowerCase() === agentId.toLowerCase()) ||
            (prn && String(regData[i][3]).toLowerCase() === prn.toLowerCase())) {
          existingRow = i + 1;
          break;
        }
      }
      const rowValues = [
        timestamp, agentId, data.name || "", prn, data.email || "", data.phone || "",
        data.college || "SIES GST", data.teamName || "Avengers Initiative", data.teamSize || "1",
        data.domain || "Squabble", data.points || 100, data.checkedIn ? "YES" : "NO",
        data.checkedInAt || "", data.checkedInBy || "", data.dashboardUrl || ""
      ];
      if (existingRow > 1) {
        regSheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        regSheet.appendRow(rowValues);
      }
      return jsonResponse({ status: "success", action: "register", agentId: agentId });
    }

    if (action === "award_points") {
      logSheet.appendRow([
        timestamp, data.agentId || "", data.prn || "", data.name || "",
        data.activityTitle || "Stall Challenge", data.pointsAwarded || 0,
        data.totalPoints || 0, data.scannedBy || "Scanner Desk"
      ]);
      const regData = regSheet.getDataRange().getValues();
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][1] === data.agentId || regData[i][3] === data.prn) {
          regSheet.getRange(i + 1, 11).setValue(data.totalPoints);
          break;
        }
      }
      return jsonResponse({ status: "success", action: "award_points", totalPoints: data.totalPoints });
    }

    if (action === "check_in") {
      checkinSheet.appendRow([
        timestamp, data.agentId || "", data.prn || "", data.name || "",
        data.domain || "", data.checkedInBy || "Entrance Desk"
      ]);
      const regData = regSheet.getDataRange().getValues();
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][1] === data.agentId || regData[i][3] === data.prn) {
          regSheet.getRange(i + 1, 12).setValue("YES");
          regSheet.getRange(i + 1, 13).setValue(timestamp);
          regSheet.getRange(i + 1, 14).setValue(data.checkedInBy || "Desk");
          break;
        }
      }
      return jsonResponse({ status: "success", action: "check_in" });
    }

    if (action === "bulk_sync") {
      const participants = data.participants || [];
      const transactions = data.transactions || [];
      if (participants.length > 0) {
        const lastRow = regSheet.getLastRow();
        if (lastRow > 1) regSheet.getRange(2, 1, lastRow - 1, 15).clearContent();
        const rows = participants.map((p) => [
          p.registeredAt || timestamp, p.agentId || "", p.name || "", p.prn || "",
          p.email || "", p.phone || "", p.college || "", p.teamName || "", p.teamSize || "1",
          p.domain || "", p.points || 0, p.checkedIn ? "YES" : "NO",
          p.checkedInAt || "", p.checkedInBy || "", p.dashboardUrl || ""
        ]);
        regSheet.getRange(2, 1, rows.length, 15).setValues(rows);
      }
      if (transactions.length > 0) {
        const lastTxRow = logSheet.getLastRow();
        if (lastTxRow > 1) logSheet.getRange(2, 1, lastTxRow - 1, 8).clearContent();
        const txRows = transactions.map((t) => [
          t.createdAt || timestamp, t.agentId || "", t.prn || "", t.name || "",
          t.activityTitle || "Stall Challenge", t.pointsAwarded || 0, t.totalPoints || 0, t.scannedBy || "Admin"
        ]);
        logSheet.getRange(2, 1, txRows.length, 8).setValues(txRows);
      }
      return jsonResponse({ status: "success", action: "bulk_sync", participants: participants.length, transactions: transactions.length });
    }

    if (action === "test" || action === "ping") {
      return jsonResponse({ status: "success", action: "test", message: "Google Sheets Webhook Connected!" });
    }

    return jsonResponse({ status: "error", message: "Unknown action" }, 400);
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "online", name: "Techopedia 15 Sync Engine" })).setMimeType(ContentService.MimeType.JSON);
}

function jsonResponse(payload, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}`;

export default function TeamSettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [sheetStatus, setSheetStatus] = useState<{
    configured: boolean;
    connected?: boolean;
    webhookUrlMasked?: string;
    error?: string | null;
  }>({ configured: false });
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const checkStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/team/sync");
      const data = await res.json();
      if (data.success) {
        setSheetStatus({
          configured: Boolean(data.configured),
          connected: Boolean(data.connected),
          webhookUrlMasked: data.webhookUrlMasked || "",
          error: data.error || null,
        });
      }
    } catch {
      // Ignored
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleTestConnection = async () => {
    setTesting(true);
    setToast(null);

    try {
      const res = await fetch("/api/team/sync");
      const data = await res.json();

      if (!data.configured) {
        sound.playBlip(300, 0.08);
        setToast({
          type: "error",
          message: "GOOGLE_SHEETS_WEBHOOK_URL is not set in .env.local yet.",
        });
        return;
      }

      if (data.connected) {
        sound.playSuccess();
        setToast({
          type: "success",
          message: "✓ Google Sheets Webhook is ONLINE and actively receiving data!",
        });
        setSheetStatus({ configured: true, connected: true, webhookUrlMasked: data.webhookUrlMasked });
      } else {
        sound.playBlip(300, 0.08);
        setToast({
          type: "error",
          message: data.error || "Failed to reach Google Apps Script webhook.",
        });
        setSheetStatus({ configured: true, connected: false, error: data.error });
      }
    } catch {
      setToast({ type: "error", message: "Network error during connection test." });
    } finally {
      setTesting(false);
    }
  };

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
      checkStatus();
    } catch {
      setToast({ type: "error", message: "Network error triggering Google Sheets sync." });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
    setCopied(true);
    sound.playSuccess();
    setTimeout(() => setCopied(false), 2500);
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
            Manage Google Sheets real-time synchronization pipelines, security rules, and audit telemetry.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            📊 Open Google Sheet ↗
          </a>
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.5rem" }}>
        {/* Google Sheets Realtime Sync Command Card */}
        <div className={styles.panel} style={{ position: "relative" }}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Google Sheets Real-Time Sync Engine</h3>
            {statusLoading ? (
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>Checking...</span>
            ) : sheetStatus.connected ? (
              <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 700 }}>
                ● REAL-TIME LIVE
              </span>
            ) : sheetStatus.configured ? (
              <span style={{ fontSize: "0.75rem", color: "#ffd700", fontWeight: 700 }}>
                ● CONFIGURED
              </span>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700 }}>
                ● SETUP PENDING
              </span>
            )}
          </div>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Every registration, game stall scan, point allocation, and check-in is mirrored into your Google Spreadsheet automatically in real-time.
          </p>

          <div style={{ background: "rgba(0,0,0,0.35)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Target Spreadsheet:</span>
              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#00e5ff", textDecoration: "underline", fontWeight: 600 }}
              >
                IEEE SIESGST Techopedia 15 Sheet ↗
              </a>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Sync Architecture:</span>
              <span style={{ color: "#4ade80", fontWeight: 600 }}>Real-time Webhook + Instant Bulk Batch</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Auto-Managed Tabs:</span>
              <span style={{ color: "#ffd700", fontWeight: 600 }}>Registrations · Points Log · Check-in Log</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleTestConnection}
                disabled={testing}
                style={{ padding: "0.7rem", fontSize: "0.8rem", justifyContent: "center" }}
              >
                {testing ? "Testing..." : "⚡ Test Connection"}
              </button>

              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowCodeModal(true)}
                style={{ padding: "0.7rem", fontSize: "0.8rem", justifyContent: "center" }}
              >
                📋 Setup Script &amp; Instructions
              </button>
            </div>

            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleTriggerSync}
              disabled={syncing}
              style={{ width: "100%", padding: "0.8rem", fontSize: "0.85rem", fontWeight: 700 }}
            >
              {syncing ? "SYNCHRONIZING FULL DATABASE..." : "▸ TRIGGER FULL BULK DATABASE SYNC"}
            </button>
          </div>
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
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Real-Time Supabase &lt;-&gt; Sheets Sync</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  Asynchronous non-blocking webhooks guarantee registration speed never degrades.
                </div>
              </div>
            </div>

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

      {/* Apps Script Code & Setup Modal */}
      {showCodeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCodeModal(false)}>
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
          >
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Google Apps Script Setup Guide</h3>
              <button className={styles.closeBtn} onClick={() => setShowCodeModal(false)}>
                ✕
              </button>
            </div>

            <div style={{ overflowY: "auto", paddingRight: "0.5rem" }}>
              <div style={{ background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.2)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontWeight: 700, color: "#00e5ff", marginBottom: "0.4rem", fontSize: "0.9rem" }}>
                  4-Step Setup in 2 Minutes:
                </div>
                <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
                  <li>
                    Open your Google Spreadsheet:{" "}
                    <a href={SPREADSHEET_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#ffd700", textDecoration: "underline" }}>
                      Open Sheet ↗
                    </a>
                  </li>
                  <li>In Google Sheets menu, click <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Delete any default code, paste the script below, and click <strong>Save (💾)</strong>.</li>
                  <li>Click <strong>Deploy &gt; New deployment &gt; Web app</strong>:
                    <ul style={{ paddingLeft: "1rem", marginTop: "0.2rem" }}>
                      <li>Execute as: <strong>Me</strong></li>
                      <li>Who has access: <strong>Anyone</strong></li>
                    </ul>
                  </li>
                  <li>Copy the Web App URL and add to <code>.env.local</code>: <code>GOOGLE_SHEETS_WEBHOOK_URL="..."</code></li>
                </ol>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>GOOGLE_SHEETS_SCRIPT.js</span>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleCopyCode}
                  style={{ padding: "0.35rem 0.8rem", fontSize: "0.75rem" }}
                >
                  {copied ? "✓ COPIED TO CLIPBOARD!" : "📋 COPY APPS SCRIPT CODE"}
                </button>
              </div>

              <pre
                style={{
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "1rem",
                  fontSize: "0.75rem",
                  color: "#93c5fd",
                  maxHeight: "320px",
                  overflowY: "auto",
                  fontFamily: "monospace",
                }}
              >
                {APPS_SCRIPT_SNIPPET}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowCodeModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </TeamLayout>
  );
}
