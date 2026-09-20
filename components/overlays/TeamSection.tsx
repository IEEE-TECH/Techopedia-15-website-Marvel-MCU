"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEAM, TeamMember } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import { sound } from "@/lib/audio";
import { EASE_OUT, TAB_SPRING } from "@/lib/motion";
import styles from "./teamSection.module.css";

type CouncilTab = "Senior" | "Junior";

interface CouncilOption {
  id: CouncilTab;
  label: string;
  blurb: string;
}

const COUNCILS: CouncilOption[] = [
  {
    id: "Senior",
    label: "SENIOR COUNCIL",
    blurb: "The senior council brings experience, strategic guidance, and steady leadership to every moving part of the event.",
  },
  {
    id: "Junior",
    label: "JUNIOR COUNCIL",
    blurb: "The junior council powers the event’s execution across development, design, media, and operations with energy and ownership.",
  },
];

export default function TeamSection() {
  const [active, setActive] = useState<CouncilTab>("Senior");
  const currentCouncil = COUNCILS.find((c) => c.id === active) ?? COUNCILS[0];
  const members: TeamMember[] = TEAM.flatMap((g) =>
    g.members.filter((m) => m.council === active)
  );

  const handleTabChange = (councilId: CouncilTab) => {
    if (councilId !== active) {
      sound.playBlip(780, 0.03);
      setActive(councilId);
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
          {COUNCILS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.tab}
              onClick={() => handleTabChange(c.id)}
              onMouseEnter={() => sound.playBlip(520, 0.02)}
            >
              {c.id === active && (
                <motion.span
                  layoutId="team-tab-pill"
                  className={styles.tabPill}
                  transition={TAB_SPRING}
                />
              )}
              <span className={styles.tabLabel}>{c.label}</span>
            </button>
          ))}
        </div>

        <p className={styles.deptBlurb}>{currentCouncil.blurb}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className={styles.grid}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {members.map((m, idx) => (
              <TiltCard key={m.name} className={`${styles.card} hud-panel`} maxTilt={14} glow glowColor="0, 229, 255">
                {/* 3D Sci-Fi HUD Corner Brackets */}
                <span className={styles.cardCornerTL} aria-hidden />
                <span className={styles.cardCornerTR} aria-hidden />
                <span className={styles.cardCornerBL} aria-hidden />
                <span className={styles.cardCornerBR} aria-hidden />

                {/* Telemetry Header Row */}
                <div className={styles.cardHeaderRow}>
                  <span className={styles.cardTelemetry}>[SYS: {String(idx + 1).padStart(2, "0")}]</span>
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
