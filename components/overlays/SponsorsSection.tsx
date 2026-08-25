"use client";

import { SPONSOR_TIERS, EVENT_STATS } from "@/lib/eventData";
import TiltCard from "@/components/ui/TiltCard";
import CountUp from "@/components/ui/CountUp";
import styles from "./sponsorsSection.module.css";

export default function SponsorsSection() {
  return (
    <section className={styles.section} id="sponsors">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.kicker}>STARK TECH ECOSYSTEM · PARTNERS</span>
          <h2 className={styles.title}>Backed By Industry Leaders</h2>
          <p className={styles.subtitle}>
            Techopedia Level 15 is powered by pioneering tech brands shaping the future of computation.
          </p>
        </div>

        {/* stats strip */}
        <div className={styles.stats}>
          {EVENT_STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statVal}>
                <CountUp value={s.value} />
              </div>
              <div className={styles.statLbl}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* tiers wall */}
        <div className={styles.tiers}>
          {SPONSOR_TIERS.map((tier) => (
            <div key={tier.tier} className={styles.tierGroup}>
              <div className={styles.tierHeader}>
                <span className={styles.tierCodename}>{tier.codename}</span>
                <h3 className={styles.tierName}>{tier.tier}</h3>
                <p className={styles.tierBlurb}>{tier.blurb}</p>
              </div>

              <div className={styles.grid}>
                {tier.sponsors.map((s) => (
                  <TiltCard key={s.name} className={styles.slot} maxTilt={12} glow>
                    <span className={styles.pedestalBeam} aria-hidden />
                    <div className={styles.sponsorCardContent}>
                      <span className={styles.wordmark}>{s.name}</span>
                      <span className={styles.sponsorRole}>{s.role}</span>
                      <span className={styles.sponsorTagline}>{s.tagline}</span>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Partner with us CTA */}
        <div className={styles.partnerCta}>
          <h3>Want to Sponsor Techopedia 15.0?</h3>
          <p>
            Connect with 1500+ top engineering minds, host problem statements, and scout hackathon talent.
          </p>
          <a
            href="mailto:sponsorships@techopedia15.com?subject=Techopedia%2015%20Sponsorship%20Inquiry"
            className={styles.partnerBtn}
          >
            ▸ Request Sponsorship Deck // PDF
          </a>
        </div>
      </div>
    </section>
  );
}
