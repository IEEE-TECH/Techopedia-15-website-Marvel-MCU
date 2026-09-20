import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import { DOMAINS, EVENT_INFO } from "@/lib/eventData";
import { CameraIcon, TrophyIcon, ExportIcon, MailIcon, ShieldIcon, SparkleIcon, WarningIcon } from "@/components/ui/HudIcon";
import styles from "./portal.module.css";

export const metadata: Metadata = {
  title: "Team Ops Portal — Techopedia Level 15",
  description: "Internal command center and coordinator operations hub for the IEEE SIESGST organizing team.",
};

export default function TeamPortalPage() {
  return (
    <PageShell
      kicker={`INTERNAL OPERATIONS · ${EVENT_INFO.dates}`}
      title="Team Ops Portal"
      intro="Restricted coordination terminal for stall leads, technical coordinators, and student branch executive committee."
    >
      <div className={styles.portalContainer}>
        {/* Status Banner */}
        <div className={styles.statusBanner}>
          <div className={styles.statusLeft}>
            <span className={styles.statusDot} />
            <div>
              <div className={styles.statusText}>S.H.I.E.L.D. TACTICAL HUB ACTIVE</div>
              <div className={styles.statusSub}>All services, QR scanning nodes, and database pipelines operational</div>
            </div>
          </div>
          <Link href="/team" className={styles.quickNavBtn}>
            ← Public Council Directory
          </Link>
        </div>

        {/* 1. Core Tactical Tools */}
        <section>
          <div className={styles.sectionTitle}>
            <ShieldIcon size={16} /> CORE COORDINATOR CONTROLS
          </div>
          <div className={styles.toolsGrid}>
            {/* Tool 1: Scanner */}
            <Link href="/scanner" className={styles.toolCard}>
              <div className={styles.toolCardHeader}>
                <div className={styles.toolIconWrap}>
                  <CameraIcon size={22} />
                </div>
                <span className={styles.toolBadge}>LIVE ON-GROUND</span>
              </div>
              <h3 className={styles.toolTitle}>Tactical QR Pass Scanner</h3>
              <p className={styles.toolDesc}>
                Point device camera at participant digital or printed passes to auto-detect PRN, view agent dossiers, and award battle points (+50 to +250 PTS).
              </p>
              <span className={styles.toolActionText}>LAUNCH SCANNER TERMINAL →</span>
            </Link>

            {/* Tool 2: Leaderboard */}
            <Link href="/leaderboard" className={styles.toolCard}>
              <div className={styles.toolCardHeader}>
                <div className={styles.toolIconWrap}>
                  <TrophyIcon size={22} />
                </div>
                <span className={styles.toolBadge}>MULTIVERSE LIVE</span>
              </div>
              <h3 className={styles.toolTitle}>Live Arena Leaderboard</h3>
              <p className={styles.toolDesc}>
                Monitor live student rankings, golden-spiral battle point distribution, and real-time activity tick announcements across all stalls.
              </p>
              <span className={styles.toolActionText}>VIEW LIVE LEADERBOARD →</span>
            </Link>

            {/* Tool 3: Export CSV */}
            <Link href="/api/export-csv?token=techopedia15_stark_shield_pass" className={styles.toolCard} target="_blank">
              <div className={styles.toolCardHeader}>
                <div className={styles.toolIconWrap}>
                  <ExportIcon size={22} />
                </div>
                <span className={styles.toolBadge}>RFC-4180 DATA</span>
              </div>
              <h3 className={styles.toolTitle}>Export Registrations CSV</h3>
              <p className={styles.toolDesc}>
                Download complete, authenticated student registration roster and point allocation transaction logs in one RFC-compliant spreadsheet.
              </p>
              <span className={styles.toolActionText}>DOWNLOAD DATABASE CSV ↓</span>
            </Link>

            {/* Tool 4: Email Ticket Preview */}
            <Link href="/api/email-preview" className={styles.toolCard} target="_blank">
              <div className={styles.toolCardHeader}>
                <div className={styles.toolIconWrap}>
                  <MailIcon size={22} />
                </div>
                <span className={styles.toolBadge}>DISPATCH PREVIEW</span>
              </div>
              <h3 className={styles.toolTitle}>Ticket Confirmation Preview</h3>
              <p className={styles.toolDesc}>
                Inspect the official S.H.I.E.L.D.-branded HTML confirmation email template, verify QR generation rendering, and debug attendee pass links.
              </p>
              <span className={styles.toolActionText}>INSPECT PASS TEMPLATE →</span>
            </Link>
          </div>
        </section>

        {/* 2. Domain Leads Directory */}
        <section>
          <div className={styles.sectionTitle}>
            <SparkleIcon size={16} /> DOMAIN LEADS & STALL VENUES
          </div>
          <div className={styles.domainGrid}>
            {DOMAINS.map((d) => (
              <div key={d.id} className={styles.domainCard}>
                <div className={styles.domainCardHead}>
                  <span className={styles.domainName}>{d.name}</span>
                  <span className={styles.domainVenue}>▸ {d.venue}</span>
                </div>
                {d.coordinators.map((c) => (
                  <div key={c.name} className={styles.coordinatorRow}>
                    <span className={styles.coordName}>{c.name}</span>
                    <a href={`tel:${c.contact}`} className={styles.coordContact}>
                      📞 {c.contact}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Operational Protocols */}
        <section>
          <div className={styles.sectionTitle}>
            <WarningIcon size={16} /> ON-GROUND COORDINATOR PROTOCOL
          </div>
          <div className={styles.protocolBox}>
            <ul className={styles.protocolList}>
              <li className={styles.protocolItem}>
                <span className={styles.protocolNumber}>01</span>
                <div>
                  <strong>Default Organizer Passcode:</strong> Enter <code>techopedia15_stark_shield_pass</code> into the scanner terminal to unlock point allocation clearance.
                </div>
              </li>
              <li className={styles.protocolItem}>
                <span className={styles.protocolNumber}>02</span>
                <div>
                  <strong>Instant Camera Scanning:</strong> Tap &ldquo;Start QR Camera Scanner&rdquo; and point device camera at participant pass. The terminal automatically locks on, chirps audio, and opens the student dossier.
                </div>
              </li>
              <li className={styles.protocolItem}>
                <span className={styles.protocolNumber}>03</span>
                <div>
                  <strong>Point Award Limits:</strong> Single allocations are capped at 500 PTS per scan to prevent point inflation. Maximum lifetime battle score per agent is 5,000 PTS.
                </div>
              </li>
              <li className={styles.protocolItem}>
                <span className={styles.protocolNumber}>04</span>
                <div>
                  <strong>Spotty Wi-Fi Protection:</strong> If campus Wi-Fi drops, scans are safely enqueued in local storage (<code>scanQueue.ts</code>) and automatically flushed to the server when reconnected.
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
