"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { sound } from "@/lib/audio";
import SoundToggle from "./SoundToggle";
import styles from "./ui.module.css";

const NAV = [
  { label: "Domains", targetRatio: 0.45 },
  { label: "Dossiers", targetRatio: 0.65 },
  { label: "Timeline", targetRatio: 0.85 },
  { label: "Schedule", href: "/schedule" },
  { label: "Team", href: "/team" },
  { label: "Sponsors", href: "/sponsors" },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

interface SiteHeaderProps {
  onRegisterClick?: () => void;
  onTerminalClick?: () => void;
  onMiniGamesClick?: () => void;
}

export default function SiteHeader({
  onRegisterClick,
  onTerminalClick,
  onMiniGamesClick,
}: SiteHeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useRaf(() => {
    const el = ref.current;
    if (!el) return;
    // Header is always active and smoothly adjusts opacity if reel begins
    const fadeOutReel = smoothstep(0.85, 0.98, signals.reel);
    const op = Math.max(0.2, 1 - fadeOutReel);
    el.style.opacity = op.toFixed(3);
    el.style.pointerEvents = op > 0.3 ? "auto" : "none";
    el.style.visibility = op < 0.05 ? "hidden" : "visible";
  });

  const jumpTo = (targetRatio: number) => {
    sound.playBlip(780, 0.03);
    const track = document.querySelector(".scroll-track");
    if (!track) return;
    const maxScroll = track.getBoundingClientRect().height - window.innerHeight;
    window.scrollTo({ top: Math.max(0, maxScroll * targetRatio), behavior: "smooth" });
    setMenuOpen(false);
  };

  const renderNavItem = (n: (typeof NAV)[number], mobile = false) => {
    const className = mobile ? styles.mobileNavLink : styles.navLink;
    if (n.href) {
      return <Link key={n.label} href={n.href} className={className} onClick={() => setMenuOpen(false)}>{n.label}</Link>;
    }
    return <button key={n.label} type="button" className={className} onClick={() => n.targetRatio !== undefined && jumpTo(n.targetRatio)} onMouseEnter={() => sound.playBlip(520, 0.02)}>{n.label}</button>;
  };

  return (
    <header ref={ref} className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden />
        <span className={styles.brandText}>
          TECHOPEDIA<b>LEVEL 15</b>
        </span>
      </div>
      <nav className={styles.nav}>
        {NAV.map((n) => renderNavItem(n))}
      </nav>
      <div className={styles.headerActions}>
        <SoundToggle />
        <button
          className={styles.cta}
          type="button"
          onClick={onMiniGamesClick}
          style={{ background: "rgba(0, 229, 255, 0.15)", border: "1px solid rgba(0, 229, 255, 0.6)", color: "#00e5ff", textShadow: "0 0 10px rgba(0, 229, 255, 0.5)" }}
        >
          ▸ ARCADE HUB
        </button>
        <button className={styles.cta} type="button" onClick={onRegisterClick}>
          REGISTER NOW
        </button>
      </div>

      <button
        className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ""}`}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {NAV.map((n) => renderNavItem(n, true))}
            <SoundToggle />
            <button
              className={styles.mobileArcadeBtn}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onMiniGamesClick?.();
              }}
            >
              // Arcade Hub
            </button>
            <button
              className={styles.mobileRegisterBtn}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRegisterClick?.();
              }}
            >
              Register Now
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
