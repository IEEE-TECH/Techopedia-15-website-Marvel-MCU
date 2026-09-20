"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sound } from "@/lib/audio";
import { enqueueAward, flushQueue, getQueue } from "@/lib/scanQueue";
import { LockIcon, WarningIcon, ShieldIcon, CameraIcon, TargetIcon, ScanIcon, SyncIcon } from "@/components/ui/HudIcon";
import type { Participant } from "@/lib/db";
import PageShell from "@/components/ui/PageShell";
import jsQR from "jsqr";
import styles from "./scanner.module.css";

const TOKEN_STORAGE_KEY = "techopedia15_organizer_token";

export default function ScannerPage() {
  // Organizer gate — this is a client-side convenience only. The real
  // security boundary is the ORGANIZER_API_TOKEN check inside
  // /api/scanner itself; a UI gate can always be bypassed by someone
  // calling the API directly, so it must never be the only check.
  const [orgToken, setOrgToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) setOrgToken(saved);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = tokenInput.trim();
    if (!candidate) return;

    setUnlocking(true);
    setTokenError("");
    try {
      // Verify the token using the dedicated auth-check action
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organizer-token": candidate },
        body: JSON.stringify({ action: "auth-check" }),
      });

      if (res.status === 503) {
        setTokenError("ORGANIZER_API_TOKEN is not configured on the server. Please check .env.local.");
        sound.playBlip(300, 0.08);
        return;
      }
      if (res.status === 401 || !res.ok) {
        setTokenError("Incorrect organizer passcode.");
        sound.playBlip(300, 0.08);
        return;
      }

      sessionStorage.setItem(TOKEN_STORAGE_KEY, candidate);
      setOrgToken(candidate);
      sound.playSuccess();
    } catch {
      setTokenError("Could not reach the server. Check your connection and try again.");
    } finally {
      setUnlocking(false);
    }
  };

  if (!orgToken) {
    return (
      <PageShell
        kicker="S.H.I.E.L.D. Protocol · Restricted Area"
        title="Scanner Terminal"
        intro="Enter the organizer passcode to unlock stall scanning and point allocation."
        maxWidth={640}
      >
        <div className={styles.scannerInner} style={{ maxWidth: 440, margin: "1.5rem auto 3rem" }}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <LockIcon size={16} /> ORGANIZER ACCESS REQUIRED
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.5rem 0 1.2rem" }}>
              Enter the event organizer passcode to unlock the scanner terminal. This page can
              award battle points, so it&apos;s restricted to stall coordinators.
            </p>
            <form onSubmit={handleUnlock}>
              <label className={styles.formLabel}>ORGANIZER PASSCODE</label>
              <input
                type="password"
                autoFocus
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className={styles.inputField}
                style={{ width: "100%", marginTop: "0.4rem" }}
                placeholder="Enter organizer passcode"
              />
              <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.4rem" }}>
                Default: <code>techopedia15_stark_shield_pass</code> (Configured in <code>.env.local</code>)
              </p>
              <button
                type="submit"
                className={styles.awardBtn}
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={unlocking || !tokenInput.trim()}
              >
                {unlocking ? "VERIFYING..." : "▸ UNLOCK TERMINAL"}
              </button>
            </form>
            {tokenError && <div className={styles.errorAlert}><WarningIcon size={14} /> {tokenError}</div>}
          </div>
        </div>
      </PageShell>
    );
  }

  return <ScannerTerminal orgToken={orgToken} />;
}

