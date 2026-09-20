"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { sortTeamMembersForCouncil, TEAM, TeamMember } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import Initials from "@/components/ui/Initials";
import { sound } from "@/lib/audio";
import { TAB_SPRING } from "@/lib/motion";
import styles from "./teamSection.module.css";

type CouncilTab = "Senior" | "Junior" | "All";

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
  {
    id: "All",
    label: "FULL SQUAD",
    blurb: "The complete IEEE student branch assembly powering Techopedia Level 15.",
  },
];

export default function TeamSection() {
  const [active, setActive] = useState<CouncilTab>("Senior");
  const [isPaused, setIsPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const currentCouncil = COUNCILS.find((c) => c.id === active) ?? COUNCILS[0];

  const seniorMembers = sortTeamMembersForCouncil(
    TEAM.flatMap((g) => g.members.filter((m) => m.council === "Senior")),
    "Senior",
  );

  const juniorMembers = sortTeamMembersForCouncil(
    TEAM.flatMap((g) => g.members.filter((m) => m.council === "Junior")),
    "Junior",
  );

  const activeMembers: TeamMember[] =
    active === "Senior"
      ? seniorMembers
      : active === "Junior"
        ? juniorMembers
        : [...seniorMembers, ...juniorMembers];

  // Duplicate list to create seamless infinite train scroll loop
  const trainCards = [...activeMembers, ...activeMembers];

  const handleTabChange = (councilId: CouncilTab) => {
    if (councilId !== active) {
      sound.playBlip(780, 0.03);
      setActive(councilId);
    }
  };

  const scrollLeft = () => {
    sound.playBlip(620, 0.02);
    viewportRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    sound.playBlip(620, 0.02);
    viewportRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const togglePause = () => {
    sound.playBlip(700, 0.02);
    setIsPaused((p) => !p);
  };

  return (
    <section className={styles.section} id="team">
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

        {/* Council Filter Tabs */}
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

        {/* Moving Train Horizontal Section */}
        <div className={styles.trainContainer}>
          {/* Train Telemetry & Interactive Controls Bar */}
          <div className={styles.trainControlsBar}>
            <div className={styles.trainStatus}>
              <span className={styles.trainPulse} />
              <span>
                TRAIN TELEMETRY // {active.toUpperCase()} ({activeMembers.length} AGENTS)
              </span>
            </div>

            <div className={styles.trainActions}>
              <button
                type="button"
                className={styles.pauseToggleBtn}
                onClick={togglePause}
                title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
              >
                {isPaused ? "▶ RESUME TRAIN" : "⏸ PAUSE TRAIN"}
              </button>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={scrollLeft}
                aria-label="Scroll left"
              >
                <span>‹</span> PREV
              </button>
              <button
                type="button"
                className={styles.navArrowBtn}
                onClick={scrollRight}
                aria-label="Scroll right"
              >
                NEXT <span>›</span>
              </button>
            </div>
          </div>

          {/* Infinite Horizontal Train Viewport */}
          <div ref={viewportRef} className={styles.trainViewport}>
            <div
              className={`${styles.trainTrack} ${isPaused ? styles.trainTrackPaused : ""}`}
            >
              {trainCards.map((m, idx) => (
                <TiltCard
                  key={`${m.name}-${idx}`}
                  className={styles.card}
                  maxTilt={6}
                  glow
                  glowColor="0, 229, 255"
                >
                  {/* Telemetry Header Row */}
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.cardTelemetry}>
                      [SYS // {String((idx % activeMembers.length) + 1).padStart(2, "0")}]
                    </span>
                    <span className={styles.councilBadge}>
                      {m.council ? `${m.council.toUpperCase()} COUNCIL` : "ORGANIZER"}
                    </span>
                  </div>

                  {/* 3D Arc Reactor Avatar (Photo / Initials) */}
                  <div className={styles.avatar}>
                    <span className={styles.arcRing} aria-hidden />
                    <span className={styles.arcGlow} aria-hidden />
                    {m.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt={m.name}
                        className={styles.photo}
                        loading="lazy"
                      />
                    ) : (
                      <Initials text={m.initials} className={styles.initials} />
                    )}
                  </div>

                  {/* Name and Role */}
                  <div style={{ width: "100%" }}>
                    <h3 className={styles.name} title={m.name}>{m.name}</h3>
                    <span className={styles.role}>{m.role}</span>
                    {m.detail && m.detail !== m.role && (
                      <div className={styles.deptBadge}>{m.detail}</div>
                    )}
                  </div>

                  {/* LinkedIn Connect Button */}
                  <div className={styles.socialsRow}>
                    {m.linkedin ? (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        aria-label={`${m.name} LinkedIn`}
                        onMouseEnter={() => sound.playBlip(640, 0.02)}
                      >
                        <span>LinkedIn</span>
                        <span className={styles.linkArrow}>↗</span>
                      </a>
                    ) : (
                      <span className={styles.socialLink} style={{ opacity: 0.4, cursor: "default" }}>
                        <span>IEEE TEAM</span>
                      </span>
                    )}
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
