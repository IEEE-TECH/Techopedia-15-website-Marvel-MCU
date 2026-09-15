"use client";

import React, { useState, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

interface ParticipantItem {
  id: string;
  agentId: string;
  name: string;
  prn: string;
  email: string;
  phone: string;
  college: string;
  teamName: string;
  teamSize: string;
  domain: string;
  points: number;
  rank: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  registeredAt: string;
  qrCodeUrl?: string;
}

const DOMAINS = [
  "ALL",
  "Squabble",
  "Inquisitive",
  "Eureka",
  "Vanguard",
  "Paper & Project Expo",
  "E-Sports Arena",
];

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ParticipantItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ParticipantItem>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedDomain !== "ALL") params.set("domain", selectedDomain);
      if (selectedStatus !== "all") params.set("status", selectedStatus);

      const res = await fetch(`/api/team/participants?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch {
      setToast({ type: "error", message: "Failed to fetch participants list." });
    } finally {
      setLoading(false);
    }
  }, [search, selectedDomain, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParticipants();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchParticipants]);

  const handleCheckIn = async (participant: ParticipantItem) => {
    try {
      const res = await fetch("/api/team/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: participant.agentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Check-in failed." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `Checked in ${participant.name}!` });
      fetchParticipants();
      if (selectedItem?.agentId === participant.agentId) {
        setSelectedItem({ ...selectedItem, checkedIn: true, checkedInAt: new Date().toISOString() });
      }
    } catch {
      setToast({ type: "error", message: "Check-in network error." });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSavingEdit(true);
    try {
      const res = await fetch("/api/team/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          agentId: selectedItem.agentId,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Failed to update record." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: "Participant updated successfully." });
      setIsEditing(false);
      fetchParticipants();
      setSelectedItem(null);
    } catch {
      setToast({ type: "error", message: "Network error while saving." });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <TeamLayout requiredPermission="canViewParticipants">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            PERSONNEL DATABASE
          </div>
          <h1 className={styles.pageTitle}>Participant Registry</h1>
          <p className={styles.pageDesc}>
            Search, inspect dossiers, verify check-in credentials, and manage attendee records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a
            href="/api/export-csv"
            className={`${styles.btn} ${styles.btnSecondary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            📥 Export Full CSV
          </a>
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className={styles.panel} style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 260px" }}>
            <input
              type="text"
              className={styles.input}
              placeholder="Search by Name, PRN, Email, Agent ID, Team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <select
              className={styles.select}
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d === "ALL" ? "All Domains" : d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: "150px" }}>
            <select
              className={styles.select}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Check-Ins</option>
              <option value="checked_in">Checked In Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setSearch("");
              setSelectedDomain("ALL");
              setSelectedStatus("all");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>
            Attendees ({participants.length})
          </h3>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank / Agent ID</th>
                <th>Participant Name</th>
                <th>PRN / Roll</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem" }}>
                    <div className={styles.statusDot} style={{ width: 10, height: 10, margin: "0 auto 0.5rem" }} />
                    <span style={{ color: "#00e5ff", fontFamily: "monospace" }}>Scanning roster...</span>
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "rgba(255,255,255,0.4)" }}>
                    No participant records match the query.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id || p.agentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#ffd700", fontFamily: "monospace", fontSize: "0.82rem" }}>
                        #{p.rank} {p.agentId}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#ffffff" }}>{p.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{p.email}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>{p.prn}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {p.domain}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#4ade80" }}>{p.points} XP</td>
                    <td>
                      {p.checkedIn ? (
                        <span style={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 700 }}>
                          ✓ CHECKED IN
                        </span>
                      ) : (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess}`}
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem" }}
                          onClick={() => handleCheckIn(p)}
                        >
                          Check-In
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                        onClick={() => {
                          setSelectedItem(p);
                          setIsEditing(false);
                          setEditFormData({ ...p });
                        }}
                      >
                        Dossier ↗
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Detail / Edit Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>
                {isEditing ? "Edit Agent Dossier" : `Agent Dossier · ${selectedItem.agentId}`}
              </h3>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>
                ✕
              </button>
            </div>

            {!isEditing ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Full Name</span>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>{selectedItem.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>PRN / Roll</span>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffd700", fontFamily: "monospace" }}>{selectedItem.prn}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Email Address</span>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>{selectedItem.email}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Phone Number</span>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>{selectedItem.phone || "—"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Event Domain</span>
                    <div style={{ fontSize: "0.9rem", color: "#00e5ff", fontWeight: 600 }}>{selectedItem.domain}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>College / Institution</span>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>{selectedItem.college}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Squad / Team</span>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>
                      {selectedItem.teamName} ({selectedItem.teamSize} Members)
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Total XP Score</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#4ade80" }}>{selectedItem.points} XP</div>
                  </div>
                </div>

                <div style={{ padding: "0.85rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>Check-In Attendance Record</div>
                  {selectedItem.checkedIn ? (
                    <div style={{ color: "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
                      ✓ Verified on {selectedItem.checkedInAt ? new Date(selectedItem.checkedInAt).toLocaleString() : "Date recorded"}
                      {selectedItem.checkedInBy && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}> by {selectedItem.checkedInBy}</span>}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#ffd700", fontSize: "0.85rem" }}>⚠️ Attendee has not checked in yet</span>
                      <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => handleCheckIn(selectedItem)}>
                        Mark Check-In Now
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setIsEditing(true)}>
                    ✏️ Edit Record (Super Admin)
                  </button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setSelectedItem(null)}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Participant Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>PRN / Roll</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={editFormData.prn || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, prn: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Total Points (XP)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={editFormData.points ?? 0}
                      onChange={(e) => setEditFormData({ ...editFormData, points: Number(e.target.value) })}
                      min={0}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={editFormData.email || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={editFormData.phone || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Event Domain</label>
                  <select
                    className={styles.select}
                    value={editFormData.domain || "Squabble"}
                    onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                  >
                    <option value="Squabble">Squabble</option>
                    <option value="Inquisitive">Inquisitive</option>
                    <option value="Eureka">Eureka</option>
                    <option value="Vanguard">Vanguard</option>
                    <option value="Paper & Project Expo">Paper & Project Expo</option>
                    <option value="E-Sports Arena">E-Sports Arena</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => setIsEditing(false)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving Changes..." : "Save Record"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </TeamLayout>
  );
}
