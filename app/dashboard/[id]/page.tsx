"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import DigitalIdCard from "@/components/ui/DigitalIdCard";
import type { Participant, ActivityLog } from "@/lib/db";
import { sound } from "@/lib/audio";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { WarningIcon, TargetIcon, ScanIcon, TrophyIcon, SyncIcon, GamepadIcon, SwordIcon, LogIcon } from "@/components/ui/HudIcon";
import styles from "./dashboard.module.css";

export default function ParticipantDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;
  const isOnline = useOnlineStatus();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Fetch participant data
  const fetchData = async (silent = false) => {
    try {
      const res = await fetch(`/api/participant/${agentId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Agent dossier not found.");
      }

      // Check if points increased for sound trigger
      if (participant && data.participant.points > participant.points) {
        sound.playSuccess();
      }

      setParticipant(data.participant);
      setActivities(data.activities || []);
      setError(null);
    } catch (err: unknown) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Error loading dossier.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 7 seconds so stall scans immediately reflect live
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!navigator.onLine) return;
      fetchData(true);
    }, 7000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingWrap}>
          <SyncIcon size={32} spinning />
          <h3>DECRYPTING AGENT CLEARANCE...</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Connecting to S.H.I.E.L.D. Quantum Database
          </p>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardInner} style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h2 style={{ color: "#ed1d24", fontFamily: "var(--font-avengers)" }}>
            AGENT DOSSIER NOT FOUND
          </h2>
          <p style={{ color: "#94a3b8", margin: "1rem 0 2rem" }}>
            {error || "The requested Agent ID or PRN does not exist in the Techopedia registry."}
          </p>
          <Link
            href="/"
            className={styles.ctaBtn}
            onClick={() => sound.playBlip(600, 0.04)}
          >
            ← Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {!isOnline && (
        <div className={styles.offlineBanner} role="status">
          <WarningIcon size={14} /> Offline — showing last synced dossier. Reconnect to resume live point tracking.
        </div>
      )}
      <div className={styles.dashboardInner}>
        {/* Navigation Bar */}
        <div className={styles.navBar}>
          <Link
            href="/"
            className={styles.backLink}
            onClick={() => sound.playBlip(600, 0.04)}
          >
            ← COMMAND CENTER
          </Link>
          <div
            className={styles.hudStatus}
            style={!isOnline ? { color: "#ed1d24" } : undefined}
          >
            <span
              className={styles.statusDot}
              style={!isOnline ? { background: "#ed1d24", boxShadow: "0 0 10px #ed1d24" } : undefined}
            />
            <span>{isOnline ? "QUANTUM LINK ACTIVE · AUTO-SYNCING" : "QUANTUM LINK LOST · OFFLINE"}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className={styles.heroHeader}>
          <span className={styles.kicker}>AGENT DOSSIER // LEVEL 15 CLEARANCE</span>
          <h1 className={styles.title}>{participant.name}</h1>
          <p className={styles.subtitle}>
            Official participant portal for Techopedia Level 15. Present your Holographic Pass to stall coordinators to earn battle points!
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className={styles.layoutGrid}>
          {/* Column 1: 3D Holographic ID Card */}
          <div className={styles.cardColumn}>
            <DigitalIdCard
              participant={participant}
              showActions={true}
              showDashboardLink={false}
            />
          </div>

          {/* Column 2: Stats & Missions */}
          <div className={styles.statsColumn}>
            {/* 3 Metric Cards */}
            <div className={styles.metricsRow}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>TOTAL BATTLE PTS</div>
                <div className={styles.metricValue}>{participant.points}</div>
                <div className={styles.metricSub}>Points Earned</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>CURRENT RANK</div>
                <div className={styles.metricValue} style={{ color: "#00e5ff" }}>
                  #{participant.rank || 1}
                </div>
                <div className={styles.metricSub}>Overall Techopedia</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>SQUAD SIZE</div>
                <div className={styles.metricValue} style={{ color: "#ffffff" }}>
                  {participant.teamSize}P
                </div>
                <div className={styles.metricSub}>{participant.teamName || "Squad"}</div>
              </div>
            </div>

            {/* How to Earn More Points */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <TargetIcon size={15} /> MISSION DIRECTIVES (EARN POINTS)
                </span>
                <span style={{ fontSize: "0.75rem", color: "#ffd700", fontWeight: 700 }}>
                  UP TO +500 PTS
                </span>
              </div>
              <div className={styles.missionGrid}>
                <div className={styles.missionCard}>
                  <div className={styles.missionIcon}><GamepadIcon size={20} /></div>
                  <div className={styles.missionText}>
                    <h4>Arcade Hub Mini-Games</h4>
                    <p>Play web mini-games or physical game stalls for +50 to +100 PTS.</p>
                  </div>
                </div>

                <div className={styles.missionCard}>
                  <div className={styles.missionIcon}><ScanIcon size={20} /></div>
                  <div className={styles.missionText}>
                    <h4>Stall Verification</h4>
                    <p>Have coordinators scan your QR pass at game stalls for instant points.</p>
                  </div>
                </div>

                <div className={styles.missionCard}>
                  <div className={styles.missionIcon}><SwordIcon size={20} /></div>
                  <div className={styles.missionText}>
                    <h4>Domain Round Clears</h4>
                    <p>Advance through CTF, Hackathon & Robo rounds for +150 to +250 PTS.</p>
                  </div>
                </div>

                <div className={styles.missionCard}>
                  <div className={styles.missionIcon}><TrophyIcon size={20} /></div>
                  <div className={styles.missionText}>
                    <h4>Podium Finish</h4>
                    <p>Top agents take home cash prize pools and IEEE certificates.</p>
                  </div>
                </div>
              </div>

              {/* Leaderboard CTA */}
              <div className={styles.leaderboardCta}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#ffffff" }}>
                    Track The Multiverse Leaderboard
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    Watch live glowing point nodes and top agents battle for #1
                  </div>
                </div>
                <Link
                  href="/leaderboard"
                  className={styles.ctaBtn}
                  onClick={() => sound.playBlip(700, 0.04)}
                >
                  VIEW LEADERBOARD ↗
                </Link>
              </div>
            </div>

            {/* Activity History */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>
                  <LogIcon size={15} /> AGENT PARTICIPATION LOG
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {activities.length} Records
                </span>
              </div>

              <div className={styles.activityList}>
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <div key={act.id} className={styles.activityItem}>
                      <div className={styles.activityMain}>
                        <span className={styles.activityTitle}>{act.title}</span>
                        <span className={styles.activityDate}>
                          {new Date(act.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <span className={styles.activityPoints}>
                        +{act.pointsEarned} PTS
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "1.5rem" }}>
                    No game activities recorded yet. Visit the game stalls to scan your pass!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
