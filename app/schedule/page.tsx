"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageShell from "@/components/ui/PageShell";
import { SCHEDULE, type Track } from "@/lib/eventData";
import styles from "./schedule.module.css";

const TRACKS: Track[] = [
  "General",
  "Code Conquest",
  "Cyber Realm & CTF",
  "Robo Blitz",
  "Pixel Craft",
  "Paper & Project Expo",
  "E-Sports Arena",
];

export default function SchedulePage() {
  const [active, setActive] = useState<Track | "All">("All");

  return (
    <PageShell
      kicker="Two Days · Six Domains"
      title="Event Schedule"
      intro="Every hour of Level 15, from the opening keynote to the final award. Filter by domain to see only the track you are competing in."
    >
      <div className={styles.filters}>
        <button
          className={`${styles.chip} ${active === "All" ? styles.chipOn : ""}`}
          onClick={() => setActive("All")}
          type="button"
        >
          All Tracks
        </button>
        {TRACKS.map((t) => (
          <button
            key={t}
            className={`${styles.chip} ${active === t ? styles.chipOn : ""}`}
            onClick={() => setActive(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      {SCHEDULE.map((day) => {
        const items = active === "All" ? day.items : day.items.filter((i) => i.track === active);

        return (
          <section key={day.day} className={styles.day}>
            <div className={styles.dayHead}>
              <h2 className={styles.dayName}>{day.day}</h2>
              <span className={styles.dayDate}>{day.date}</span>
              <span className={styles.dayCount}>
                {items.length} {items.length === 1 ? "session" : "sessions"}
              </span>
            </div>

            {items.length === 0 ? (
              <p className={styles.empty}>No sessions for this track on {day.day}.</p>
            ) : (
              <ol className={styles.timeline}>
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((item) => (
                    <motion.li
                      key={`${day.day}-${item.time}-${item.title}`}
                      layout
                      initial={false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
                      className={styles.row}
                    >
                      <div className={styles.time}>{item.time}</div>
                      <div className={styles.dot} aria-hidden />
                      <div className={styles.card}>
                        <span className={styles.cardGlow} aria-hidden />
                        <div className={styles.cardTop}>
                          <h3 className={styles.itemTitle}>{item.title}</h3>
                          <span className={styles.track}>{item.track}</span>
                        </div>
                        <p className={styles.detail}>{item.detail}</p>
                        {item.venue && (
                          <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "#00ff9c", opacity: 0.9 }}>
                            ▸ {item.venue}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            )}
          </section>
        );
      })}

      <p className={styles.note}>
        Schedule is provisional and subject to change. Final timings will be confirmed on the
        registered participant mailing list.
      </p>
    </PageShell>
  );
}
