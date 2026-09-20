"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import TiltCard from "@/components/ui/TiltCard";
import { sortTeamMembersForCouncil, TEAM, TeamMember } from "@/lib/eventData";
import { sound } from "@/lib/audio";
import { TAB_SPRING } from "@/lib/motion";
import styles from "./team.module.css";

type CouncilTab = "Senior" | "Junior" | "All";

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
  const [isPaused, setIsPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  // Duplicate for seamless infinite loop
  const trainCards = [...activeMembers, ...activeMembers];

  const handleTabChange = (tab: CouncilTab) => {
    if (tab !== active) {
      sound.playBlip(780, 0.03);
      setActive(tab);
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
    <>
      <div className={styles.tabs}>
        {(["Senior", "Junior", "All"] as const).map((tab) => (
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
              {tab === "Senior"
                ? "SENIOR COUNCIL"
                : tab === "Junior"
                  ? "JUNIOR COUNCIL"
                  : "FULL SQUAD"}
            </span>
          </button>
        ))}

        <Link href="/team/portal" className={styles.portalTabBtn}>
          ⚡ Team Ops Portal →
        </Link>
      </div>

      {/* Moving Train Horizontal Scroll Container */}
      <div className={styles.trainContainer}>
        {/* Controls Bar */}
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
              title={isPaused ? "Resume train" : "Pause train"}
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

        {/* Continuous Marquee Viewport */}
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
                <div className={styles.cardHeaderRow}>
                  <span className={styles.cardTelemetry}>
                    [SYS // {String((idx % activeMembers.length) + 1).padStart(2, "0")}]
                  </span>
                  <span className={styles.councilBadge}>
                    {m.council ? `${m.council.toUpperCase()} COUNCIL` : "ORGANIZER"}
                  </span>
                </div>

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
                    <span className={styles.initials} aria-hidden>
                      {initials(m.name)}
                    </span>
                  )}
                </div>

                <div style={{ width: "100%" }}>
                  <h3 className={styles.name} title={m.name}>{m.name}</h3>
                  <span className={styles.role}>{m.role}</span>
                  {m.detail && m.detail.toLowerCase() !== m.role.toLowerCase() && (
                    <div className={styles.deptBadge}>{m.detail}</div>
                  )}
                </div>

                <div className={styles.socialsRow}>
                  {m.linkedin ? (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
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
            className={styles.portalBtn}
          >
            Team Ops Portal Login →
          </a>
        </div>
      </TiltCard>
    </>
  );
}