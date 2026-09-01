"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { sound } from "@/lib/audio";
import SoundToggle from "./SoundToggle";
import Button from "./Button";
import { EASE_OUT } from "@/lib/motion";
import styles from "./ui.module.css";

const NAV = [
  { label: "Domains", target: 0.45 },
  { label: "Dossiers", target: 0.65 },
  { label: "Timeline", target: 0.85 },
  { label: "Schedule", href: "/schedule" },
  { label: "Team", target: "team", href: "/team" },
  { label: "Sponsors", target: "sponsors", href: "/sponsors" },
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

  const jumpTo = (target: number | string, fallbackHref?: string) => {
    sound.playBlip(780, 0.03);
    setMenuOpen(false);

    if (typeof target === "string") {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (fallbackHref && typeof window !== "undefined") {
        window.location.href = fallbackHref;
        return;
      }
    }

    const track = document.querySelector(".scroll-track");
    if (!track) {
      if (fallbackHref && typeof window !== "undefined") {
        window.location.href = fallbackHref;
      }
      return;
    }
    const maxScroll = track.getBoundingClientRect().height - window.innerHeight;
    const ratio = typeof target === "number" ? target : 0;
    window.scrollTo({ top: Math.max(0, maxScroll * ratio), behavior: "smooth" });
  };

  const renderNavItem = (n: (typeof NAV)[number], mobile = false) => {
    const className = mobile ? styles.mobileNavLink : styles.navLink;
    if (n.target !== undefined) {
      return (
        <button
          key={n.label}
          type="button"
          className={className}
          onClick={() => jumpTo(n.target, n.href)}
          onMouseEnter={() => sound.playBlip(520, 0.02)}
        >
          {n.label}
        </button>
      );
    }
    return (
      <Link key={n.label} href={n.href!} className={className} onClick={() => setMenuOpen(false)}>
        {n.label}
      </Link>
    );
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
        <Button variant="cyan" size="sm" onClick={onMiniGamesClick}>
          ▸ ARCADE HUB
        </Button>
        <Button variant="primary" size="sm" onClick={onRegisterClick}>
          REGISTER NOW
        </Button>
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
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {NAV.map((n) => renderNavItem(n, true))}
            <SoundToggle />
            <Button
              variant="cyan"
              size="sm"
              style={{ marginTop: "0.6rem" }}
              onClick={() => {
                setMenuOpen(false);
                onMiniGamesClick?.();
              }}
            >
              // ARCADE HUB
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ margin: "0.8rem 0 1.2rem" }}
              onClick={() => {
                setMenuOpen(false);
                onRegisterClick?.();
              }}
            >
              REGISTER NOW
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
