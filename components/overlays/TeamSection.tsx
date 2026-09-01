"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEAM } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import { EASE_OUT, TAB_SPRING } from "@/lib/motion";
import styles from "./teamSection.module.css";

export default function TeamSection() {
  const [active, setActive] = useState(TEAM[0].dept);
  const group = TEAM.find((g) => g.dept === active) ?? TEAM[0];

  return (
    <section className={styles.section} id="team">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.kicker}>AVENGERS ASSEMBLED · ORGANIZING COMMITTEE</span>
          <h2 className={styles.title}>The Minds Behind Level 15</h2>
          <p className={styles.subtitle}>
            Techopedia is engineered by dedicated student leaders from the IEEE Student Branch.
          </p>
        </div>

        <div className={styles.tabs}>
          {TEAM.map((g) => (
            <button
              key={g.dept}
              type="button"
              className={styles.tab}
              onClick={() => setActive(g.dept)}
            >
              {g.dept === active && (
                <motion.span
                  layoutId="team-tab-pill"
                  className={styles.tabPill}
                  transition={TAB_SPRING}
                />
              )}
              <span className={styles.tabLabel}>{g.dept}</span>
            </button>
          ))}
        </div>

        <p className={styles.deptBlurb}>{group.blurb}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={group.dept}
            className={styles.grid}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {group.members.map((m) => (
              <TiltCard key={m.name} className={styles.card} maxTilt={9} glow>
                <div className={styles.cardHeaderRow}>
                  <span className={styles.mcuBadge}>{m.mcuTitle}</span>
                </div>

                <div className={styles.avatar}>
                  <span className={styles.radarRing} aria-hidden />
                  <span className={styles.initials}>{m.initials}</span>
                </div>

                <h3 className={styles.name}>{m.name}</h3>
                <div className={styles.role}>{m.role}</div>
                <div className={styles.detail}>{m.detail}</div>

                <div className={styles.socialsRow}>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${m.name} LinkedIn`}
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {m.github && (
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${m.name} GitHub`}
                    >
                      GitHub ↗
                    </a>
                  )}
                  {m.instagram && (
                    <a
                      href={m.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${m.name} Instagram`}
                    >
                      Instagram ↗
                    </a>
                  )}
                </div>
              </TiltCard>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
