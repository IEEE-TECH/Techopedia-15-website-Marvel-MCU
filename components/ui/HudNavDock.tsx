"use client";

import React, { useState, useEffect } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { sound } from "@/lib/audio";
import Button from "./Button";
import styles from "./hudDock.module.css";

interface HudNavDockProps {
  onRegisterClick: () => void;
  onMiniGamesClick: () => void;
}

interface SectionItem {
  id: string;
  label: string;
  targetRatio?: number;
  elementId?: string;
}

const SECTIONS: SectionItem[] = [
  { id: "intro", label: "01 · INTRO", targetRatio: 0.05 },
  { id: "domains", label: "02 · DOMAINS", targetRatio: 0.45 },
  { id: "story", label: "03 · DOSSIERS", targetRatio: 0.65 },
  { id: "timeline", label: "04 · TIMELINE", targetRatio: 0.85 },
  { id: "team", label: "05 · TEAM", elementId: "team" },
  { id: "sponsors", label: "06 · SPONSORS", elementId: "sponsors" },
];

export default function HudNavDock({ onRegisterClick, onMiniGamesClick }: HudNavDockProps) {
  const [activeSec, setActiveSec] = useState("intro");
  const [scrollPct, setScrollPct] = useState(0);

  useRaf(() => {
    const s = signals.scroll;
    setScrollPct(Math.round(s * 100));

    const sponsorsEl = document.getElementById("sponsors");
    const teamEl = document.getElementById("team");
    const scrollY = window.scrollY;

    if (sponsorsEl && scrollY >= sponsorsEl.offsetTop - 350) {
      if (activeSec !== "sponsors") setActiveSec("sponsors");
    } else if (teamEl && scrollY >= teamEl.offsetTop - 350) {
      if (activeSec !== "team") setActiveSec("team");
    } else if (s < 0.35) {
      if (activeSec !== "intro") setActiveSec("intro");
    } else if (s < 0.55) {
      if (activeSec !== "domains") setActiveSec("domains");
    } else if (s < 0.75) {
      if (activeSec !== "story") setActiveSec("story");
    } else {
      if (activeSec !== "timeline") setActiveSec("timeline");
    }
  });

  const jumpTo = (sec: SectionItem) => {
    sound.playBlip(780, 0.03);
    if (sec.elementId) {
      const el = document.getElementById(sec.elementId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    const scrollTrack = document.querySelector(".scroll-track");
    if (!scrollTrack) return;
    const maxScroll = scrollTrack.getBoundingClientRect().height - window.innerHeight;
    const targetY = maxScroll * (sec.targetRatio ?? 0);
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
              onClick={() => jumpTo(sec)}
              onMouseEnter={() => sound.playBlip(520, 0.02)}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className={styles.actionBtns}>
          <Button
            size="sm"
            radius="pill"
            variant="ghost"
            onClick={() => onMiniGamesClick()}
          >
            ▸ MINI-GAMES
          </Button>
          <Button
            size="sm"
            radius="pill"
            variant="gold"
            onClick={() => onRegisterClick()}
          >
            ▸ REGISTER
          </Button>
        </div>
      </div>
    </aside>
  );
}