function ScannerTerminal({ orgToken }: { orgToken: string }) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);

  // Point Awarding Form
  const [points, setPoints] = useState<number>(100);
  const [activityTitle, setActivityTitle] = useState("Bug Blitz Arena Victory");
  const [coordinator, setCoordinator] = useState("Stall Coordinator 1");
  const [awarding, setAwarding] = useState(false);

  // Session Log
  const [recentAwards, setRecentAwards] = useState<
    Array<{ id: string; name: string; points: number; title: string; time: string }>
  >([]);

  // Offline award queue — survives a WiFi drop mid-scan (see lib/scanQueue.ts)
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    setQueueCount(getQueue().length);

    const syncQueue = async () => {
      if (getQueue().length === 0) return;
      const result = await flushQueue(orgToken);
      setQueueCount(getQueue().length);
      if (result.succeeded.length > 0) {
        sound.playSuccess();
        setRecentAwards((prev) => [
          ...result.succeeded.map((a) => ({
            id: a.id,
            name: a.participantName,
            points: a.points,
            title: a.activityTitle,
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          })),
          ...prev,
        ]);
        setSuccessMsg(`✓ Reconnected — synced ${result.succeeded.length} queued award(s).`);
      }
      if (result.failed.length > 0) {
        setErrorMsg(`${result.failed.length} queued award(s) were rejected by the server and dropped.`);
      }
    };

    window.addEventListener("online", syncQueue);
    if (navigator.onLine) syncQueue();
    return () => window.removeEventListener("online", syncQueue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgToken]);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>("");
  const [scanLock, setScanLock] = useState(false);

  const attachStream = (stream: MediaStream) => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      // play() can reject if a previous stream swap is still settling on
      // some Android WebViews — that's not a real failure, so swallow it.
      videoRef.current.play().catch(() => {});
    }
    setCameraActive(true);
  };

  const startCamera = async () => {
    sound.playBlip(750, 0.05);
    setErrorMsg("");

    try {
      // Prefer the rear camera for scanning physical QR passes.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      attachStream(stream);
      return;
    } catch (err) {
      // Some Android browsers/WebViews throw OverconstrainedError (or lack
      // a rear camera entirely, e.g. tablets/emulators) when `environment`
      // can't be satisfied. Fall back to whatever camera is available
      // rather than giving up on scanning entirely.
      const name = err instanceof Error ? err.name : "";
      if (name !== "OverconstrainedError" && name !== "NotFoundError") {
        console.warn("Camera access failed or denied:", err);
        setErrorMsg("Camera access not available. Please use manual ID/PRN lookup below.");
        return;
      }
      console.warn("Rear camera unavailable, falling back to default camera:", err);
    }

    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
      attachStream(fallbackStream);
    } catch (err) {
      console.warn("Camera access failed or denied:", err);
      setErrorMsg("Camera access not available. Please use manual ID/PRN lookup below.");
    }
  };

  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanLock(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Continuous Camera QR Decode Loop via jsQR
  useEffect(() => {
    if (!cameraActive) {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      return;
    }

    let lastFrameCheck = 0;
    const frameIntervalMs = 120; // Check ~8 times/sec to conserve battery & CPU

    const scanFrame = (timestamp: number) => {
      if (!cameraActive) return;

      if (timestamp - lastFrameCheck >= frameIntervalMs) {
        lastFrameCheck = timestamp;
        const video = videoRef.current;

        if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
          }
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (ctx) {
            // Downscale frame to max 640px for ultra-fast QR decoding
            const maxDim = 640;
            const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
            const w = Math.floor(video.videoWidth * scale);
            const h = Math.floor(video.videoHeight * scale);

            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }

            ctx.drawImage(video, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (qrCode && qrCode.data) {
              const detected = qrCode.data.trim();
              const now = Date.now();

              // Avoid re-scanning same payload within 3 seconds
              if (
                detected !== lastScannedCodeRef.current ||
                now - lastScannedTimeRef.current > 3000
              ) {
                lastScannedCodeRef.current = detected;
                lastScannedTimeRef.current = now;

                // Visual lock-on + audio confirmation
                setScanLock(true);
                sound.playSuccess();
                setTimeout(() => setScanLock(false), 1400);

                // Extract human-friendly agent ID or PRN if JSON/URL
                let displayId = detected;
                try {
                  const parsed = JSON.parse(detected);
                  displayId = parsed.id || parsed.prn || detected;
                } catch {
                  const match = detected.match(/TECH15-[A-Z]+-\d+/i) || detected.match(/dashboard\/([^/?#]+)/i);
                  if (match) displayId = match[1] || match[0];
                }

                setIdentifier(displayId);
                handleLookup(detected);
              }
            }
          }
        }
      }

      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
    };
  }, [cameraActive]);

  // Lookup Agent
  const handleLookup = async (lookupId: string) => {
    const idToSearch = lookupId.trim();
    if (!idToSearch) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    sound.playBlip(550, 0.04);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lookup", identifier: idToSearch }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Agent not found in registry.");
      }

      setParticipant(data.participant);
      sound.playSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error finding agent.");
      setParticipant(null);
      sound.playBlip(300, 0.08);
    } finally {
      setLoading(false);
    }
  };

  // Queue an award locally when it can't reach the server right now —
  // dropped WiFi at a stall shouldn't lose the scan.
  const queueAwardLocally = (reason: string) => {
    if (!participant) return;
    enqueueAward({
      identifier: participant.agentId,
      points,
      activityTitle,
      scannedBy: coordinator,
      participantName: participant.name,
    });
    setQueueCount(getQueue().length);
    setSuccessMsg(
      `${reason} — queued +${points} PTS for ${participant.name}. Will sync automatically once reconnected.`
    );
    sound.playBlip(500, 0.05);
  };

  // Award Points
  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant) return;

    setAwarding(true);
    setErrorMsg("");
    setSuccessMsg("");
    sound.playBlip(800, 0.04);

    if (!navigator.onLine) {
      queueAwardLocally("Offline");
      setAwarding(false);
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-organizer-token": orgToken },
        body: JSON.stringify({
          action: "award",
          identifier: participant.agentId,
          points,
          activityTitle,
          scannedBy: coordinator,
        }),
      });
    } catch {
      // fetch() itself rejected — a real network failure (WiFi dropped mid-
      // request), not a server rejection. Queue instead of hard-erroring.
      queueAwardLocally("Connection lost");
      setAwarding(false);
      return;
    }

    try {
      const data = await res.json();
      if (res.status === 401) {
        // Passcode was valid at unlock time but has since been rotated/rejected —
        // drop back to the gate rather than let the coordinator keep retrying blind.
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        window.location.reload();
        return;
      }
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to allocate points.");
      }

      setParticipant(data.participant);
      setSuccessMsg(`✓ Successfully awarded +${points} PTS to ${data.participant.name}!`);
      sound.playSuccess();

      // Add to session log
      setRecentAwards((prev) => [
        {
          id: Date.now().toString(),
          name: data.participant.name,
          points,
          title: activityTitle,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Awarding points failed.");
      sound.playBlip(320, 0.08);
    } finally {
      setAwarding(false);
    }
  };

  return (
    <PageShell
      kicker="Tactical Scanner & Point Dispatch"
      title="Stall Verification Portal"
      intro="Scan participant QR passes or enter PRN / Agent ID to verify clearance and allocate real-time battle points with instant Google Sheets synchronization."
      maxWidth={1320}
    >
      <div className={styles.scannerContainer}>
        <div className={styles.scannerInner}>
          {/* Status Sub-bar */}
          <div className={styles.headerRow}>
            <div className={styles.shieldBadge} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <ShieldIcon size={13} /> IEEE TECHOPEDIA 15 ORGANIZER TERMINAL
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {queueCount > 0 && (
                <div
                  className={styles.shieldBadge}
                  style={{ background: "rgba(0, 229, 255, 0.15)", borderColor: "#00e5ff", color: "#00e5ff", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  title="Awards queued locally, waiting for connection to sync"
                >
                  <SyncIcon size={12} spinning /> {queueCount} PENDING SYNC
                </div>
              )}
              <button
                type="button"
                className={styles.lockBtn}
                onClick={() => {
                  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                  window.location.reload();
                }}
              >
                <LockIcon size={12} /> LOCK TERMINAL
              </button>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className={styles.grid}>
          {/* Column 1: Scan & Search Panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <CameraIcon size={16} /> TACTICAL SCANNER & AGENT LOOKUP
            </div>

            {/* Camera Viewport */}
            <div className={styles.cameraBox}>
              {cameraActive ? (
                <>
                  <video ref={videoRef} className={styles.cameraVideo} playsInline muted />
                  <div className={`${styles.reticle} ${scanLock ? styles.reticleLocked : ""}`}>
                    <div className={styles.scanLaser} />
                  </div>
                  {scanLock && (
                    <div style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(16, 185, 129, 0.95)",
                      color: "#000000",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      letterSpacing: "1.5px",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontFamily: "var(--font-orbitron)",
                      boxShadow: "0 0 15px rgba(16, 185, 129, 0.6)",
                      zIndex: 10,
                      pointerEvents: "none"
                    }}>
                      TARGET LOCKED ✓
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.cameraPlaceholder}>
                  <CameraIcon size={40} />
                  <div>Camera Inactive</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Enable camera to scan physical QR passes or use manual lookup
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.toggleCameraBtn}
              onClick={cameraActive ? stopCamera : startCamera}
            >
              {cameraActive ? "⏹ TURN OFF CAMERA" : "▶ START QR CAMERA SCANNER"}
            </button>

            <div style={{ margin: "1.5rem 0 0.8rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
              <label className={styles.formLabel}>MANUAL AGENT ID / PRN LOOKUP</label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup(identifier);
                }}
                className={styles.inputForm}
              >
                <input
                  type="text"
                  placeholder="e.g. TECH15-STARK-1001 or 2023CS0101"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={styles.inputField}
                />
                <button type="submit" className={styles.searchBtn} disabled={loading}>
                  {loading ? "SEARCHING..." : "VERIFY"}
                </button>
              </form>
            </div>

            {/* Quick Demo Test Chips */}
            <div className={styles.sampleChips}>
              <span className={styles.sampleLabel}>QUICK TEST:</span>
              <button
                type="button"
                className={styles.chip}
                onClick={() => {
                  setIdentifier("TECH15-STARK-1001");
                  handleLookup("TECH15-STARK-1001");
                }}
              >
                TECH15-STARK-1001
              </button>
              <button
                type="button"
                className={styles.chip}
                onClick={() => {
                  setIdentifier("2023IT0204");
                  handleLookup("2023IT0204");
                }}
              >
                2023IT0204 (Abhang)
              </button>
              <button
                type="button"
                className={styles.chip}
                onClick={() => {
                  setIdentifier("TECH15-XMEN-3091");
                  handleLookup("TECH15-XMEN-3091");
                }}
              >
                TECH15-XMEN-3091
              </button>
            </div>

            {errorMsg && <div className={styles.errorAlert}><WarningIcon size={14} /> {errorMsg}</div>}
          </div>

          {/* Column 2: Agent Dossier & Awarding Panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <TargetIcon size={16} /> ALLOCATE BATTLE POINTS
            </div>

            {participant ? (
              <>
                {/* Agent Card */}
                <div className={styles.participantCard}>
                  <div className={styles.participantHeader}>
                    <div>
                      <div className={styles.agentName}>{participant.name}</div>
                      <div className={styles.agentCode}>{participant.agentId}</div>
                    </div>
                    <div className={styles.pointsBadge}>{participant.points} PTS</div>
                  </div>

                  <div className={styles.metaGrid}>
                    <div>PRN: <strong>{participant.prn}</strong></div>
                    <div>DOMAIN: <strong>{participant.domain}</strong></div>
                    <div>COLLEGE: <strong>{participant.college}</strong></div>
                    <div>SQUAD: <strong>{participant.teamName || "Solo"}</strong></div>
                  </div>
                </div>

                {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

                {/* Point Allocation Form */}
                <form onSubmit={handleAward} className={styles.awardSection}>
                  <div>
                    <label className={styles.formLabel}>SELECT POINT VALUE</label>
                    <div className={styles.pointPresets}>
                      {[50, 100, 150, 250].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className={`${styles.presetBtn} ${points === val ? styles.presetBtnActive : ""}`}
                          onClick={() => {
                            setPoints(val);
                            sound.playBlip(700, 0.03);
                          }}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.customInputs}>
                    <div>
                      <label className={styles.formLabel}>ACTIVITY / GAME TITLE</label>
                      <input
                        type="text"
                        required
                        value={activityTitle}
                        onChange={(e) => setActivityTitle(e.target.value)}
                        className={styles.inputField}
                        style={{ width: "100%", marginTop: "0.3rem" }}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>COORDINATOR / STALL NAME</label>
                      <input
                        type="text"
                        required
                        value={coordinator}
                        onChange={(e) => setCoordinator(e.target.value)}
                        className={styles.inputField}
                        style={{ width: "100%", marginTop: "0.3rem" }}
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.awardBtn} disabled={awarding}>
                    {awarding ? "SYNCING TO GOOGLE SHEETS..." : `▸ AWARD +${points} POINTS NOW`}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 1.5rem" }}>
                <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
                  <ScanIcon size={32} />
                </div>
                <div>No Agent Verified Yet</div>
                <div style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>
                  Scan a QR code or search by PRN to load participant credentials and award points.
                </div>
              </div>
            )}

            {/* Session Logs */}
            {recentAwards.length > 0 && (
              <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                <div className={styles.formLabel} style={{ marginBottom: "0.6rem" }}>
                  RECENT SCANS IN THIS SESSION
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {recentAwards.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(0,0,0,0.4)",
                        padding: "0.5rem 0.8rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div>
                        <strong>{item.name}</strong> · <span style={{ color: "#94a3b8" }}>{item.title}</span>
                      </div>
                      <div style={{ color: "#ffd700", fontWeight: 800 }}>+{item.points} PTS</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </PageShell>
  );
}
