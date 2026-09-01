"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { sound } from "@/lib/audio";
import { EASE_OUT } from "@/lib/motion";
import { EVENT_STATS, EVENT_INFO } from "@/lib/eventData";
import styles from "./footer.module.css";

/**
 * The closing footer — a real, in-flow footer at the very bottom of the page
 * (it used to be a fixed overlay driven by the scroll scrub, which put it above
 * the Team/Sponsors sections). Reveals on scroll-into-view instead, and carries
 * a 3D receding floor grid + an extruded wordmark that parallaxes to the cursor.
 */
const EXPLORE = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Team", href: "/team" },
  { label: "Sponsors", href: "/sponsors" },
];
const SOCIAL = ["Instagram", "LinkedIn", "X (Twitter)", "YouTube"];

const SPRING = { stiffness: 120, damping: 20, mass: 0.5 };

export default function SiteFooter({
  onRegisterClick,
}: {
  onRegisterClick?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  // cursor parallax — drives the wordmark tilt and the grid's vanishing point
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [8, -8]), SPRING);
  const rotY = useSpring(useTransform(mx, [0, 1], [-10, 10]), SPRING);
  const gridShift = useSpring(useTransform(mx, [0, 1], ["-4%", "4%"]), SPRING);

  function onMove(e: React.MouseEvent<HTMLElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  const noop = (e: React.MouseEvent) => e.preventDefault();

  return (
    <motion.footer
      ref={ref}
      className={styles.footer}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
    >
      {/* 3D receding floor grid — the horizon this whole thing sits on */}
      <div className={styles.gridScene} aria-hidden>
        <motion.div className={styles.gridPlane} style={{ x: gridShift }} />
      </div>
      <span className={styles.horizon} aria-hidden />
      <span className={styles.glow} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.brand}>
          <motion.span
            className={styles.mark}
            style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 700 }}
          >
            Techopedia XV<span>.</span>
          </motion.span>
          <span className={styles.tag}>
            Annual National Technical Symposium · {EVENT_INFO.org}
          </span>
          <span className={styles.dates}>
            [ {EVENT_INFO.dates} &nbsp;·&nbsp; {EVENT_INFO.duration} ]
          </span>

          <div className={styles.factRow}>
            {EVENT_STATS.map((s) => (
              <div key={s.label} className={styles.factChip}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <nav className={styles.panel}>
          <div className={styles.colHead}>Explore</div>
          <div className={styles.links}>
            {EXPLORE.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className={styles.panel}>
          <div className={styles.colHead}>Get Involved</div>
          <div className={styles.links}>
            <button type="button" onClick={() => onRegisterClick?.()}>
              Register Now
            </button>
            <a href={`mailto:${EVENT_INFO.sponsorEmail}?subject=Sponsorship%20Inquiry`}>
              Become a Sponsor
            </a>
            <Link href="/team">Join the Organizing Team</Link>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.colHead}>Connect</div>
          <div className={styles.links}>
            <a href={`mailto:${EVENT_INFO.contactEmail}`}>{EVENT_INFO.contactEmail}</a>
          </div>
          <div className={styles.social}>
            {SOCIAL.map((l) => (
              <a key={l} href="#" onClick={noop}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rule} />
      <div className={styles.base}>
        <span>© 2026 Techopedia Level 15. All Rights Reserved.</span>
        <span>Organized by {EVENT_INFO.org}.</span>
      </div>
    </motion.footer>
  );
}
