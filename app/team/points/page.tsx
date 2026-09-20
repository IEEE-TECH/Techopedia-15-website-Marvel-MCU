"use client";

import React, { useState, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

interface Transaction {
  id: string;
  agentId: string;
  points: number;
  reason: string;
  awardedBy: string;
  createdAt: string;
}

export default function PointsPage() {
  const [identifier, setIdentifier] = useState("");
  const [points, setPoints] = useState(100);
  const [reason, setReason] = useState("");
  const [eventId, setEventId] = useState("DEBATE-COMP");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);

  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/team/dashboard");
      const data = await res.json();
      if (data.success && data.recentTransactions) {
        setTransactions(data.recentTransactions);
      }
    } catch {
      // ignore
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !reason || points <= 0) {
      setToast({ type: "error", message: "Please fill in all point allocation fields." });
      sound.playBlip(300, 0.08);
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await fetch("/api/team/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          points: Number(points),
          reason: reason.trim(),
          eventId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Failed to award points." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: data.message || `+${points} XP awarded successfully!` });
      setIdentifier("");
      setReason("");
      fetchLedger();
    } catch {
      setToast({ type: "error", message: "Network error while awarding points." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamLayout requiredPermission="canAwardPoints">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            SCORING &amp; ALLOCATION LEDGER
          </div>
          <h1 className={styles.pageTitle}>Points Allocation Terminal</h1>
          <p className={styles.pageDesc}>
            Allocate verified competition scores, stall rewards, and CTF bounties to participant Agent IDs.
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
        {/* Allocation Form */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Grant Participant XP</h3>
          </div>

          <form onSubmit={handleAward}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Participant Identifier</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Agent ID (TECH15-...) / PRN / Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Points (1 - 500 XP)</label>
                <input
                  type="number"
                  className={styles.input}
                  min={1}
                  max={500}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Event Code</label>
                <select
                  className={styles.select}
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                >
                  <option value="DEBATE-COMP">Debate Competition</option>
                  <option value="QUIZ-COMP">Quiz Competition</option>
                  <option value="GUN-GAME">Gun Game Tournament</option>
                  <option value="NAT-SYMPOSIUM">National Technical Symposium</option>
                  <option value="ARCADE-GAMES">Arcade Hub Mini-Games</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Activity Description / Audit Note</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Winner of Round 1 Algorithmic Speed Duel"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%", padding: "0.8rem", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? "RECORDING ON IMMUTABLE LEDGER..." : `▸ ALLOCATE +${points} XP TO PARTICIPANT`}
            </button>
          </form>
        </div>

        {/* Ledger View */}
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Recent Allocation Ledger</h3>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
              onClick={fetchLedger}
            >
              Refresh
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Agent ID</th>
                  <th>Points</th>
                  <th>Reason</th>
                  <th>Coordinator</th>
                </tr>
              </thead>
              <tbody>
                {loadingLedger ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      Loading ledger...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                      No recent point records found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: "monospace", color: "#ffd700", fontWeight: 600 }}>{t.agentId}</td>
                      <td style={{ color: "#4ade80", fontWeight: 700 }}>+{t.points} XP</td>
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
    </TeamLayout>
  );
}
