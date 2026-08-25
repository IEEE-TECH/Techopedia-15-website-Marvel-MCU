"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "@/lib/audio";
import { CloseIcon, CheckIcon } from "./HudIcon";
import styles from "./registration.module.css";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  initialDomain = "Code Conquest",
}: RegistrationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    phone: "",
    teamName: "",
    teamSize: "2",
    domain: initialDomain,
  });

  useEffect(() => {
    if (initialDomain) {
      setFormData((f) => ({ ...f, domain: initialDomain }));
    }
  }, [initialDomain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = "TECH15-PASS-" + Math.floor(100000 + Math.random() * 900000);
    setPassId(randomId);
    setSubmitted(true);
    sound.playSuccess();
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <button
              className={styles.closeBtn}
              onClick={() => {
                sound.playBlip(600, 0.04);
                onClose();
              }}
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>

            {!submitted ? (
              <>
                <div className={styles.header}>
                  <span className={styles.kicker}>IEEE TECHOPEDIA 15.0 · REGISTRATION</span>
                  <h2 className={styles.title}>Assemble Your Squad</h2>
                  <p className={styles.subtitle}>
                    Lock in your spot for national-level hackathons, CTF sieges, and engineering colosseums.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Team Lead / Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tony Stark"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="tony@starkindustries.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>College / Institution</label>
                      <input
                        type="text"
                        required
                        placeholder="XYZ Institute of Technology"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Team Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Avengers Initiative"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Team Size</label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      >
                        <option value="1">1 Member (Solo Operator)</option>
                        <option value="2">2 Members (Duo)</option>
                        <option value="3">3 Members (Trio)</option>
                        <option value="4">4 Members (Full Squad)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Selected Event Domain</label>
                    <select
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    >
                      <option value="Code Conquest">Code Conquest (24-Hr Hackathon & Speed Coding)</option>
                      <option value="Cyber Realm & CTF">Cyber Realm & CTF (Offensive Cybersecurity)</option>
                      <option value="Robo Blitz">Robo Blitz (Robo Wars & Drone Obstacle Arena)</option>
                      <option value="Pixel Craft">Pixel Craft (UI/UX Design Sprint & 3D Web Dev)</option>
                      <option value="Paper & Project Expo">Paper & Project Expo (National Research Symposium)</option>
                      <option value="E-Sports Arena">E-Sports Arena (Valorant & BGMI Tournament)</option>
                    </select>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    ▸ CONFIRM LEVEL 15 REGISTRATION
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.success}>
                <div className={styles.successIcon}><CheckIcon size={40} /></div>
                <h3>REGISTRATION CONFIRMED</h3>
                <div className={styles.passBox}>
                  <span className={styles.passLabel}>DELEGATE ACCESS PASS ID</span>
                  <span className={styles.passNumber}>{passId}</span>
                </div>
                <p>
                  Welcome to Techopedia Level 15, <strong>{formData.name}</strong> of team <strong>{formData.teamName || "Avengers"}</strong>.
                  Your official credentials for <strong>{formData.domain}</strong> have been confirmed and sent to <strong>{formData.email}</strong>.
                </p>
                <button className={styles.submitBtn} onClick={handleReset}>
                  Back to Experience
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
