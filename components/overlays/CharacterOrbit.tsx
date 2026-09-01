"use client";

import { useEffect, useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { prefersReducedMotion } from "@/lib/reducedMotion";
import { DOMAINS, EventDomain } from "@/lib/eventData";
import styles from "./orbit.module.css";

const TAU = Math.PI * 2;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

interface CharacterOrbitProps {
  onSelectEvent?: (event: EventDomain) => void;
}

export default function CharacterOrbit({ onSelectEvent }: CharacterOrbitProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });
  }, []);

  useRaf(() => {
    const s = signals.showcase;
    const t = signals.time;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const wantPlay = s > 0.006;
    const Rx = vw * 0.3;
    const Ry = vh * 0.15;
    const base = s * TAU * 0.85 + (prefersReducedMotion() ? 0 : t * 0.045);
    const N = DOMAINS.length;

    for (let i = 0; i < N; i++) {
      const vid = videoRefs.current[i];
      const card = cardRefs.current[i];
      if (!card) continue;

      const enterAt = 0.05 + i * 0.055;
      const enter = smoothstep(enterAt, enterAt + 0.16, s);
      if (enter <= 0.001) {
        if (vid && !vid.paused) vid.pause();
        if (card.style.visibility !== "hidden") card.style.visibility = "hidden";
        continue;
      }
      card.style.visibility = "visible";

      const theta = base + i * (TAU / N);
      const d = Math.cos(theta); // 1 = front, -1 = behind
      const depth01 = (d + 1) / 2;
      const x = Math.sin(theta) * Rx;
      const y = d * Ry;
      const scale = lerp(0.6, 1.06, depth01) * lerp(0.5, 1, enter);
      const rotY = -Math.sin(theta) * 12;
      const enterX = (1 - enter) * (vw * 0.55);

      card.style.transform =
        `translate(-50%, -50%) perspective(1100px) translate3d(${(x + enterX).toFixed(1)}px, ${y.toFixed(1)}px, 0)` +
        ` rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = (lerp(0.32, 1, depth01) * enter).toFixed(3);
      card.style.zIndex = d > 0 ? "4" : "2";
      card.style.filter = d < -0.05 ? `blur(${(-d * 3).toFixed(2)}px)` : "none";
      card.style.setProperty("--glow", smoothstep(0.55, 1, depth01).toFixed(3));
      card.style.pointerEvents = d > 0.4 ? "auto" : "none";

      if (vid) {
        const shouldPlay = wantPlay && d > 0.05;
        if (shouldPlay && vid.paused) vid.play().catch(() => {});
        else if (!shouldPlay && !vid.paused) vid.pause();
      }
    }
  });

  return (
    <div className={styles.layer} aria-hidden>
      {DOMAINS.map((domain, i) => (
        <div
          key={domain.id}
          className={styles.card}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{ visibility: "hidden" }}
          onClick={() => onSelectEvent?.(domain)}
          role="button"
          tabIndex={0}
        >
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.playsInline = true;
              }
              videoRefs.current[i] = el;
            }}
            className={styles.video}
            src={`/videos/char-${domain.slug}.mp4`}
            poster={`/videos/char-${domain.slug}-poster.jpg`}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
          />
          <div className={styles.grad} />
          <div className={styles.frame} />

          <div className={styles.topRow}>
            <div className={styles.tick}>
              <span className={styles.dot} />
              {`0${i + 1} · ${domain.mcuCodename}`}
            </div>
            <span className={styles.orbitPrizeBadge}>PRIZE: {domain.prizePool}</span>
          </div>

          <div className={styles.info}>
            <div className={styles.name}>{domain.name}</div>
            <div className={styles.desc}>{domain.shortDesc}</div>
            <div className={styles.ctaRow}>
              <span className={styles.ctaPrompt}>[ ACCESS MISSION DOSSIER → ]</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
