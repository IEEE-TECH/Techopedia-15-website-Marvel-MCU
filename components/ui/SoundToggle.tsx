"use client";

import { useState, useEffect } from "react";
import { sound } from "@/lib/audio";
import { SpeakerOnIcon, SpeakerOffIcon } from "./HudIcon";
import styles from "./ui.module.css";

export default function SoundToggle() {
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMuted(sound.muted);
  }, []);

  const toggle = () => {
    const isNowMuted = !sound.toggle();
    setMuted(isNowMuted);
  };

  const isMuted = mounted ? muted : false;

  return (
    <button
      className={`${styles.soundToggle} ${isMuted ? styles.soundToggleMuted : ""}`}
      type="button"
      onClick={toggle}
      aria-label={isMuted ? "Unmute cinematic audio" : "Mute cinematic audio"}
      title={isMuted ? "Unmute cinematic audio" : "Mute cinematic audio"}
    >
      <span className={styles.soundIcon} aria-hidden>
        {isMuted ? <SpeakerOffIcon size={14} /> : <SpeakerOnIcon size={14} />}
      </span>
      <span className={styles.eq} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{isMuted ? "AUDIO OFF" : "AUDIO ON"}</span>
    </button>
  );
}