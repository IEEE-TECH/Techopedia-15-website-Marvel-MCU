"use client";

import React, { useState, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import type { TeamAuditLogRow } from "@/lib/supabase";

const ACTIONS = [
  "ALL",
  "TEAM_LOGIN",
  "TEAM_LOGOUT",
  "PARTICIPANT_CHECKIN",
  "POINTS_AWARDED",
  "PARTICIPANT_EDITED",
  "TEAM_MEMBER_CREATED",
  "TEAM_MEMBER_UPDATED",
  "TEAM_MEMBER_DELETED",
  "GOOGLE_SHEETS_SYNC",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<TeamAuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<TeamAuditLogRow | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (userSearch) params.set("user", userSearch);

      const res = await fetch(`/api/team/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [actionFilter, userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("LOGIN") || action.includes("CHECKIN")) return "#22c55e";
    if (action.includes("POINTS")) return "#ffd700";
    if (action.includes("DELETED") || action.includes("LOGOUT")) return "#ef4444";
    if (action.includes("CREATED") || action.includes("UPDATED")) return "#00e5ff";
    return "#a855f7";
  };

  return (
    <TeamLayout requiredPermission="canViewAuditLogs">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            SECURITY AUDIT TRAIL
          </div>
          <h1 className={styles.pageTitle}>Immutable Audit Trail</h1>
          <p className={styles.pageDesc}>
            Comprehensive chronological record of all team logins, participant check-ins, score grants, and system events.
          </p>
        </div>

        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={fetchLogs}
        >
          ↻ Refresh Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.panel} style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 240px" }}>
            <input
              type="text"
              className={styles.input}
              placeholder="Search by Coordinator Name, Email, or Target ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <select
              className={styles.select}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === "ALL" ? "All Action Types" : a.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setActionFilter("ALL");
              setUserSearch("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Audit Records ({logs.length})</h3>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>IP Origin</th>
                <th style={{ textAlign: "right" }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem" }}>
                    <div className={styles.statusDot} style={{ width: 10, height: 10, margin: "0 auto 0.5rem" }} />
                    <span style={{ color: "#00e5ff", fontFamily: "monospace" }}>Retrieving audit ledger...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "rgba(255,255,255,0.4)" }}>
                    No audit records match the current filters.
                  </td>
                </tr>
              ) : (
                logs.map((l) => {
                  const badgeColor = getActionBadgeColor(l.action);
                  return (
                    <tr key={l.id}>
                      <td style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#ffffff" }}>{l.user_name || "System"}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                          {l.user_role ? `[${l.user_role}]` : ""} {l.user_email || ""}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            background: `${badgeColor}18`,
                            border: `1px solid ${badgeColor}40`,
                            color: badgeColor,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.action}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", color: "#ffd700", fontSize: "0.82rem" }}>
                        {l.target_id || "—"}
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                        {l.ip_address || "unknown"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className={`${styles.btn} ${styles.btnSecondary}`}
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                          onClick={() => setSelectedLog(l)}
                        >
                          Inspect 🔍
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Audit Event Payload</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
              <div><strong>Action:</strong> <span style={{ color: getActionBadgeColor(selectedLog.action) }}>{selectedLog.action}</span></div>
              <div><strong>Operator:</strong> {selectedLog.user_name} ({selectedLog.user_email})</div>
              <div><strong>Target ID:</strong> {selectedLog.target_id || "None"}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedLog.created_at).toISOString()}</div>
              <div><strong>IP Origin:</strong> {selectedLog.ip_address}</div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem" }}>
              Metadata &amp; Event Details (JSON):
            </div>
            <pre
              style={{
                background: "#06070a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                padding: "1rem",
                color: "#00e5ff",
                fontSize: "0.78rem",
                overflowX: "auto",
                maxHeight: "220px",
              }}
            >
              {JSON.stringify(selectedLog.details || {}, null, 2)}
            </pre>

            <div style={{ textAlign: "right", marginTop: "1.25rem" }}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </TeamLayout>
  );
}
