"use client";

import { useRef } from "react";
import { signals } from "@/lib/signals";
import { TIMELINE_UNITS } from "@/lib/constants";
import { useRaf } from "@/lib/useRaf";
import styles from "./cinematic.module.css";

type Variant = "rise" | "chroma" | "loom" | "metallic" | "avengers";
interface Beat {
  id: string;
  lines: string[];
  startU: number;
  endU: number;
  variant: Variant;
  kicker?: string;
  subtitle?: string;
}

/**
 * Cinematic storytelling copy, scrubbed by scroll.
 * Opens IMMEDIATELY with TECHOPEDIA 15 in grand Avengers font!
 */
const BEATS: Beat[] = [
  // ── Section 1 · Grand Opening: Techopedia 15 in Avengers style right as site opens! ──
  {
    id: "hero-opening",
    lines: ["TECHOPEDIA 15"],
    startU: 0.0,
    endU: 1.8,
    variant: "avengers",
    kicker: "IEEE STUDENT BRANCH PRESENTS",
    subtitle: "ANNUAL NATIONAL TECHNICAL SYMPOSIUM · THE MULTIVERSE OF INNOVATION"
  },
  {
    id: "rift",
    lines: ["LEVEL 15 UNLOCKED"],
    startU: 3.9,
    endU: 4.6,
    variant: "chroma",
    kicker: "SECURITY BREACH DETECTED"
  },
  // ── Hero · text sequence ──
  {
    id: "domains",
    lines: ["6 HEROIC DOMAINS", "₹2,50,000+ PRIZE POOL"],
    startU: 5.35,
    endU: 6.0,
    variant: "rise",
    kicker: "MISSION DIRECTIVE 01"
  },
  {
    id: "multiverse",
    lines: ["WHERE TITANS OF", "CODE & ROBOTICS COLLIDE"],
    startU: 6.05,
    endU: 6.7,
    variant: "chroma",
    kicker: "MISSION DIRECTIVE 02"
  },
  {
    id: "coming",
    lines: ["CODE. CREATE. CONQUER."],
    startU: 6.75,
    endU: 7.25,
    variant: "loom",
    kicker: "MISSION DIRECTIVE 03"
  },
  {
    id: "legends",
    lines: ["ASSEMBLE YOUR SQUAD"],
    startU: 7.3,
    endU: 7.75,
    variant: "metallic",
    kicker: "MISSION DIRECTIVE 04"
  },
  // ── Hero climax ──
  {
    id: "end",
    lines: ["ENTER THE MULTIVERSE"],
    startU: 10.6,
    endU: 11.15,
    variant: "avengers"
  },
];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function CinematicText() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useRaf(() => {
    const s = signals.scroll;
    for (let i = 0; i < BEATS.length; i++) {
      const el = refs.current[i];
      if (!el) continue;
      const b = BEATS[i];
      const start = b.startU / TIMELINE_UNITS;
      const end = b.endU / TIMELINE_UNITS;
      if (s < (b.id === "hero-opening" ? 0 : start - 0.02) || s > end + 0.02) {
        if (el.style.visibility !== "hidden") {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
        }
        continue;
      }
      const t = Math.max(0, Math.min(1, (s - start) / (end - start)));
      const enter = b.id === "hero-opening" ? 1 : smoothstep(0, 0.2, t);
      const leave = smoothstep(0.65, 1, t);
      const opacity = enter * (1 - leave);
      const y = b.id === "hero-opening" ? leave * -32 : (1 - enter) * 38 + leave * -32;
      const blur = b.id === "hero-opening" ? leave * 9 : (1 - enter) * 11 + leave * 9;
      const scale = b.variant === "loom" ? 1.35 - 0.35 * enter : 1;

      el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate(-50%, -50%) translateY(${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.filter = blur > 0.12 ? `blur(${blur.toFixed(1)}px)` : "none";
    }
  });

  return (
    <div className={styles.wrap} aria-hidden>
      {BEATS.map((b, i) => {
        const small = b.lines.length > 1;
        return (
          <div
            key={b.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={styles.beat}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            {b.kicker && <span className={styles.kicker}>{b.kicker}</span>}
            {b.id === "hero-opening" ? (
              <img
                className={styles.titleImage}
                src="/techopedia%20web%20loggo.png"
                alt="Techopedia 15"
              />
            ) : b.lines.map((line, li) => {
              if (b.variant === "avengers") {
                return (
                  <span
                    key={li}
                    className={`${styles.line} ${styles.avengersLine} ${small ? styles.small : ""}`}
                  >
                    {line}
                  </span>
                );
              }
              if (b.variant === "chroma") {
                return (
                  <span
                    key={li}
                    className={`${styles.line} ${styles.glow} ${small ? styles.small : ""} ${styles.chroma}`}
                    data-text={line}
                  >
                    {line}
                  </span>
                );
              }
              return (
                <span
                  key={li}
                  className={`${styles.line} ${styles.glow} ${small ? styles.small : ""} ${
                    b.variant === "metallic" ? styles.metallic : ""
                  }`}
                >
                  {line}
                </span>
              );
            })}
            {b.subtitle && <span className={styles.subtitle}>{b.subtitle}</span>}
          </div>
        );
      })}
    </div>
  );
}
