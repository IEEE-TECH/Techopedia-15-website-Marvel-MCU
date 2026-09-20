"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import TiltCard from "@/components/ui/TiltCard";
import { TEAM } from "@/lib/eventData";
import { sound } from "@/lib/audio";
import { EASE_OUT, TAB_SPRING } from "@/lib/motion";

import styles from "./team.module.css";

type CouncilTab = "Senior" | "Junior";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeamPageClient({ initialActive = "Senior" }: { initialActive?: CouncilTab }) {
  const [active, setActive] = useState<CouncilTab>(initialActive);

  const members = TEAM.flatMap((g) =>
    g.members.filter((m) => m.council === active),
  );

  const handleTabChange = (tab: CouncilTab) => {
    if (tab !== active) {
      sound.playBlip(780, 0.03);
      setActive(tab);
    }
  };

  return (
    <>
      <div className={styles.tabs}>
        {(["Senior", "Junior"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={styles.tab}
            onClick={() => handleTabChange(tab)}
            onMouseEnter={() => sound.playBlip(520, 0.02)}
          >
            {active === tab && (
              <motion.span
                layoutId="team-page-tab-pill"
                className={styles.tabPill}
                transition={TAB_SPRING}
              />
            )}

            <span className={styles.tabLabel}>
              {tab === "Senior" ? "SENIOR COUNCIL" : "JUNIOR COUNCIL"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{
            duration: 0.35,
            ease: EASE_OUT,
          }}
        >
          {members.length > 0 ? (
            <div className={styles.grid}>
              {members.map((m) => (
                <TiltCard
                  key={m.name}
                  className={`${styles.card} hud-panel`}
                  maxTilt={8}
                  glow
                >
                  <div className={styles.photoWrap}>
                    <span
                      className={styles.radarRing}
                      aria-hidden
                    />

                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt={m.name}
                        className={styles.photo}
                      />
                    ) : (
                      <span
                        className={styles.initials}
                        aria-hidden
                      >
                        {initials(m.name)}
                      </span>
                    )}

                    <span
                      className={styles.ring}
                      aria-hidden
                    />
                  </div>

                  <h3 className={styles.name}>{m.name}</h3>

                  <div className={styles.role}>{m.role}</div>

                  {m.detail && m.detail.toLowerCase() !== m.role.toLowerCase() && (
                    <div className={styles.detail}>{m.detail}</div>
                  )}

                  {(m.instagram || m.linkedin || m.github) && (
                    <div className={styles.links}>
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          LinkedIn
                        </a>
                      )}

                      {m.instagram && (
                        <a
                          href={m.instagram}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Instagram
                        </a>
                      )}

                      {m.github && (
                        <a
                          href={m.github}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", padding: "2rem 0" }}>
              No members found in this council.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* JOIN SECTION */}
      <TiltCard className={styles.join} maxTilt={5}>
        <h2 className={styles.joinTitle}>
          Want to be on this page next year?
        </h2>

        <p className={styles.joinText}>
          The IEEE Student Branch opens volunteer applications after
          every edition. Bring an interest in tech, design, or running
          things that have a lot of moving parts.
        </p>

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
          <a
            href="/team/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(237, 29, 36, 0.12)",
              border: "1px solid rgba(237, 29, 36, 0.4)",
              color: "#ff4d4d",
              padding: "0.6rem 1.25rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}
          >
            🛡️ Authorized Coordinator &amp; Staff Access Portal →
          </a>
        </div>
      </TiltCard>
    </>
  );
}