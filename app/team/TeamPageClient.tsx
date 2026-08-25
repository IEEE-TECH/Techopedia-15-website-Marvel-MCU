"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TiltCard from "@/components/ui/TiltCard";
import { TEAM } from "@/lib/eventData";
import styles from "./team.module.css";

/** "Aarav Sharma" → "AS" — the fallback until real headshots land in /public/team. */
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
  const [active, setActive] = useState<string>("All");
  const groups = active === "All" ? TEAM : TEAM.filter((g) => g.dept === active);

  return (
    <>
      <div className={styles.tabs}>
        <button type="button" className={styles.tab} onClick={() => setActive("All")}>
          {active === "All" && (
            <motion.span
              layoutId="team-page-tab-pill"
              className={styles.tabPill}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className={styles.tabLabel}>All Departments</span>
        </button>
        {TEAM.map((g) => (
          <button
            key={g.dept}
            type="button"
            className={styles.tab}
            onClick={() => setActive(g.dept)}
          >
            {active === g.dept && (
              <motion.span
                layoutId="team-page-tab-pill"
                className={styles.tabPill}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={styles.tabLabel}>{g.dept}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {groups.map((group) => (
            <section key={group.dept} className={styles.group}>
              <div className={styles.groupHead}>
                <h2 className={styles.dept}>{group.dept}</h2>
                <p className={styles.blurb}>{group.blurb}</p>
              </div>

              <div className={styles.grid}>
                {group.members.map((m) => (
                  <TiltCard key={m.name} className={styles.card} maxTilt={8} glow>
                    <div className={styles.photoWrap}>
                      <span className={styles.radarRing} aria-hidden />
                      <span className={styles.radarRing2} aria-hidden />
                      {m.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photo} alt={m.name} className={styles.photo} />
                      ) : (
                        <span className={styles.initials} aria-hidden>
                          {initials(m.name)}
                        </span>
                      )}
                      <span className={styles.ring} aria-hidden />
                    </div>

                    <h3 className={styles.name}>{m.name}</h3>
                    <p className={styles.role}>{m.role}</p>
                    <p className={styles.detail}>{m.detail}</p>

                    {(m.linkedin || m.instagram) && (
                      <div className={styles.socials}>
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noreferrer noopener">
                            LinkedIn
                          </a>
                        )}
                        {m.instagram && (
                          <a href={m.instagram} target="_blank" rel="noreferrer noopener">
                            Instagram
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

      <section className={styles.join}>
        <h2 className={styles.joinTitle}>Want to be on this page next year?</h2>
        <p className={styles.joinText}>
          The IEEE Student Branch opens volunteer applications after every edition. Bring an interest
          in tech, design, or running things that have a lot of moving parts.
        </p>
      </section>
    </>
  );
}
