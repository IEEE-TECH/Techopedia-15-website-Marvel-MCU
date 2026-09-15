"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

interface DashboardData {
  metrics: {
    totalRegistrations: number;
    todayRegistrations: number;
    checkedInCount: number;
    checkedInPercentage: number;
    totalPointsAwarded: number;
    activeMembersCount: number;
  };
  domainBreakdown: Record<string, number>;
  recentRegistrations: Array<{
    id: string;
    agentId: string;
    name: string;
    prn: string;
    domain: string;
    points: number;
    teamName: string;
    checkedIn: boolean;
    registeredAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    agentId: string;
    points: number;
    reason: string;
    awardedBy: string;
    createdAt: string;
  }>;
  systemHealth: {
    database: string;
    googleSheets: string;
    mailer: string;
    timestamp: string;
  };
}

const DOMAIN_COLORS: Record<string, string> = {
  Squabble: "#ed1d24",
  Inquisitive: "#ffd700",
  Eureka: "#ff4d4d",
  Vanguard: "#00e5ff",
  "Paper & Project Expo": "#22c55e",
  "E-Sports Arena": "#f97316",
};

export default function TeamDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/team/dashboard");
      if (!res.ok) throw new Error("Failed to load metrics");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (isRefresh) sound.playSuccess();
      }
    } catch {
      setError("Unable to load real-time telemetry from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh every 30s
    const interval = setInterval(() => fetchDashboard(false), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return (
    <TeamLayout>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            S.H.I.E.L.D. QUANTUM TELEMETRY
          </div>
          <h1 className={styles.pageTitle}>Mission Control Center</h1>
          <p className={styles.pageDesc}>
            Real-time event operations, attendee clearance stats, and scoring ledger.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? "SYNCING..." : "↻ Refresh Feeds"}
          </button>
          <Link href="/team/scanner" className={`${styles.btn} ${styles.btnPrimary}`}>
            ⚡ Open Scanner
          </Link>
        </div>
      </div>

      {error && (
        <div className={`${styles.toast} ${styles.toastError}`}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className={styles.panel} style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div className={styles.statusDot} style={{ width: 12, height: 12, margin: "0 auto 1rem" }} />
          <p style={{ color: "#00e5ff", fontFamily: "monospace" }}>[ GATHERING MULTIVERSE TELEMETRY... ]</p>
        </div>
      ) : data ? (
        <>
          {/* KPI Metrics */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total Registered</span>
                <span className={styles.kpiIconWrap} style={{ color: "#ff4d4d" }}>🛡️</span>
              </div>
              <div className={styles.kpiValue}>{data.metrics.totalRegistrations}</div>
              <div className={styles.kpiSub}>Across all 6 event domains</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Today&apos;s New</span>
                <span className={styles.kpiIconWrap} style={{ color: "#22c55e" }}>📈</span>
              </div>
              <div className={styles.kpiValue} style={{ color: "#4ade80" }}>
                +{data.metrics.todayRegistrations}
              </div>
              <div className={styles.kpiSub}>Registered since midnight</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Checked In</span>
                <span className={styles.kpiIconWrap} style={{ color: "#00e5ff" }}>🎟️</span>
              </div>
              <div className={styles.kpiValue} style={{ color: "#38bdf8" }}>
                {data.metrics.checkedInCount}
                <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)", marginLeft: "0.4rem" }}>
                  ({data.metrics.checkedInPercentage}%)
                </span>
              </div>
              <div className={styles.kpiSub}>Physically verified badges</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>XP Points Pool</span>
                <span className={styles.kpiIconWrap} style={{ color: "#ffd700" }}>🏆</span>
              </div>
              <div className={styles.kpiValue} style={{ color: "#ffd700" }}>
                {data.metrics.totalPointsAwarded.toLocaleString()}
              </div>
              <div className={styles.kpiSub}>Total allocated participant XP</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Active Staff</span>
                <span className={styles.kpiIconWrap} style={{ color: "#a855f7" }}>👥</span>
              </div>
              <div className={styles.kpiValue} style={{ color: "#c084fc" }}>
                {data.metrics.activeMembersCount}
              </div>
              <div className={styles.kpiSub}>Verified team accounts</div>
            </div>
          </div>

          {/* Domain Breakdown & Quick Launch */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
            {/* Domain Breakdown */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Domain Registration Distribution</h3>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>Real-Time</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {Object.entries(data.domainBreakdown).map(([domain, count]) => {
                  const pct = data.metrics.totalRegistrations > 0
                    ? Math.round((count / data.metrics.totalRegistrations) * 100)
                    : 0;
                  const color = DOMAIN_COLORS[domain] || "#ed1d24";

                  return (
                    <div key={domain}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                        <span style={{ fontWeight: 600, color: "#ffffff" }}>{domain}</span>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>
                          {count} <span style={{ fontSize: "0.75rem" }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: color,
                            borderRadius: "3px",
                            boxShadow: `0 0 8px ${color}`,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & System Telemetry */}
            <div className={styles.panel} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>Tactical Operations</h3>
                  <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>● System Ready</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <Link href="/team/scanner" className={`${styles.btn} ${styles.btnSecondary}`} style={{ justifyContent: "flex-start" }}>
                    <span>⚡</span>
                    <span>QR Scanner</span>
                  </Link>

                  <Link href="/team/participants" className={`${styles.btn} ${styles.btnSecondary}`} style={{ justifyContent: "flex-start" }}>
                    <span>📋</span>
                    <span>Roster List</span>
                  </Link>

                  <Link href="/team/points" className={`${styles.btn} ${styles.btnSecondary}`} style={{ justifyContent: "flex-start" }}>
                    <span>🏆</span>
                    <span>Award Points</span>
                  </Link>

                  <Link href="/team/audit-logs" className={`${styles.btn} ${styles.btnSecondary}`} style={{ justifyContent: "flex-start" }}>
                    <span>📜</span>
                    <span>Audit Logs</span>
                  </Link>
                </div>
              </div>

              {/* Telemetry Status Strip */}
              <div style={{ background: "rgba(0,0,0,0.35)", padding: "0.9rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>
                  Infrastructure Status
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span>Supabase Database:</span>
                  <span style={{ color: "#4ade80", fontWeight: 600 }}>ONLINE ✓</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                  <span>Google Sheets API:</span>
                  <span style={{ color: data.systemHealth.googleSheets === "configured" ? "#4ade80" : "#ffd700", fontWeight: 600 }}>
                    {data.systemHealth.googleSheets.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                  <span>Email Dispatcher:</span>
                  <span style={{ color: "#38bdf8", fontWeight: 600 }}>READY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Registrations & Transactions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {/* Recent Registrations */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Latest Participant Registrations</h3>
                <Link href="/team/participants" style={{ fontSize: "0.78rem", color: "#ff4d4d", textDecoration: "none" }}>
                  View All →
                </Link>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Agent ID</th>
                      <th>Name</th>
                      <th>Domain</th>
                      <th>Check-In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                          No registrations found yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentRegistrations.map((p) => (
                        <tr key={p.id || p.agentId}>
                          <td style={{ fontFamily: "monospace", color: "#ffd700" }}>{p.agentId}</td>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.15rem 0.4rem",
                                borderRadius: "4px",
                                background: "rgba(255,255,255,0.06)",
                                border: `1px solid ${DOMAIN_COLORS[p.domain] || "rgba(255,255,255,0.2)"}`,
                                color: DOMAIN_COLORS[p.domain] || "#ffffff",
                              }}
                            >
                              {p.domain}
                            </span>
                          </td>
                          <td>
                            {p.checkedIn ? (
                              <span style={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}>
                                ✓ PRESENT
                              </span>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
                                PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Point Allocations */}
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Recent Points Awarded</h3>
                <Link href="/team/points" style={{ fontSize: "0.78rem", color: "#ffd700", textDecoration: "none" }}>
                  Points Ledger →
                </Link>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Target Agent</th>
                      <th>Points</th>
                      <th>Activity / Reason</th>
                      <th>Awarded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                          No point transactions recorded.
                        </td>
                      </tr>
                    ) : (
                      data.recentTransactions.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontFamily: "monospace", color: "#ffd700" }}>{t.agentId}</td>
                          <td style={{ fontWeight: 700, color: "#4ade80" }}>+{t.points} XP</td>
                          <td style={{ fontSize: "0.8rem" }}>{t.reason}</td>
                          <td style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{t.awardedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </TeamLayout>
  );
}
