"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EventDomain } from "@/lib/eventData";
import { sound } from "@/lib/audio";
import { CloseIcon } from "../ui/HudIcon";
import styles from "./eventDetail.module.css";

interface EventDetailModalProps {
  event: EventDomain | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (domainName: string) => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onRegister,
}: EventDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && event && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
              mass: 0.8,
            }}
          >
            {/* Top Header */}
            <div
              className={styles.header}
              style={{ "--accent": event.accentColor } as React.CSSProperties}
            >
              <div className={styles.headerBadgeRow}>
                <span className={styles.mcuBadge}>{event.mcuCodename}</span>
                <span className={styles.prizeBadge}>PRIZE // {event.prizePool}</span>
              </div>

              <h2 className={styles.title}>{event.name}</h2>
              <p className={styles.tagline}>{event.tagline}</p>

              <button
                className={styles.closeBtn}
                onClick={() => {
                  sound.playBlip(600, 0.04);
                  onClose();
                }}
                aria-label="Close Dossier"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Quick Stats Strip */}
            <div className={styles.statsStrip}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>TEAM SIZE</span>
                <span className={styles.statValue}>{event.teamSize}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>VENUE</span>
                <span className={styles.statValue}>{event.venue}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>SCHEDULE</span>
                <span className={styles.statValue}>{event.time}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>PRIZE POOL</span>
                <span className={styles.statValue} style={{ color: event.accentColor }}>
                  {event.prizePool}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className={styles.body}>
              {/* Overview */}
              <section className={styles.section}>
                <h3 className={styles.sectionHeading}>Mission Overview</h3>
                <p className={styles.descText}>{event.fullDesc}</p>
              </section>

              {/* Rounds Breakdown */}
              <section className={styles.section}>
                <h3 className={styles.sectionHeading}>Rounds &amp; Progression</h3>
                <div className={styles.roundsList}>
                  {event.rounds.map((r, idx) => (
                    <div key={idx} className={styles.roundCard}>
                      <div className={styles.roundHeader}>
                        <span className={styles.roundNum}>STAGE 0{idx + 1}</span>
                        <h4 className={styles.roundTitle}>{r.title}</h4>
                        <span className={styles.roundDuration}>{r.duration}</span>
                      </div>
                      <p className={styles.roundDesc}>{r.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Rules & Guidelines */}
              <section className={styles.section}>
                <h3 className={styles.sectionHeading}>Rules &amp; Regulations</h3>
                <ul className={styles.rulesList}>
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className={styles.ruleItem}>
                      <span className={styles.bullet}>▸</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Judging Criteria */}
              <section className={styles.section}>
                <h3 className={styles.sectionHeading}>Evaluation Metrics</h3>
                <div className={styles.criteriaGrid}>
                  {event.judgingCriteria.map((crit, idx) => (
                    <div key={idx} className={styles.criteriaPill}>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Coordinators */}
              <section className={styles.section}>
                <h3 className={styles.sectionHeading}>Domain Leads</h3>
                <div className={styles.coordinatorsList}>
                  {event.coordinators.map((c, idx) => (
                    <div key={idx} className={styles.coordinator}>
                      <span className={styles.coordName}>{c.name}</span>
                      <span className={styles.coordContact}>{c.contact}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Action Bar */}
            <div className={styles.footerBar}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  sound.playBlip(600, 0.04);
                  onClose();
                }}
              >
                Back to Multiverse
              </button>
              <button
                className={styles.registerBtn}
                onClick={() => {
                  sound.playSuccess();
                  onClose();
                  onRegister(event.name);
                }}
              >
                ▸ Initiate Registration // {event.name}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
