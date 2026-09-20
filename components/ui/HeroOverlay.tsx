"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { signals } from "@/lib/signals";
import { VIDEO } from "@/lib/constants";
import { useRaf } from "@/lib/useRaf";
import { getDefaultEvent, getEventRegistrationPath } from "@/lib/eventData";
import styles from "./ui.module.css";

interface HeroOverlayProps {
  onRegisterClick?: () => void;
  onMiniGamesClick?: () => void;
}

export default function HeroOverlay({ onRegisterClick, onMiniGamesClick }: HeroOverlayProps) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const handleRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
      return;
    }
    router.push(getEventRegistrationPath(getDefaultEvent()));
  };

  useRaf(() => {
    const el = wrapRef.current;
    if (!el) return;
    const h = signals.heroOp;
    el.style.opacity = h.toFixed(3);
    el.style.visibility = h < 0.01 ? "hidden" : "visible";
    el.style.pointerEvents = h > 0.6 ? "auto" : "none";
    if (barRef.current) {
      const p = Math.min(1, Math.max(0, signals.heroT / VIDEO.heroDur));
      barRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
    }
  });

  return (
    <div ref={wrapRef} className={styles.heroUi} style={{ opacity: 0 }} aria-hidden>
      <div className={styles.heroText}>
        <div className={styles.heroBadgeRow}>
          <span className={styles.heroKicker}>IEEE TECHOPEDIA 15.0</span>
          <span className={styles.heroStatus}>[ SYSTEM STATUS: ACTIVE ]</span>
        </div>
        <h1 className={styles.heroTitleText}>DECODING THE FUTURE</h1>
        <p className={styles.heroSubText}>
          04 Heroic Events · Debate · Quiz · PPT Presentation · IR Laser Tag
        </p>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.heroActionBtn}
            onClick={onMiniGamesClick}
          >
            // ENTER ARCADE
          </button>
          <button
            type="button"
            className={styles.heroRegisterBtn}
            onClick={handleRegister}
          >
            // INITIATE REGISTRATION
          </button>
        </div>
      </div>

      <div className={styles.heroScrub}>
        <span className={styles.heroScrubLabel}>Scroll to reveal domains &amp; roadmap</span>
        <span className={styles.scrubTrack}>
          <span ref={barRef} className={styles.scrubFill} />
        </span>
      </div>
    </div>
  );
}
