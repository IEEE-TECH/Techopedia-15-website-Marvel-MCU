"use client";

import React, { useState, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";
import type { TeamMemberRow, TeamRole } from "@/lib/supabase";

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "coordinator" as TeamRole,
    department: "Technical Operations",
  });
  const [creating, setCreating] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/members");
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch {
      setToast({ type: "error", message: "Failed to load team roster." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ type: "error", message: "All fields are required." });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Failed to create team member." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `Team member ${formData.name} added successfully!` });
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "coordinator",
        department: "Technical Operations",
      });
      fetchMembers();
    } catch {
      setToast({ type: "error", message: "Network error creating member." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (member: TeamMemberRow) => {
    try {
      const res = await fetch("/api/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, active: !member.active }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Update failed." });
        return;
      }

      sound.playSuccess();
      setToast({
        type: "success",
        message: `${member.name} is now ${!member.active ? "ACTIVATED" : "DEACTIVATED"}.`,
      });
      fetchMembers();
    } catch {
      setToast({ type: "error", message: "Network error updating status." });
    }
  };

  const handleChangeRole = async (member: TeamMemberRow, newRole: TeamRole) => {
    try {
      const res = await fetch("/api/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Role update failed." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `Updated role for ${member.name} to ${newRole}.` });
      fetchMembers();
    } catch {
      setToast({ type: "error", message: "Network error changing role." });
    }
  };

  const handleDeleteMember = async (member: TeamMemberRow) => {
    if (!window.confirm(`Are you sure you want to completely remove access for ${member.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/team/members?id=${member.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Delete failed." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `Access removed for ${member.name}.` });
      fetchMembers();
    } catch {
      setToast({ type: "error", message: "Network error deleting member." });
    }
  };

  return (
    <TeamLayout requiredRole="super_admin">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            SUPER ADMIN AUTHORIZATION
          </div>
          <h1 className={styles.pageTitle}>Team Member Directory</h1>
          <p className={styles.pageDesc}>
            Manage authorized IEEE SIESGST event coordinators, scanner crews, and clearance levels.
          </p>
        </div>

        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowAddModal(true)}>
          + Add Team Member
        </button>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Team Roster Table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Active Event Organizers ({members.length})</h3>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
            onClick={fetchMembers}
          >
            Refresh List
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Clearance Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem" }}>
                    <div className={styles.statusDot} style={{ width: 10, height: 10, margin: "0 auto 0.5rem" }} />
                    <span style={{ color: "#00e5ff", fontFamily: "monospace" }}>Loading team roster...</span>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2.5rem", color: "rgba(255,255,255,0.4)" }}>
                    No team members found in database.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#ffffff" }}>{m.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{m.email}</div>
                    </td>
                    <td>
                      <select
                        className={styles.select}
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "auto" }}
                        value={m.role}
                        onChange={(e) => handleChangeRole(m, e.target.value as TeamRole)}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="scanner">Scanner Team</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>{m.department || "—"}</td>
                    <td>
                      <button
                        className={`${styles.btn} ${m.active ? styles.btnSuccess : styles.btnDanger}`}
                        style={{ padding: "0.2rem 0.55rem", fontSize: "0.7rem" }}
                        onClick={() => handleToggleActive(m)}
                      >
                        {m.active ? "ACTIVE ✓" : "DISABLED ✕"}
                      </button>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>
                      {m.last_login ? new Date(m.last_login).toLocaleString() : "Never"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => handleDeleteMember(m)}
                        title="Remove team access"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Add Authorized Team Member</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Mukul Wani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Official IEEE / College Email</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="name@ieee-siesgst.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Initial Login Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Clearance Role</label>
                  <select
                    className={styles.select}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
                  >
                    <option value="super_admin">Super Admin (Full Access)</option>
                    <option value="coordinator">Event Coordinator (Points &amp; Scans)</option>
                    <option value="scanner">Scanner Crew (Check-In Only)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Department / Council</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Technical / CS / WiE"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowAddModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={creating}
                >
                  {creating ? "Creating Account..." : "Create Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeamLayout>
  );
}
