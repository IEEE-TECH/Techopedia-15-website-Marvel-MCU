"use client";

import React, { useState, useEffect } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { sound } from "@/lib/audio";
import styles from "./hudDock.module.css";

interface HudNavDockProps {
  onRegisterClick: () => void;
  onMiniGamesClick: () => void;
}

const SECTIONS = [
  { id: "intro", label: "01 · INTRO", targetRatio: 0.05 },
  { id: "domains", label: "02 · 6 DOMAINS", targetRatio: 0.45 },
  { id: "story", label: "03 · DOSSIERS", targetRatio: 0.65 },
  { id: "timeline", label: "04 · TIMELINE", targetRatio: 0.85 },
  { id: "sponsors", label: "05 · SQUAD & PARTNERS", targetRatio: 0.98 },
];

export default function HudNavDock({ onRegisterClick, onMiniGamesClick }: HudNavDockProps) {
  const [activeSec, setActiveSec] = useState("intro");
  const [scrollPct, setScrollPct] = useState(0);

  useRaf(() => {
    const s = signals.scroll;
    setScrollPct(Math.round(s * 100));

    if (s < 0.35) {
      if (activeSec !== "intro") setActiveSec("intro");
    } else if (s < 0.55) {
      if (activeSec !== "domains") setActiveSec("domains");
    } else if (s < 0.75) {
      if (activeSec !== "story") setActiveSec("story");
    } else if (s < 0.93) {
      if (activeSec !== "timeline") setActiveSec("timeline");
    } else {
      if (activeSec !== "sponsors") setActiveSec("sponsors");
    }
  });

  const jumpTo = (targetRatio: number) => {
    sound.playBlip(780, 0.03);
    const scrollTrack = document.querySelector(".scroll-track");
    if (!scrollTrack) return;
    const maxScroll = scrollTrack.getBoundingClientRect().height - window.innerHeight;
    const targetY = maxScroll * targetRatio;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <aside className={styles.dockWrap} aria-label="Quick Section Navigation">
      <div className={styles.dockBar}>
        <div className={styles.telemetryTag}>
          <span className={styles.dot} />
          <span>NAV HUD // {scrollPct}%</span>
        </div>

        <div className={styles.sectionBtns}>
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`${styles.secBtn} ${activeSec === sec.id ? styles.secBtnActive : ""}`}
              onClick={() => jumpTo(sec.targetRatio)}
              onMouseEnter={() => sound.playBlip(520, 0.02)}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className={styles.actionBtns}>
          <button
            type="button"
            className={styles.arcadeBtn}
            onClick={() => {
              sound.playSuccess();
              onMiniGamesClick();
            }}
          >
            ▸ PLAY MINI-GAMES
          </button>
          <button
            type="button"
            className={styles.registerBtn}
            onClick={() => {
              sound.playSuccess();
              onRegisterClick();
            }}
          >
            ▸ REGISTER
          </button>
        </div>
      </div>
    </aside>
  );
}
