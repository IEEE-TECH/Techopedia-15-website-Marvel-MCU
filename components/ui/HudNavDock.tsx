"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { sound } from "@/lib/audio";
import { getDefaultEvent, getEventRegistrationPath } from "@/lib/eventData";
import Button from "./Button";
import styles from "./hudDock.module.css";

interface HudNavDockProps {
  onRegisterClick: () => void;
  onMiniGamesClick: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href?: string;
  targetRatio?: number;
  elementId?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "intro", label: "01 · INTRO", targetRatio: 0.03 },
  { id: "domains", label: "02 · DOMAINS", targetRatio: 0.45 },
  { id: "story", label: "03 · DOSSIERS", targetRatio: 0.65 },
  { id: "schedule", label: "04 · SCHEDULE", href: "/schedule" },
  { id: "leaderboard", label: "05 · LEADERBOARD", href: "/leaderboard" },
  { id: "team", label: "06 · TEAM", elementId: "team", href: "/team" },
];

const smoothScrollTo = (top: number) => {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (value: number, options?: { duration?: number }) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(Math.max(0, top), { duration: 1.15 });
    return;
  }
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

export default function HudNavDock({ onRegisterClick, onMiniGamesClick }: HudNavDockProps) {
  const router = useRouter();
  const [activeSec, setActiveSec] = useState("intro");
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(sound.enabled);

  const handleAudioAction = () => {
    if (!sound.enabled) {
      sound.toggle();
      setAudioActive(true);
    }
    sound.playMarvelFanfare(true);
    sound.startAmbient();
    setAudioActive(true);
  };

  const handleRegister = () => {
    setMobileMenuOpen(false);
    if (onRegisterClick) {
      onRegisterClick();
      return;
    }
    router.push(getEventRegistrationPath(getDefaultEvent()));
  };

  useRaf(() => {
    const s = signals.scroll;
    setScrollPct(Math.round(s * 100));

    const teamEl = document.getElementById("team");
    const scrollY = window.scrollY;

    if (teamEl && scrollY >= teamEl.offsetTop - 350) {
      if (activeSec !== "team") setActiveSec("team");
    } else if (s < 0.35) {
      if (activeSec !== "intro") setActiveSec("intro");
    } else if (s < 0.55) {
      if (activeSec !== "domains") setActiveSec("domains");
    } else if (s < 0.75) {
      if (activeSec !== "story") setActiveSec("story");
    } else {
      if (activeSec !== "schedule") setActiveSec("schedule");
    }
  });

  const jumpTo = (item: NavItem) => {
    sound.playBlip(780, 0.03);
    setMobileMenuOpen(false);

    // If an element exists on the page (e.g. #team on the home page), scroll to it
    if (item.elementId) {
      const el = document.getElementById(item.elementId);
      if (el) {
        smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - 70);
        return;
      }
      if (item.href) {
        router.push(item.href);
        return;
      }
    }

    // Scroll track ratio jump (intro, domains, dossiers)
    if (item.targetRatio !== undefined) {
      const scrollTrack = document.querySelector(".scroll-track");
      if (scrollTrack) {
        const maxScroll = scrollTrack.getBoundingClientRect().height - window.innerHeight;
        const targetY = maxScroll * item.targetRatio;
        smoothScrollTo(targetY);
        return;
      }
    }

    // Direct route link (schedule, leaderboard, team)
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <aside className={styles.dockWrap} aria-label="HUD Top Navigation">
      <div className={styles.dockBar}>
        {/* Left: Brand & Telemetry */}
        <div className={styles.leftGroup}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => jumpTo({ id: "intro", label: "01 · INTRO", targetRatio: 0.02 })}
            title="Techopedia Level 15"
          >
            <span className={styles.mark} aria-hidden />
            <span className={styles.brandText}>
              TECHOPEDIA<b>LEVEL 15</b>
            </span>
          </button>

          <div className={styles.telemetryTag}>
            <span className={styles.dot} />
            <span>NAV HUD // {scrollPct}%</span>
          </div>
        </div>

        {/* Center: Connected Page/Section Nav Pills */}
        <nav className={styles.sectionBtns} aria-label="Page Navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.secBtn} ${activeSec === item.id ? styles.secBtnActive : ""}`}
              onClick={() => jumpTo(item)}
              onMouseEnter={() => sound.playBlip(520, 0.02)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Sound, Arcade Hub, Register & Mobile Toggle */}
        <div className={styles.rightGroup}>
          <button
            type="button"
            className={`${styles.fanfareBtn} ${audioActive ? styles.fanfareBtnActive : ""}`}
            onClick={handleAudioAction}
            title="Play Marvel Fanfare Theme & Continuous Ambient Audio"
          >
            🔊 {audioActive ? "SOUND: ON" : "SOUND: OFF"}
          </button>

          <Button
            size="sm"
            radius="pill"
            variant="cyan"
            onClick={() => {
              sound.playBlip(600, 0.03);
              onMiniGamesClick();
            }}
          >
            ▸ ARCADE HUB
          </Button>

          <Button
            size="sm"
            radius="pill"
            variant="alert"
            onClick={handleRegister}
          >
            REGISTER NOW
          </Button>

          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileDrawer}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.mobileItem} ${activeSec === item.id ? styles.mobileItemActive : ""}`}
                onClick={() => jumpTo(item)}
              >
                {item.label}
              </button>
            ))}
            <div className={styles.mobileActions}>
              <button
                type="button"
                className={styles.fanfareBtn}
                onClick={() => {
                  handleAudioAction();
                  setMobileMenuOpen(false);
                }}
              >
                🔊 {audioActive ? "SOUND: ON" : "PLAY SOUND"}
              </button>
              <Button
                variant="cyan"
                size="sm"
                radius="pill"
                onClick={() => {
                  onMiniGamesClick();
                  setMobileMenuOpen(false);
                }}
              >
                ▸ ARCADE HUB
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
