"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "@/lib/audio";
import { CloseIcon, CheckIcon, WarningIcon, MailIcon } from "./HudIcon";
import { MODAL_SPRING, OVERLAY_FADE } from "@/lib/motion";
import DigitalIdCard from "./DigitalIdCard";
import type { Participant } from "@/lib/db";
import styles from "./registration.module.css";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  initialDomain = "Squabble",
}: RegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [supabaseStored, setSupabaseStored] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    email: "",
    college: "SIES Graduate School of Technology",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Guard against double-click submission

    setErrorMsg("");
    setLoading(true);
    sound.playBlip(650, 0.05);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed. Please check your details.");
      }

      setParticipant(data.participant);
      setIsExisting(data.isExisting === true);
      setSupabaseStored(data.supabaseStored === true || data.isExisting === true);
      if (data.emailPreviewUrl) {
        setEmailPreviewUrl(data.emailPreviewUrl);
      }
      setSubmitted(true);
      sound.playSuccess();
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      sound.playBlip(320, 0.08);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setIsExisting(false);
    setParticipant(null);
    setEmailPreviewUrl(null);
    setSupabaseStored(null);
    setErrorMsg("");
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
          transition={OVERLAY_FADE}
        >
          <motion.div
            className={`${styles.modal} ${submitted ? styles.modalSuccess : ""}`}
            onClick={(e) => e.stopPropagation()}
            style={{ transformPerspective: 1000 }}
            initial={{ opacity: 0, scale: 0.94, y: 20, rotateX: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16, rotateX: -4 }}
            transition={MODAL_SPRING}
          >
            <button
              className={styles.closeBtn}
              onClick={() => {
                sound.playBlip(600, 0.04);
                handleReset();
              }}
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>

            {!submitted ? (
              <>
                <div className={styles.header}>
                  <span className={styles.kicker}>IEEE TECHOPEDIA 15.0 · S.H.I.E.L.D. PROTOCOL</span>
                  <h2 className={styles.title}>Assemble Your Squad</h2>
                  <p className={styles.subtitle}>
                    Enter your PRN, Name & Email to instantly unlock your Quantum Digital ID Pass and receive official confirmation.
                  </p>
                </div>

                {errorMsg && (
                  <div className={styles.errorBanner}>
                    <WarningIcon />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Team Lead / Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tony Stark"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>College PRN / Student ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2023CS0199"
                        value={formData.prn}
                        onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Email Address (Pass Sent Here) *</label>
                      <input
                        type="email"
                        required
                        placeholder="tony@starkindustries.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>WhatsApp / Mobile Number</label>
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
                      <label>College / Institution</label>
                      <input
                        type="text"
                        required
                        placeholder="SIES Graduate School of Technology"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      />
                    </div>

                    <div className={styles.field}>
                      <label>Squad / Team Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Avengers Initiative"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Squad Size</label>
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

                    <div className={styles.field}>
                      <label>Select Domain</label>
                      <select
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      >
                        <option value="Squabble">Squabble (24-Hr Hackathon & Speed Coding)</option>
                        <option value="Inquisitive">Inquisitive (Robo Wars & Drone Obstacle Arena)</option>
                        <option value="Eureka">Eureka (Offensive Cybersecurity & CTF)</option>
                        <option value="Vanguard">Vanguard (UI/UX Design Sprint & 3D Web Dev)</option>
                        <option value="Paper & Project Expo">Paper & Project Expo (National Research Symposium)</option>
                        <option value="E-Sports Arena">E-Sports Arena (Valorant & BGMI Tournament)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? "▸ INITIALIZING QUANTUM PASS..." : "▸ CONFIRM LEVEL 15 REGISTRATION"}
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.success}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <CheckIcon size={32} />
                  <h3 className={styles.successTitle}>
                    {isExisting ? "S.H.I.E.L.D. CLEARANCE RESTORED" : "S.H.I.E.L.D. PASS ISSUED"}
                  </h3>
                </div>
                <p className={styles.successMsg}>
                  {isExisting
                    ? "Existing clearance credentials found and verified from S.H.I.E.L.D. Quantum Storage."
                    : "Your digital delegate pass has been encrypted and saved to Supabase PostgreSQL."}
                </p>

                {/* Render the 3D Holographic ID Card */}
                {participant && (
                  <DigitalIdCard participant={participant} showActions={true} />
                )}

                {emailPreviewUrl && (
                  <div className={styles.emailAlert}>
                    <MailIcon />
                    <span>Confirmation email generated for <strong>{formData.email}</strong></span>
                    <a
                      href={emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.emailPreviewBtn}
                    >
                      VIEW EMAIL ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
