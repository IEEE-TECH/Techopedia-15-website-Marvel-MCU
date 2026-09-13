"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { sound } from "@/lib/audio";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { WarningIcon, ScanIcon, ExportIcon, SparkleIcon, CrownIcon, TrophyIcon } from "@/components/ui/HudIcon";
import type { Participant, ActivityLog } from "@/lib/db";
import styles from "./leaderboard.module.css";

interface DomainColorMap {
  stroke: string;
  fill: string;
  glow: string;
}

const DOMAIN_THEMES: Record<string, DomainColorMap> = {
  "Code Conquest": { stroke: "#ed1d24", fill: "rgba(237, 29, 36, 0.25)", glow: "#ed1d24" },
  "Cyber Realm & CTF": { stroke: "#9333ea", fill: "rgba(147, 51, 234, 0.25)", glow: "#a855f7" },
  "Robo Blitz": { stroke: "#eab308", fill: "rgba(234, 179, 8, 0.25)", glow: "#facc15" },
  "Pixel Craft": { stroke: "#00e5ff", fill: "rgba(0, 229, 255, 0.25)", glow: "#38bdf8" },
  "Paper & Project Expo": { stroke: "#22c55e", fill: "rgba(34, 197, 94, 0.25)", glow: "#4ade80" },
  "E-Sports Arena": { stroke: "#f97316", fill: "rgba(249, 115, 22, 0.25)", glow: "#fb923c" },
};

function getDomainTheme(domain: string): DomainColorMap {
  return DOMAIN_THEMES[domain] || { stroke: "#ffd700", fill: "rgba(255, 215, 0, 0.25)", glow: "#ffd700" };
}

