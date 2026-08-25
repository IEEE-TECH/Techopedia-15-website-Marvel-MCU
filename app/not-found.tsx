"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.radarGlow} aria-hidden />
      <div className={styles.card}>
        <span className={styles.kicker}>[ ERROR CODE // 404_TIMELINE_COLLAPSE ]</span>
        <h1 className={styles.title}>MULTIVERSE SECTOR NOT FOUND</h1>
        <p className={styles.desc}>
          The quantum coordinates you attempted to access have been pruned from the Sacred Timeline.
          Return to central command to realign your dimensional matrix.
        </p>
        <div className={styles.actionRow}>
          <Link href="/" className={styles.homeBtn}>
            // RETURN TO COMMAND CENTER
          </Link>
          <Link href="/schedule" className={styles.secBtn}>
            VIEW TIMELINE
          </Link>
        </div>
      </div>
    </div>
  );
}
