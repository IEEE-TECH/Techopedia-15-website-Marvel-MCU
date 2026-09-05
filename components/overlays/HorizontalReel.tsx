"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import styles from "./reel.module.css";

interface Scene {
  n: string;
  slug: string;
  day: string;
  timecode: string;
  title: string;
  venue: string;
  accent: string;
}

const SCENES: Scene[] = [
  {
    n: "01",
    slug: "doom",
    day: "DAY 01",
    timecode: "11:30 AM",
    title: "Code Conquest Hackathon Kickoff",
    venue: "Main Computing Hub / Lab Alpha",
    accent: "#ed1d24",
  },
  {
    n: "02",
    slug: "blackpanther",
    day: "DAY 01",
    timecode: "12:00 PM",
    title: "Cyber Realm CTF Gates Open",
    venue: "Cyber Defense Arena / Hall B",
    accent: "#ff4d4d",
  },
  {
    n: "03",
    slug: "cyclops",
    day: "DAY 01 & 02",
    timecode: "02:00 PM",
    title: "Robo Blitz Combat Arena Trials",
    venue: "Robotics Amphitheater",
    accent: "#ffd700",
  },
  {
    n: "04",
    slug: "mystique",
    day: "DAY 02",
    timecode: "10:30 AM",
    title: "Pixel Craft Spatial UI Sprint",
    venue: "Design Lab 3 / VR Studio",
    accent: "#00e5ff",
  },
  {
    n: "05",
    slug: "gambit",
    day: "DAY 02",
    timecode: "01:30 PM",
    title: "National Paper & Project Symposium",
    venue: "Auditorium / Tech Showcase",
    accent: "#ff9900",
  },
  {
    n: "06",
    slug: "namor",
    day: "DAY 02",
    timecode: "04:30 PM",
    title: "Grand Finale & Prize Distribution",
    venue: "Central Auditorium",
    accent: "#ed1d24",
  },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function HorizontalReel() {
  const layerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);

  const cachedCenters = useRef<number[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });

    const measure = () => {
      cachedCenters.current = frameRefs.current.map((f) => (f ? f.offsetLeft + f.offsetWidth / 2 : 0));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  useRaf(() => {
    const reel = signals.reel;
    const layer = layerRef.current;
    if (!layer) return;

    if (reel <= 0.0008 || reel >= 0.9992) {
      if (layer.style.visibility !== "hidden") layer.style.visibility = "hidden";
      for (const v of videoRefs.current) if (v && !v.paused) v.pause();
      return;
    }
    layer.style.visibility = "visible";

    const intro = smoothstep(0, 0.08, reel);
    const outro = smoothstep(0.9, 1.0, reel);
    layer.style.opacity = (intro * (1 - outro)).toFixed(3);

    const stage = stageRef.current;
    if (stage) {
      const sc = (0.92 + 0.08 * intro) * (1 - 0.05 * outro);
      stage.style.transform = `scale(${sc.toFixed(4)})`;
    }

    const track = trackRef.current;
    if (!track) return;
    const vw = window.innerWidth;
    const maxShift = Math.max(0, track.scrollWidth - vw);
    const travel = clamp01((reel - 0.08) / (0.9 - 0.08));
    const x = -travel * maxShift;
    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;

    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${travel.toFixed(4)})`;
    }

    const cx = vw / 2;
    for (let i = 0; i < SCENES.length; i++) {
      const f = frameRefs.current[i];
      if (!f) continue;
      // High-performance: read cached horizontal center instead of triggering reflow every frame
      const centerInTrack = cachedCenters.current[i] || (vw * 0.19 + i * (vw * 0.67) + vw * 0.31);
      const fc = x + centerInTrack;
      const off = fc - cx;
      const close = 1 - clamp01(Math.abs(off) / (vw * 0.62));
      const scl = 0.82 + close * 0.2;
      const rot = clamp01((off / vw + 1) / 2) * 2 - 1;
      f.style.transform = `perspective(1600px) rotateY(${(-rot * 7).toFixed(2)}deg) scale(${scl.toFixed(3)})`;
      f.style.opacity = (0.34 + close * 0.66).toFixed(3);
      f.style.zIndex = String(100 + Math.round(close * 100));
      const inner = innerRefs.current[i];
      if (inner) inner.style.transform = `translate3d(${(-off * 0.04).toFixed(1)}px, 0, 0)`;

      const v = videoRefs.current[i];
      const shouldPlay = close > 0.18;
      if (v) {
        if (shouldPlay && v.paused) v.play().catch(() => {});
        else if (!shouldPlay && !v.paused) v.pause();
      }
    }
  });

  return (
    <div className="reel-layer" ref={layerRef} style={{ opacity: 0, visibility: "hidden" }} aria-hidden>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.track} ref={trackRef}>
          {SCENES.map((s, i) => (
            <div
              key={s.n}
              className={styles.frame}
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
              style={{ "--accent": s.accent } as React.CSSProperties}
            >
              <div
                className={styles.inner}
                ref={(el) => {
                  innerRefs.current[i] = el;
                }}
              >
                <div className={styles.screen}>
                  <video
                    ref={(el) => {
                      if (el) {
                        el.muted = true;
                        el.playsInline = true;
                      }
                      videoRefs.current[i] = el;
                    }}
                    className={styles.video}
                    src={`/videos/char-${s.slug}.mp4`}
                    poster={`/videos/char-${s.slug}-poster.jpg`}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                  />
                  <span className={styles.scrim} />
                  <span className={`${styles.bracket} ${styles.tl}`} />
                  <span className={`${styles.bracket} ${styles.tr}`} />
                  <span className={`${styles.bracket} ${styles.bl}`} />
                  <span className={`${styles.bracket} ${styles.br}`} />
                  <div className={styles.status}>
                    <span className={styles.dot} />
                    <span>{s.day} · {s.timecode}</span>
                  </div>
                  <div className={styles.timecode}>{s.venue}</div>

                  <div className={styles.caption}>
                    <div className={styles.watermark}>TECHOPEDIA 15 ROADMAP</div>
                    <h3 className={styles.title}>{s.title}</h3>
                    <div className={styles.sub}>{s.venue}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.label}>
        <div className={styles.labelKicker}>EVENT ROADMAP &amp; SCHEDULE</div>
        <div className={styles.labelTitle}>The 48-Hour Quantum Timeline</div>
        <Link href="/schedule" className={styles.scheduleLink}>
          ▸ View Complete 2-Day Agenda &amp; Filters →
        </Link>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressFill} ref={progressRef} />
      </div>
    </div>
  );
}
