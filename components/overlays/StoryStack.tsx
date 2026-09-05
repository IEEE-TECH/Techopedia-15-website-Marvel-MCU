"use client";

import { useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import { DOMAINS, EventDomain } from "@/lib/eventData";
import styles from "./story.module.css";

interface Panel {
  n: string;
  img: string;
  domainId: string;
  kicker: string;
  title: string[];
  desc: string;
  accent: string;
  accent2?: string;
  titleColor: string;
  pos?: string;
}

const CHAPTERS: Panel[] = [
  {
    n: "01",
    img: "/story/panel-1.jpg",
    domainId: "code-conquest",
    kicker: "Flagship Hackathon · Project Doomsday",
    title: ["Code", "Conquest"],
    desc: "24-Hour Hackathon & Algorithmic Duel. Build futuristic AI apps, smart software, and web3 innovations.",
    accent: "#ed1d24",
    titleColor: "#ffffff",
    pos: "center",
  },
  {
    n: "02",
    img: "/story/panel-2.jpg",
    domainId: "cyber-realm",
    kicker: "Offensive Cyber Siege · Wakanda Firewall",
    title: ["Cyber Realm", "& CTF"],
    desc: "Test your ethical hacking in web security, reverse engineering, cryptography, and network defense.",
    accent: "#ff5a3c",
    accent2: "#ffd15a",
    titleColor: "#fff3e4",
    pos: "center",
  },
  {
    n: "03",
    img: "/story/panel-3.jpg",
    domainId: "robo-blitz",
    kicker: "Hardware Colosseum · Stark Bot Wars",
    title: ["Robo", "Blitz"],
    desc: "High-voltage combat bot deathmatches, autonomous line followers, and precision drone obstacle race.",
    accent: "#ffd700",
    accent2: "#ff9a3c",
    titleColor: "#eafff4",
    pos: "center",
  },
  {
    n: "04",
    img: "/story/panel-4.jpg",
    domainId: "pixel-craft",
    kicker: "Spatial UI/UX · Quantum Reality",
    title: ["Pixel", "Craft"],
    desc: "Futuristic interface design jam & live interactive 3D WebGL development sprint.",
    accent: "#00e5ff",
    titleColor: "#ffffff",
    pos: "center",
  },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const cssVars = (c: Panel) =>
  ({
    "--accent": c.accent,
    "--accent2": c.accent2 ?? c.accent,
    "--title": c.titleColor,
    "--pos": c.pos ?? "center",
  }) as React.CSSProperties;

interface StoryStackProps {
  onSelectEvent?: (event: EventDomain) => void;
}

export default function StoryStack({ onSelectEvent }: StoryStackProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useRaf(() => {
    const layer = layerRef.current;
    if (layer) {
      const fade = smoothstep(0, 0.09, signals.reel);
      layer.style.opacity = (1 - fade).toFixed(3);
      if (fade >= 1) {
        if (layer.style.visibility !== "hidden") layer.style.visibility = "hidden";
        return;
      }
      layer.style.visibility = "visible";
    }

    const s = signals.story;
    const N = CHAPTERS.length;
    const step = 1 / N;

    for (let i = 0; i < N; i++) {
      const panel = panelRefs.current[i];
      if (!panel) continue;

      const r = clamp01((s - i * step) / step);
      const cov = i < N - 1 ? clamp01((s - (i + 1) * step) / step) : 0;

      if (r <= 0.0006 || cov >= 0.9994) {
        if (panel.style.visibility !== "hidden") panel.style.visibility = "hidden";
        continue;
      }

      const re = easeOutCubic(r);
      const cove = easeInOutCubic(cov);

      const ty = (1 - re) * 100;
      const scale = 1.08 - 0.08 * re;
      panel.style.visibility = "visible";
      panel.style.zIndex = String(i + 1);
      panel.style.transform = `translate3d(0, ${ty.toFixed(3)}%, 0) scale(${scale.toFixed(4)})`;

      const dim = dimRefs.current[i];
      if (dim) dim.style.opacity = (cove * 0.5).toFixed(3);

      const content = contentRefs.current[i];
      if (content) {
        const appear = smoothstep(0.32, 0.98, r);
        content.style.opacity = (appear * (1 - cove * 0.9)).toFixed(3);
        const cy = (1 - appear) * 42 - cove * 26;
        content.style.transform = `translate3d(0, ${cy.toFixed(2)}px, 0)`;
        content.style.pointerEvents = appear > 0.6 && cov < 0.3 ? "auto" : "none";
      }
    }
  });

  return (
    <div className="story-layer" ref={layerRef} aria-hidden>
      {CHAPTERS.map((c, i) => {
        const matchedDomain = DOMAINS.find((d) => d.id === c.domainId) || DOMAINS[i];

        return (
          <article
            key={c.n}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={styles.panel}
            style={{
              ...cssVars(c),
              transform: "translate3d(0, 100%, 0)",
              visibility: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.bg} src={c.img} alt="" draggable={false} />
            <span className={styles.scrim} />
            <span className={styles.glow} />
            <span className={styles.vignette} />
            <span className={styles.edge} />
            <span className={styles.counter}>{c.n} / 04</span>

            <div
              className={styles.content}
              ref={(el) => {
                contentRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
            >
              <span className={styles.kicker}>{c.kicker}</span>
              <h2 className={styles.title}>
                {c.title.map((line, li) => (
                  <span key={li} className={styles.titleLine}>
                    {line}
                  </span>
                ))}
              </h2>

              <div className={styles.metaRow}>
                <span className={styles.prizeTag}>PRIZE // {matchedDomain.prizePool}</span>
                <span className={styles.teamTag}>TEAM // {matchedDomain.teamSize}</span>
              </div>

              <span className={styles.rule} />
              <p className={styles.desc}>{c.desc}</p>

              <button
                className={styles.exploreBtn}
                type="button"
                onClick={() => onSelectEvent?.(matchedDomain)}
              >
                ▸ Inspect Mission Dossier &amp; Rules
              </button>
            </div>

            <span
              className={styles.dim}
              ref={(el) => {
                dimRefs.current[i] = el;
              }}
            />
          </article>
        );
      })}
    </div>
  );
}
