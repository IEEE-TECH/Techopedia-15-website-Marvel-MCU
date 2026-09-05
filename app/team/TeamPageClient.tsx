"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import TiltCard from "@/components/ui/TiltCard";
import { TEAM } from "@/lib/eventData";
import { EASE_OUT, TAB_SPRING } from "@/lib/motion";

import styles from "./team.module.css";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeamPageClient() {
  const [active, setActive] = useState<"All" | "Senior" | "Junior">("All");

  const groups = TEAM.map((g) => ({
    ...g,
    members:
      active === "All"
        ? g.members
        : g.members.filter((m) => m.council === active),
  })).filter((g) => g.members.length > 0);

  return (
    <>
      {/* TABS */}
      <div className={styles.tabs}>
        {(["All", "Senior", "Junior"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={styles.tab}
            onClick={() => setActive(tab)}
          >
            {active === tab && (
              <motion.span
                layoutId="team-page-tab-pill"
                className={styles.tabPill}
                transition={TAB_SPRING}
              />
            )}

            <span className={styles.tabLabel}>
              {tab === "All"
                ? "All Departments"
                : tab === "Senior"
                  ? "Senior Council"
                  : "Junior Council"}
            </span>
          </button>
        ))}
      </div>

      {/* TEAM DOMAINS */}
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
          {groups.map((group) => (
            <section key={group.dept} className={styles.group}>
              <div className={styles.groupHead}>
                <h2 className={styles.dept}>{group.dept}</h2>

                <p className={styles.blurb}>{group.blurb}</p>
              </div>

              <div className={styles.grid}>
                {group.members.map((m) => (
                  <TiltCard
                    key={m.name}
                    className={styles.card}
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
            </section>
          ))}
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
      </TiltCard>
    </>
  );
}