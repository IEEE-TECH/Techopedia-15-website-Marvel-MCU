"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sound } from "@/lib/audio";
import { CloseIcon, CheckIcon, ShieldIcon, SaveIcon, PrintIcon, ClipboardIcon } from "./HudIcon";
import styles from "./digitalIdCard.module.css";

export interface DigitalIdCardProps {
  participant: {
    agentId: string;
    name: string;
    prn: string;
    college?: string;
    domain?: string;
    teamName?: string;
    teamSize?: string;
    points?: number;
    rank?: number;
    qrCodeUrl?: string;
  };
  showActions?: boolean;
  showDashboardLink?: boolean;
}

export default function DigitalIdCard({
  participant,
  showActions = true,
  showDashboardLink = true,
}: DigitalIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
  const [touching, setTouching] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Full-screen QR modal: lock background scroll while open, close on Escape.
  useEffect(() => {
    if (!qrModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [qrModalOpen]);

  const openQrModal = () => {
    if (!participant.qrCodeUrl) return;
    sound.playBlip(700, 0.05);
    setQrModalOpen(true);
  };

  const closeQrModal = () => {
    sound.playBlip(500, 0.04);
    setQrModalOpen(false);
  };

  const applyTiltFromPoint = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // tilt max 12 deg
    const rotateY = ((x - centerX) / centerX) * 12;

    const sheenX = (x / rect.width) * 100;
    const sheenY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, sheenX, sheenY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    applyTiltFromPoint(e.clientX, e.clientY);
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50 });
  };

  // Touch equivalent of the mouse-tilt effect.
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    applyTiltFromPoint(touch.clientX, touch.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouching(true);
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    setTouching(false);
    resetTilt();
  };

  const handleCopyId = () => {
    sound.playSuccess();
    navigator.clipboard.writeText(participant.agentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playBlip(750, 0.04);
    window.print();
  };

  const handleDownloadPass = async () => {
    try {
      setIsSaving(true);
      sound.playBlip(750, 0.04);

      const canvas = document.createElement("canvas");
      const width = 640;
      const height = 860;
      canvas.width = width * 2; // 2x for Retina sharpness
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      ctx.scale(2, 2);

      // 1. Base dark background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#080b12");
      bgGrad.addColorStop(0.5, "#0e131d");
      bgGrad.addColorStop(1, "#06070a");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 16);
      ctx.fill();

      // 2. Outer border with Stark gold & cyan accents
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
      ctx.stroke();

      // Corner accent brackets
      const bracketLen = 24;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#00e5ff";
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(12, 12 + bracketLen); ctx.lineTo(12, 12); ctx.lineTo(12 + bracketLen, 12);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - 12 - bracketLen, 12); ctx.lineTo(width - 12, 12); ctx.lineTo(width - 12, 12 + bracketLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(12, height - 12 - bracketLen); ctx.lineTo(12, height - 12); ctx.lineTo(12 + bracketLen, height - 12);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - 12 - bracketLen, height - 12); ctx.lineTo(width - 12, height - 12); ctx.lineTo(width - 12, height - 12 - bracketLen);
      ctx.stroke();

      // 3. Header Bar
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(16, 16, width - 32, 54);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, width - 32, 54);

      // Title & subtitle
      ctx.fillStyle = "#ffd700";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("TECHOPEDIA 15", 32, 42);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("IEEE SIESGST · LEVEL 15 ACCESS", 32, 57);

      // Clearance Badge
      ctx.fillStyle = "rgba(237, 29, 36, 0.25)";
      ctx.beginPath();
      ctx.roundRect(width - 170, 26, 138, 32, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(237, 29, 36, 0.8)";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LVL-15 GRANTED", width - 101, 46);
      ctx.textAlign = "left";

      // 4. Agent Header
      ctx.fillStyle = "#00e5ff";
      ctx.font = "700 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("STARK INDUSTRIES PROTOCOL // LEVEL 15", 32, 105);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 24px system-ui, -apple-system, sans-serif";
      ctx.fillText((participant.name || "AGENT").toUpperCase(), 32, 135);

      ctx.fillStyle = "#ffd700";
      ctx.font = "700 13px 'Courier New', monospace";
      ctx.fillText(participant.agentId, 32, 156);

      // Arc reactor circle on top right
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width - 50, 130, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(width - 50, 130, 6, 0, Math.PI * 2);
      ctx.fill();

      // 5. Center Section: QR code + Stats box
      const qrSize = 130;
      const qrX = 32;
      const qrY = 180;

      // QR white backdrop container
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 8);
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Load QR code image if available
      if (participant.qrCodeUrl) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, qrX + 5, qrY + 5, qrSize - 10, qrSize - 10);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = participant.qrCodeUrl!;
        });
      }

      // Stats column next to QR
      const statsX = qrX + qrSize + 24;
      const statsWidth = width - statsX - 32;

      ctx.fillStyle = "rgba(8, 14, 26, 0.75)";
      ctx.beginPath();
      ctx.roundRect(statsX, qrY, statsWidth, qrSize, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // PRN
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("AGENT PRN", statsX + 16, qrY + 28);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 14px 'Courier New', monospace";
      ctx.fillText(participant.prn, statsX + 16, qrY + 46);

      // Points
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("BATTLE POINTS", statsX + 16, qrY + 76);
      ctx.fillStyle = "#ffd700";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${participant.points ?? 100} PTS`, statsX + 16, qrY + 98);

      // Rank
      if (participant.rank) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "700 10px system-ui, -apple-system, sans-serif";
        ctx.fillText("LEADERBOARD RANK", statsX + 16, qrY + 116);
        ctx.fillStyle = "#00e5ff";
        ctx.font = "800 14px system-ui, -apple-system, sans-serif";
        ctx.fillText(`#${participant.rank}`, statsX + 130, qrY + 116);
      }

      // 6. Details Grid
      const gridY = 330;
      const itemW = (width - 64 - 16) / 2;

      // Domain
      ctx.fillStyle = "rgba(0, 229, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(32, gridY, itemW, 58, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "700 9px system-ui, -apple-system, sans-serif";
      ctx.fillText("EVENT DOMAIN", 44, gridY + 22);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(participant.domain || "Squabble", 44, gridY + 44);

      // Squad
      ctx.fillStyle = "rgba(0, 229, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(32 + itemW + 16, gridY, itemW, 58, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "700 9px system-ui, -apple-system, sans-serif";
      ctx.fillText("SQUAD / TEAM", 32 + itemW + 28, gridY + 22);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(participant.teamName || "Solo Operator", 32 + itemW + 28, gridY + 44);

      // Institution
      const instY = gridY + 68;
      ctx.fillStyle = "rgba(0, 229, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(32, instY, width - 64, 52, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "700 9px system-ui, -apple-system, sans-serif";
      ctx.fillText("INSTITUTION", 44, instY + 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 13px system-ui, -apple-system, sans-serif";
      ctx.fillText(participant.college || "SIES GST", 44, instY + 40);

      // 7. Security Barcode & Event Dates
      const secY = 475;
      ctx.fillStyle = "rgba(12, 19, 32, 0.8)";
      ctx.beginPath();
      ctx.roundRect(32, secY, width - 64, 60, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
      ctx.stroke();

      // Simulated barcode lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      let barX = 48;
      const barPatterns = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 3, 4, 2];
      for (const w of barPatterns) {
        ctx.fillRect(barX, secY + 12, w, 22);
        barX += w + 2;
      }

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "700 10px 'Courier New', monospace";
      ctx.fillText(`SEC-AUTH-${participant.prn}`, 48, secY + 48);

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffd700";
      ctx.font = "700 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("OCT 16–17, 2026", width - 48, secY + 26);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("SIES GST CAMPUS", width - 48, secY + 44);
      ctx.textAlign = "left";

      // 8. Footer Bar
      const footY = height - 46;
      ctx.fillStyle = "rgba(4, 6, 10, 0.95)";
      ctx.fillRect(16, footY, width - 32, 30);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "700 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("SEC-ENCRYPTED", 32, footY + 20);

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffd700";
      ctx.font = "700 10px system-ui, -apple-system, sans-serif";
      ctx.fillText("OFFICIAL ENTRY PASS", width - 32, footY + 20);
      ctx.textAlign = "left";

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Techopedia15_Pass_${participant.prn || participant.agentId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      sound.playSuccess();
    } catch (err) {
      console.error("Failed to generate pass PNG:", err);
      window.print();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.cardWrapper}>
      <div
        ref={cardRef}
        className={`${styles.cardContainer} ${touching ? styles.cardTouching : ""}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          touchAction: "pan-y",
        }}
      >
        {/* Futuristic Corner HUD Accents */}
        <div className={styles.cornerTL} aria-hidden />
        <div className={styles.cornerTR} aria-hidden />
        <div className={styles.cornerBL} aria-hidden />
        <div className={styles.cornerBR} aria-hidden />

        {/* Holographic Sheen Layer */}
        <div
          className={styles.holoSheen}
          style={{
            backgroundPosition: `${tilt.sheenX}% ${tilt.sheenY}%`,
          }}
        />

        {/* Header Bar */}
        <div className={styles.cardHeader}>
          <div className={styles.orgBrand}>
            <span className={styles.orgLogo}>
              <span className={styles.orgDot} />
              TECHOPEDIA 15
            </span>
            <span className={styles.orgSubtitle}>IEEE SIESGST · LEVEL 15 ACCESS</span>
          </div>
          <div className={styles.clearanceBadge}>
            LVL-15 GRANTED
          </div>
        </div>

        {/* Card Body */}
        <div className={styles.cardBody}>
          <div className={styles.agentHeader}>
            <div className={styles.agentInfo}>
              <span className={styles.agentKicker}>STARK INDUSTRIES PROTOCOL // LEVEL 15</span>
              <div className={styles.agentName}>{participant.name}</div>
              <div className={styles.agentCodeBadge}>
                <span className={styles.agentCode}>{participant.agentId}</span>
              </div>
            </div>
            <div className={styles.reactorIcon} title="Arc Reactor Core Active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2">
                <circle cx="12" cy="12" r="9" stroke="#00e5ff" />
                <circle cx="12" cy="12" r="4" fill="#00e5ff" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#00e5ff" />
              </svg>
            </div>
          </div>

          {/* Center Section: Scannable QR + Live Points */}
          <div className={styles.cardCenter}>
            <div
              className={styles.qrWrap}
              onClick={openQrModal}
              role={participant.qrCodeUrl ? "button" : undefined}
              tabIndex={participant.qrCodeUrl ? 0 : undefined}
              aria-label={participant.qrCodeUrl ? "Open full-screen QR code for scanning" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openQrModal();
                }
              }}
              style={{ cursor: participant.qrCodeUrl ? "pointer" : "default" }}
            >
              {participant.qrCodeUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={participant.qrCodeUrl}
                    alt={`QR Code Pass for ${participant.name}`}
                    className={styles.qrImage}
                  />
                  <span className={styles.qrTapHint}>TAP TO ZOOM</span>
                </>
              ) : (
                <div style={{ width: 96, height: 96, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#333" }}>
                  QR CODE
                </div>
              )}
            </div>

            <div className={styles.statsColumn}>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>AGENT PRN</span>
                <span className={styles.statValue}>{participant.prn}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>BATTLE POINTS</span>
                <span className={styles.statPoints}>
                  {participant.points ?? 100} <span className={styles.ptsUnit}>PTS</span>
                </span>
              </div>
              {participant.rank && (
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>LEADERBOARD RANK</span>
                  <span className={styles.statRank}>
                    #{participant.rank}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailTitle}>EVENT DOMAIN</span>
              <span className={styles.detailText}>{participant.domain || "Squabble"}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailTitle}>SQUAD / TEAM</span>
              <span className={styles.detailText}>{participant.teamName || "Solo Operator"}</span>
            </div>
            <div className={styles.detailItem} style={{ gridColumn: "span 2" }}>
              <span className={styles.detailTitle}>INSTITUTION</span>
              <span className={styles.detailText}>{participant.college || "SIES GST"}</span>
            </div>
          </div>

          {/* Security & Access Strip */}
          <div className={styles.securityStrip}>
            <div className={styles.barcodeBox}>
              <div className={styles.barcodeLines} aria-hidden />
              <span className={styles.barcodeCode}>SEC-AUTH-{participant.prn}</span>
            </div>
            <div className={styles.eventDates}>
              <span className={styles.eventDatesTitle}>OCT 16–17, 2026</span>
              <span className={styles.eventVenue}>SIES GST CAMPUS</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className={styles.cardFooter}>
          <div className={styles.securityChip}>
            <ShieldIcon size={13} /> <span>SEC-ENCRYPTED</span>
          </div>
          <span className={styles.secPassType}>OFFICIAL ENTRY PASS</span>
        </div>
      </div>

      {showActions && (
        <div className={styles.actionsBar}>
          <button type="button" className={styles.actionBtn} onClick={handleCopyId}>
            {copied ? (
              <>
                <CheckIcon size={14} /> Copied
              </>
            ) : (
              <>
                <ClipboardIcon size={14} /> Copy ID
              </>
            )}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleDownloadPass}
            disabled={isSaving}
          >
            <SaveIcon size={14} /> {isSaving ? "Saving..." : "Save pass"}
          </button>
          <button type="button" className={styles.actionBtn} onClick={handlePrint}>
            <PrintIcon size={14} /> Print pass
          </button>
          {showDashboardLink ? (
            <Link
              href={`/dashboard/${participant.agentId}`}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => sound.playBlip(800, 0.05)}
            >
              ▸ Live dashboard →
            </Link>
          ) : (
            <Link
              href="/leaderboard"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => sound.playBlip(800, 0.05)}
            >
              ▸ Leaderboard →
            </Link>
          )}
        </div>
      )}

      {qrModalOpen && participant.qrCodeUrl && (
        <div
          className={styles.qrModalOverlay}
          onClick={closeQrModal}
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen scannable QR pass"
        >
          <button
            type="button"
            className={styles.qrModalClose}
            onClick={closeQrModal}
            aria-label="Close QR code"
          >
            <CloseIcon size={18} />
          </button>

          <div className={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={participant.qrCodeUrl}
              alt={`Full-screen QR code pass for ${participant.name}`}
              className={styles.qrModalImage}
            />
            <div className={styles.qrModalName}>{participant.name}</div>
            <div className={styles.qrModalCode}>
              {participant.agentId} · PRN {participant.prn}
            </div>
            <div className={styles.qrModalHint}>Hold steady under the gate scanner</div>
          </div>
        </div>
      )}
    </div>
  );
}
