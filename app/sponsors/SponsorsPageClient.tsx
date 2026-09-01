"use client";

import { SPONSOR_TIERS, EVENT_STATS, EVENT_INFO } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import styles from "./sponsors.module.css";

const SPONSOR_BENEFITS = [
  { title: "Direct Campus Reach", detail: "Two days in front of 1500+ engineering students actively building." },
  { title: "Hiring Pipeline", detail: "Résumé access, sponsor booths, and direct interviews with top 24-hr hackathon winners." },
  { title: "Brand Placement", detail: "Logo across live streams, stage backdrops, delegate kits, and digital campaigns." },
  { title: "Sponsor a Track", detail: "Set your own custom problem statements and judge domain finalists." },
];

export default function SponsorsPageClient() {
  return (
    <>
      {/* headline numbers */}
      <section className={styles.stats}>
        {EVENT_STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statValue}>
              <CountUp value={s.value} />
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {SPONSOR_TIERS.map((tier) => (
        <section key={tier.tier} className={styles.tierBlock}>
          <div className={styles.tierHead}>
            <span className={styles.tierBadge} style={{ color: "#ffd700", fontSize: "0.75rem", letterSpacing: "0.2em", fontWeight: 700 }}>
              {tier.codename}
            </span>
            <h2 className={styles.tierName}>{tier.tier}</h2>
            <p className={styles.tierBlurb}>{tier.blurb}</p>
          </div>

          <div className={styles.logoGrid}>
            {tier.sponsors.map((s) => (
              <TiltCard key={s.name} className={styles.slot} maxTilt={10} glow>
                <span className={styles.pedestalBeam} aria-hidden />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", textAlign: "center" }}>
                  <span className={styles.wordmark}>{s.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "#00e5ff", fontWeight: 600 }}>{s.role}</span>
                  <span style={{ fontSize: "0.72rem", color: "#cbd5e1", maxWidth: "25ch" }}>{s.tagline}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      ))}

      {/* why partner */}
      <section className={styles.benefits}>
        <h2 className={styles.benefitsTitle}>Why Partner with Level 15</h2>
        <div className={styles.benefitGrid}>
          {SPONSOR_BENEFITS.map((b) => (
            <TiltCard key={b.title} className={styles.benefit} maxTilt={5} glow glowColor="237, 29, 36">
              <h3 className={styles.benefitName}>{b.title}</h3>
              <p className={styles.benefitDetail}>{b.detail}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Become a Sponsor</h2>
        <p className={styles.ctaText}>
          Request the official Level 15 sponsorship brochure for tier pricing, deliverables, and past-edition reach metrics.
        </p>
        <Button
          href={`mailto:${EVENT_INFO.sponsorEmail}?subject=Sponsorship%20Inquiry`}
          external
          variant="gold"
          size="lg"
        >
          ▸ Request the Brochure // PDF
        </Button>
        <p className={styles.ctaNote}>
          {EVENT_INFO.sponsorEmail} · {EVENT_INFO.org} · {EVENT_INFO.dates}
        </p>
      </section>
    </>
  );
}
