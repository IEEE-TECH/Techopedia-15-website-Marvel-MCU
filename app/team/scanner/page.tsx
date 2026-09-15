"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import TeamLayout from "@/components/team/TeamLayout";
import styles from "@/components/team/team.module.css";
import { sound } from "@/lib/audio";

interface ParticipantLookup {
  id: string;
  agentId: string;
  name: string;
  prn: string;
  email: string;
  college: string;
  teamName: string;
  domain: string;
  points: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export default function TeamScannerPage() {
  const [manualInput, setManualInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [participant, setParticipant] = useState<ParticipantLookup | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Awarding points state
  const [awardPoints, setAwardPoints] = useState(100);
  const [awardReason, setAwardReason] = useState("Bug Blitz Arena Stall Activity");
  const [awarding, setAwarding] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Camera scanner state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        sound.playSuccess();
      }
    } catch {
      setCameraError("Camera access was denied or not supported on this device. You can use manual identifier lookup below.");
      setCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleLookup = async (identifier: string) => {
    const clean = identifier.trim();
    if (!clean) return;

    setSearching(true);
    setToast(null);

    try {
      const res = await fetch(`/api/team/participants?search=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.participants || data.participants.length === 0) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: `No participant matching '${clean}' was found.` });
        setParticipant(null);
        return;
      }

      const match = data.participants[0] as ParticipantLookup;
      setParticipant(match);
      sound.playSuccess();
      setToast({ type: "info", message: `Dossier loaded for Agent ${match.agentId}` });
    } catch {
      setToast({ type: "error", message: "Failed to query participant." });
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async (force = false) => {
    if (!participant) return;
    setCheckingIn(true);

    try {
      const res = await fetch("/api/team/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: participant.agentId, force }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Check-in failed." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `✓ Attendance confirmed for ${participant.name}!` });
      setParticipant({
        ...participant,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: "Verified Coordinator",
      });
    } catch {
      setToast({ type: "error", message: "Check-in network error." });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;

    setAwarding(true);
    try {
      const res = await fetch("/api/team/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: participant.agentId,
          points: awardPoints,
          reason: awardReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        sound.playBlip(300, 0.08);
        setToast({ type: "error", message: data.error || "Failed to award points." });
        return;
      }

      sound.playSuccess();
      setToast({ type: "success", message: `+${awardPoints} XP awarded to ${participant.name}!` });
      setParticipant({
        ...participant,
        points: (participant.points || 0) + awardPoints,
      });
    } catch {
      setToast({ type: "error", message: "Network error awarding points." });
    } finally {
      setAwarding(false);
    }
  };

  return (
    <TeamLayout requiredPermission="canScanQR">
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageKicker}>
            <span className={styles.statusDot} />
            RESTRICTED ACCESS TERMINAL
          </div>
          <h1 className={styles.pageTitle}>Tactical QR Scanner &amp; Check-In</h1>
          <p className={styles.pageDesc}>
            Verify participant digital passes, authenticate badges, and allocate event points.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "success"
              ? styles.toastSuccess
              : toast.type === "error"
              ? styles.toastError
              : styles.toastInfo
          }`}
        >
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Left Column: Scanner & Input */}
        <div>
          {/* Camera Viewport */}
          <div className={styles.panel} style={{ textAlign: "center", padding: "1.5rem" }}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Optical Lens Viewfinder</h3>
              {cameraActive ? (
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                  onClick={stopCamera}
                >
                  Stop Camera ✕
                </button>
              ) : (
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                  onClick={startCamera}
                >
                  📷 Activate Camera
                </button>
              )}
            </div>

            {cameraError && (
              <p style={{ color: "#ffd700", fontSize: "0.8rem", margin: "0.75rem 0" }}>{cameraError}</p>
            )}

            <div
              style={{
                width: "100%",
                height: "260px",
                background: "#000",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(0, 229, 255, 0.25)",
              }}
            >
              <video
                ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraActive ? "block" : "none" }}
                playsInline
                muted
              />

