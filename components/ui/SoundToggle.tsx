"use client";

import { useState } from "react";
import { sound } from "@/lib/audio";
import styles from "./ui.module.css";

export default function SoundToggle() {
  const [muted, setMuted] = useState(sound.muted);

  const toggle = () => setMuted(!sound.toggle());

  return (
    <button
      className={`${styles.soundToggle} ${muted ? styles.soundToggleMuted : ""}`}
      type="button"
      onClick={toggle}
      aria-label={muted ? "Unmute cinematic audio" : "Mute cinematic audio"}
      title={muted ? "Unmute cinematic audio" : "Mute cinematic audio"}
    >
      <span className={styles.soundIcon} aria-hidden>{muted ? "🔇" : "🔊"}</span>
      <span className={styles.eq} aria-hidden><i /><i /><i /><i /></span>
      <span>{muted ? "AUDIO OFF" : "AUDIO ON"}</span>
    </button>
  );
}