"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEAM } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import { sound } from "@/lib/audio";
import { EASE_OUT, TAB_SPRING } from "@/lib/motion";
import styles from "./teamSection.module.css";

export default function TeamSection() {
  const [active, setActive] = useState(TEAM[0].dept);
  const group = TEAM.find((g) => g.dept === active) ?? TEAM[0];

  const handleTabChange = (dept: string) => {
    if (dept !== active) {
      sound.playBlip(780, 0.03);
      setActive(dept);
    }
  };

  return (
    <section className={styles.section} id="team">
      {/* 3D Cyber Grid Horizon & Light Beam */}
      <div className={styles.cyberGridFloor} aria-hidden />
      <div className={styles.horizonGlow} aria-hidden />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.kicker}>AVENGERS ASSEMBLED · ORGANIZING COMMITTEE</span>
          <h2 className={styles.title}>The Minds Behind Level 15</h2>
          <p className={styles.subtitle}>
            Techopedia is engineered by dedicated student leaders from the IEEE Student Branch.
          </p>
        </div>

        {/* High-tech holographic filter tabs */}
        <div className={styles.tabs}>
          {TEAM.map((g) => (
            <button
              key={g.dept}
              type="button"
              className={styles.tab}
              onClick={() => handleTabChange(g.dept)}
              onMouseEnter={() => sound.playBlip(520, 0.02)}
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
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {group.members.map((m, idx) => (
              <TiltCard key={m.name} className={styles.card} maxTilt={14} glow glowColor="237, 29, 36">
                {/* 3D Sci-Fi HUD Corner Brackets */}
                <span className={styles.cardCornerTL} aria-hidden />
                <span className={styles.cardCornerTR} aria-hidden />
                <span className={styles.cardCornerBL} aria-hidden />
                <span className={styles.cardCornerBR} aria-hidden />

                {/* Telemetry Header Row */}
                <div className={styles.cardHeaderRow}>
                  <span className={styles.cardTelemetry}>[SYS: 0{idx + 1}]</span>
                  <span className={styles.councilBadge}>
                    {m.council ? `${m.council.toUpperCase()} COUNCIL` : "ORGANIZER"}
                  </span>
                </div>

                {/* 3D Floating Stark Arc Reactor Avatar */}
                <div className={styles.avatar}>
                  <span className={styles.radarRing} aria-hidden />
                  <span className={styles.radarRing2} aria-hidden />
                  <span className={styles.initials}>{m.initials}</span>
                </div>

                {/* Name and Role */}
                <h3 className={styles.name}>{m.name}</h3>
                <div>
                  <span className={styles.role}>{m.role}</span>
                </div>

                {/* Social Links */}
                <div className={styles.socialsRow}>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${m.name} LinkedIn`}
                      onMouseEnter={() => sound.playBlip(640, 0.02)}
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
                      onMouseEnter={() => sound.playBlip(640, 0.02)}
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
                      onMouseEnter={() => sound.playBlip(640, 0.02)}
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