              {!cameraActive && (
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "1rem" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📷</div>
                  <div style={{ fontSize: "0.85rem" }}>Camera is idle. Click &quot;Activate Camera&quot; or enter Agent ID below.</div>
                </div>
              )}

              {/* HUD Targeting Brackets */}
              {cameraActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: "25px",
                    border: "2px solid rgba(0, 229, 255, 0.6)",
                    borderRadius: "8px",
                    pointerEvents: "none",
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Manual Agent Lookup</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualInput);
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter Agent ID (e.g. TECH15-STARK-1001) or PRN..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={searching}
                  style={{ minWidth: "110px" }}
                >
                  {searching ? "Searching..." : "Lookup ↗"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Participant Dossier & Point Allocation */}
        <div>
          {participant ? (
            <div className={styles.panel} style={{ borderColor: "rgba(255, 215, 0, 0.3)" }}>
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle} style={{ color: "#ffd700" }}>
                  ★ {participant.name}
                </h3>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    background: "rgba(255,215,0,0.15)",
                    border: "1px solid rgba(255,215,0,0.4)",
                    color: "#ffd700",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {participant.agentId}
                </span>
              </div>

              {/* Dossier Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>PRN / Roll</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff", fontFamily: "monospace" }}>{participant.prn}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Domain</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00e5ff" }}>{participant.domain}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Institution</span>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>{participant.college}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Current Score</span>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#4ade80" }}>{participant.points} XP</div>
                </div>
              </div>

              {/* Check-In Action Section */}
              <div
                style={{
                  padding: "1rem",
                  background: participant.checkedIn ? "rgba(34, 197, 94, 0.1)" : "rgba(237, 29, 36, 0.1)",
                  border: `1px solid ${participant.checkedIn ? "rgba(34, 197, 94, 0.3)" : "rgba(237, 29, 36, 0.3)"}`,
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: participant.checkedIn ? "#4ade80" : "#ff4d4d" }}>
                    {participant.checkedIn ? "✓ ATTENDEE IS CHECKED IN" : "⚠️ CHECK-IN PENDING"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "0.2rem" }}>
                    {participant.checkedIn
                      ? `Verified at ${participant.checkedInAt ? new Date(participant.checkedInAt).toLocaleTimeString() : "Stall"}`
                      : "Participant badge not yet validated for admission."}
                  </div>
                </div>

                {!participant.checkedIn && (
                  <button
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={() => handleCheckIn(false)}
                    disabled={checkingIn}
                  >
                    {checkingIn ? "Validating..." : "Confirm Check-In"}
                  </button>
                )}
              </div>

              {/* Points Allocation Form */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.25rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.85rem" }}>
                  Award Performance Points
                </h4>

                <form onSubmit={handleAwardPoints}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Select Point Preset</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      {[50, 100, 150, 250].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`${styles.btn} ${awardPoints === val ? styles.btnPrimary : styles.btnSecondary}`}
                          style={{ padding: "0.45rem", fontSize: "0.8rem", fontWeight: 700 }}
                          onClick={() => setAwardPoints(val)}
                        >
                          +{val} XP
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Custom Points / Activity Reason</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Cleared CTF Flag Alpha, Winner Robo-Duel 1..."
                      value={awardReason}
                      onChange={(e) => setAwardReason(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    style={{ width: "100%", padding: "0.75rem" }}
                    disabled={awarding}
                  >
                    {awarding ? "ALLOCATING XP..." : `▸ AWARD +${awardPoints} XP TO AGENT`}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className={styles.panel} style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>No Agent Dossier Selected</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", maxWidth: 380, margin: "0 auto" }}>
                Scan a participant QR badge or search by Agent ID / PRN on the left to reveal their mission dossier and scoring controls.
              </p>
            </div>
          )}
        </div>
      </div>
    </TeamLayout>
  );
}