export default function LeaderboardPage() {
  const isOnline = useOnlineStatus();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");

  // Hovered node state for SVG tooltip
  const [hoveredNode, setHoveredNode] = useState<{
    participant: Participant;
    x: number;
    y: number;
  } | null>(null);

  // Active Toast index for cycling live popups
  const [activeToastIndex, setActiveToastIndex] = useState(0);

  const fetchLeaderboard = async (silent = false) => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (res.ok && data.success) {
        setParticipants(data.participants || []);
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!navigator.onLine) return;
      fetchLeaderboard(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Cycle activity toasts
  useEffect(() => {
    if (activities.length === 0) return;
    const toastTimer = setInterval(() => {
      setActiveToastIndex((idx) => (idx + 1) % activities.length);
    }, 4500);
    return () => clearInterval(toastTimer);
  }, [activities]);

  // Filtered participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.college.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDomain =
        selectedDomain === "ALL" || p.domain.toLowerCase() === selectedDomain.toLowerCase();
      return matchesSearch && matchesDomain;
    });
  }, [participants, searchTerm, selectedDomain]);

  // Overall totals
  const totalBattlePoints = useMemo(() => {
    return participants.reduce((acc, curr) => acc + curr.points, 0);
  }, [participants]);

  // Top 3 Podium
  const topThree = participants.slice(0, 3);

  // Generate deterministic layout for the Bubble Node Universe
  const bubbleNodes = useMemo(() => {
    const width = 1000;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    return participants.slice(0, 24).map((p, index) => {
      // Scale radius proportionally to points
      // Points range typically 100 to 1000+
      const radius = Math.min(54, Math.max(26, 18 + Math.sqrt(p.points) * 1.35));

      // Golden spiral distribution with some organic jitter
      const angle = index * 2.399963; // golden angle in radians
      const distance = Math.min(180, 50 + Math.sqrt(index) * 65);

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * (distance * 0.72);

      const theme = getDomainTheme(p.domain);

      return {
        participant: p,
        x,
        y,
        radius,
        theme,
      };
    });
  }, [participants]);

  const currentToast = activities[activeToastIndex];

  return (
    <div className={styles.leaderboardContainer}>
      {!isOnline && (
        <div className={styles.offlineBanner} role="status">
          <WarningIcon size={14} /> Offline — showing last synced data. Reconnect to resume live updates.
        </div>
      )}
      <div className={styles.inner}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <Link
            href="/"
            className={styles.backLink}
            onClick={() => sound.playBlip(600, 0.04)}
          >
            ← COMMAND CENTER
          </Link>

          <div className={styles.topActions}>
            <Link
              href="/scanner"
              className={styles.csvBtn}
              onClick={() => sound.playBlip(700, 0.04)}
            >
              <ScanIcon size={14} /> SCANNER PORTAL
            </Link>
            <button
              type="button"
              className={styles.csvBtn}
              onClick={() => {
                const saved = sessionStorage.getItem("techopedia15_organizer_token");
                const token = saved || window.prompt("Enter organizer passcode to export participant data:");
                if (!token) return;
                sessionStorage.setItem("techopedia15_organizer_token", token);
                const a = document.createElement("a");
                a.href = `/api/export-csv?token=${encodeURIComponent(token)}`;
                a.rel = "noopener";
                a.click();
              }}
            >
              <ExportIcon size={14} /> EXPORT PARTICIPANT CSV
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className={styles.heroHeader}>
          <span className={styles.kicker}>LIVE S.H.I.E.L.D. QUANTUM MATRIX</span>
          <h1 className={styles.title}>Multiverse Leaderboard</h1>
          <p className={styles.subtitle}>
            Real-time battle score rankings for Techopedia Level 15. The larger the battle points, the greater the agent’s glowing gravitational pull!
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className={styles.statsBanner}>
          <div className={styles.statBox}>
            <div className={styles.statBoxTitle}>TOTAL REGISTERED AGENTS</div>
            <div className={styles.statBoxValue}>{participants.length}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statBoxTitle}>TOTAL BATTLE POINTS ALLOCATED</div>
            <div className={styles.statBoxValue} style={{ color: "#ffd700" }}>
              {totalBattlePoints.toLocaleString()}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statBoxTitle}>HIGHEST AGENT SCORE</div>
            <div className={styles.statBoxValue} style={{ color: "#00e5ff" }}>
              {participants[0]?.points || 0} PTS
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statBoxTitle}>ACTIVE BATTLE DOMAINS</div>
            <div className={styles.statBoxValue} style={{ color: "#22c55e" }}>
              6
            </div>
          </div>
        </div>

        {/* Interactive Bubble Universe */}
        <div className={styles.bubbleSection}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionHeading}>
              <SparkleIcon size={15} /> DYNAMIC POINT NODES (BIGGER POINTS = LARGER GLOW)
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Hover or click any agent sphere to inspect dossier
            </div>
          </div>

          <div className={styles.bubbleCanvasWrap}>
            <svg
              className={styles.canvasSvg}
              viewBox="0 0 1000 480"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connecting ambient grid lines */}
              {bubbleNodes.map((node, i) => {
                if (i === 0) return null;
                const prev = bubbleNodes[i - 1];
                return (
                  <line
                    key={`line-${i}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Floating Spheres */}
              {bubbleNodes.map(({ participant: p, x, y, radius, theme }) => {
                return (
                  <g
                    key={p.id}
                    className={styles.bubbleNode}
                    onMouseEnter={() => {
                      sound.playBlip(600 + radius * 5, 0.02);
                      setHoveredNode({ participant: p, x, y });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      window.location.href = `/dashboard/${p.agentId}`;
                    }}
                  >
                    {/* Outer Glow Halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 4}
                      fill="none"
                      stroke={theme.glow}
                      strokeWidth="2"
                      opacity="0.6"
                      filter="url(#glowEffect)"
                    />
                    {/* Core Body */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth="2.5"
                    />
                    {/* Center Arc Reactor Ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius * 0.38}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                    {/* Points Label */}
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={Math.max(10, radius * 0.35)}
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {p.points}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredNode && (
              <div
                className={styles.nodeTooltip}
                style={{
                  left: `${(hoveredNode.x / 1000) * 100}%`,
                  top: `${(hoveredNode.y / 480) * 100}%`,
                }}
              >
                <div style={{ fontWeight: 800, color: "#ffffff", fontSize: "0.95rem" }}>
                  {hoveredNode.participant.name}
                </div>
                <div style={{ color: "#ffd700", fontFamily: "var(--font-orbitron)", fontSize: "0.75rem", margin: "2px 0 6px" }}>
                  {hoveredNode.participant.agentId} · PRN: {hoveredNode.participant.prn}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.75rem", color: "#94a3b8" }}>
                  <span>Domain: <strong style={{ color: "#ffffff" }}>{hoveredNode.participant.domain}</strong></span>
                  <span>Points: <strong style={{ color: "#00e5ff" }}>{hoveredNode.participant.points} PTS</strong></span>
                </div>
                <div style={{ marginTop: "4px", fontSize: "0.7rem", color: "#64748b" }}>
                  Click to open agent live dossier →
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className={styles.podiumSection}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span className={styles.kicker}>HALL OF CHAMPIONS</span>
              <h2 style={{ fontFamily: "var(--font-avengers)", fontSize: "2rem", color: "#ffffff", margin: 0 }}>
                Top 3 Contenders
              </h2>
            </div>

            <div className={styles.podiumRow}>
              {/* Silver #2 */}
              <div className={`${styles.podiumCard} ${styles.podiumSecond}`}>
                <div className={styles.podiumCrown} style={{ color: "#cbd5e1" }}><TrophyIcon size={28} /></div>
                <div className={styles.podiumName}>{topThree[1].name}</div>
                <div className={styles.podiumDomain}>{topThree[1].domain}</div>
                <div className={styles.podiumPoints} style={{ color: "#cbd5e1" }}>
                  {topThree[1].points} PTS
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem" }}>
                  {topThree[1].college}
                </div>
              </div>

              {/* Gold #1 */}
              <div className={`${styles.podiumCard} ${styles.podiumFirst}`}>
                <div className={styles.podiumCrown} style={{ color: "#ffd700" }}><CrownIcon size={32} /></div>
                <div style={{ color: "#ffd700", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase" }}>
                  RANK #1 LEADER
                </div>
                <div className={styles.podiumName} style={{ fontSize: "1.4rem" }}>
                  {topThree[0].name}
                </div>
                <div className={styles.podiumDomain}>{topThree[0].domain}</div>
                <div className={styles.podiumPoints}>
                  {topThree[0].points} PTS
                </div>
                <div style={{ fontSize: "0.75rem", color: "#ffd700", marginTop: "0.4rem" }}>
                  {topThree[0].college}
                </div>
              </div>

              {/* Bronze #3 */}
              <div className={`${styles.podiumCard} ${styles.podiumThird}`}>
                <div className={styles.podiumCrown} style={{ color: "#cd7f32" }}><TrophyIcon size={28} /></div>
                <div className={styles.podiumName}>{topThree[2].name}</div>
                <div className={styles.podiumDomain}>{topThree[2].domain}</div>
                <div className={styles.podiumPoints} style={{ color: "#cd7f32" }}>
                  {topThree[2].points} PTS
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem" }}>
                  {topThree[2].college}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Searchable Rankings Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableFilters}>
            <input
              type="text"
              placeholder="Search by Agent Name, PRN, or College..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="ALL">All Domains (Filter)</option>
              <option value="Code Conquest">Code Conquest</option>
              <option value="Cyber Realm & CTF">Cyber Realm & CTF</option>
              <option value="Robo Blitz">Robo Blitz</option>
              <option value="Pixel Craft">Pixel Craft</option>
              <option value="Paper & Project Expo">Paper & Project Expo</option>
              <option value="E-Sports Arena">E-Sports Arena</option>
            </select>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.rankingsTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Agent & Codename</th>
                  <th>PRN</th>
                  <th>Domain</th>
                  <th>Institution</th>
                  <th>Squad</th>
                  <th>Battle Points</th>
                  <th>Dossier</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((p, index) => {
                    const rank = p.rank || index + 1;
                    const badgeClass =
                      rank === 1
                        ? styles.rankBadge1
                        : rank === 2
                        ? styles.rankBadge2
                        : rank === 3
                        ? styles.rankBadge3
                        : "";

                    return (
                      <tr key={p.id} className={styles.tableRow}>
                        <td className={styles.rankCell}>
                          <span className={`${styles.rankBadge} ${badgeClass}`}>
                            {rank}
                          </span>
                        </td>
                        <td className={styles.agentCell}>
                          <div className={styles.agentName}>{p.name}</div>
                          <div className={styles.agentId}>
                            {p.agentId}
                          </div>
                        </td>
                        <td className={styles.prnCell}>{p.prn}</td>
                        <td className={styles.domainCell}>
                          <span className={styles.domainTag}>
                            {p.domain}
                          </span>
                        </td>
                        <td className={styles.collegeCell}>{p.college}</td>
                        <td className={styles.squadCell}>{p.teamName || "Solo"}</td>
                        <td className={styles.pointsCell}>
                          <strong className={styles.pointsValue}>
                            {p.points} PTS
                          </strong>
                        </td>
                        <td className={styles.actionCell}>
                          <Link
                            href={`/dashboard/${p.agentId}`}
                            className={styles.passLink}
                            onClick={() => sound.playBlip(750, 0.03)}
                          >
                            PASS ↗
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No agents found matching &quot;{searchTerm}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Live Activity Ticker Toast */}
      {currentToast && (
        <div className={styles.liveActivityToast}>
          <span className={styles.toastPulse} />
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-alert)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Live Stall Check-In
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
              <strong>{currentToast.name}</strong> earned +{currentToast.pointsEarned} PTS
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {currentToast.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
