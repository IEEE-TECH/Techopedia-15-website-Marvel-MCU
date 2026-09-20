import { supabaseAdmin, StudentRow, PointTransactionRow, isSupabaseConfigured } from "./supabase";

export interface ActivityLog {
  id: string;
  agentId: string;
  prn: string;
  name: string;
  type: "registration" | "game_played" | "check_in" | "bonus";
  title: string;
  pointsEarned: number;
  totalPoints: number;
  timestamp: string;
}

export interface Participant {
  id: string; // Internal UUID / Slug
  agentId: string; // Displayed Marvel ID e.g. TECH15-STARK-4821
  name: string;
  prn: string;
  email: string;
  phone: string;
  college: string;
  teamName: string;
  teamSize: string;
  domain: string;
  points: number;
  rank?: number;
  qrCodeUrl?: string;
  registeredAt: string;
  activities: ActivityLog[];
}

// Default initial fallback seed participants
export const INITIAL_SEED_PARTICIPANTS: Participant[] = [
  {
    id: "agent-tony-01",
    agentId: "TECH15-STARK-1001",
    name: "Prathmesh Palve",
    prn: "2023CS0101",
    email: "prathamesh@ieee-siesgst.ac.in",
    phone: "+91 98201 11223",
    college: "SIES Graduate School of Technology",
    teamName: "Project Stark",
    teamSize: "4",
    domain: "Squabble",
    points: 750,
    registeredAt: "2026-10-10T10:00:00.000Z",
    activities: [
      {
        id: "act-1",
        agentId: "TECH15-STARK-1001",
        prn: "2023CS0101",
        name: "Prathmesh Palve",
        type: "registration",
        title: "S.H.I.E.L.D. Clearance Activation",
        pointsEarned: 100,
        totalPoints: 100,
        timestamp: "2026-10-10T10:00:00.000Z",
      },
      {
        id: "act-2",
        agentId: "TECH15-STARK-1001",
        prn: "2023CS0101",
        name: "Prathmesh Palve",
        type: "game_played",
        title: "Bug Blitz Arena — High Voltage Duel",
        pointsEarned: 350,
        totalPoints: 450,
        timestamp: "2026-10-10T11:30:00.000Z",
      },
      {
        id: "act-3",
        agentId: "TECH15-STARK-1001",
        prn: "2023CS0101",
        name: "Prathmesh Palve",
        type: "game_played",
        title: "Matrix Memory Challenge",
        pointsEarned: 300,
        totalPoints: 750,
        timestamp: "2026-10-10T14:15:00.000Z",
      },
    ],
  },
  {
    id: "agent-wakanda-02",
    agentId: "TECH15-PANTHER-2042",
    name: "Abhang Rane",
    prn: "2023IT0204",
    email: "abhang@ieee-siesgst.ac.in",
    phone: "+91 98202 22334",
    college: "SIES Graduate School of Technology",
    teamName: "Wakanda Cyber Siege",
    teamSize: "3",
    domain: "Eureka",
    points: 620,
    registeredAt: "2026-10-10T10:15:00.000Z",
    activities: [
      {
        id: "act-4",
        agentId: "TECH15-PANTHER-2042",
        prn: "2023IT0204",
        name: "Abhang Rane",
        type: "registration",
        title: "Vibranium Clearance Activation",
        pointsEarned: 100,
        totalPoints: 100,
        timestamp: "2026-10-10T10:15:00.000Z",
      },
      {
        id: "act-5",
        agentId: "TECH15-PANTHER-2042",
        prn: "2023IT0204",
        name: "Abhang Rane",
        type: "game_played",
        title: "Offensive CTF Flag Capture",
        pointsEarned: 520,
        totalPoints: 620,
        timestamp: "2026-10-10T13:00:00.000Z",
      },
    ],
  },
  {
    id: "agent-cyclops-03",
    agentId: "TECH15-XMEN-3091",
    name: "Mukul Wani",
    prn: "2023ME0309",
    email: "mukul@ieee-siesgst.ac.in",
    phone: "+91 98203 33445",
    college: "SIES Graduate School of Technology",
    teamName: "Stark Bot Battalion",
    teamSize: "4",
    domain: "Inquisitive",
    points: 480,
    registeredAt: "2026-10-10T10:30:00.000Z",
    activities: [
      {
        id: "act-6",
        agentId: "TECH15-XMEN-3091",
        prn: "2023ME0309",
        name: "Mukul Wani",
        type: "registration",
        title: "Mutant Academy Clearance",
        pointsEarned: 100,
        totalPoints: 100,
        timestamp: "2026-10-10T10:30:00.000Z",
      },
      {
        id: "act-7",
        agentId: "TECH15-XMEN-3091",
        prn: "2023ME0309",
        name: "Mukul Wani",
        type: "game_played",
        title: "Robo Wars Arena Survival",
        pointsEarned: 380,
        totalPoints: 480,
        timestamp: "2026-10-10T15:30:00.000Z",
      },
    ],
  },
  {
    id: "agent-mystique-04",
    agentId: "TECH15-AVGR-4055",
    name: "Aditi Dhanawade",
    prn: "2023EX0412",
    email: "aditi@ieee-siesgst.ac.in",
    phone: "+91 98204 44556",
    college: "SIES Graduate School of Technology",
    teamName: "Quantum Creators",
    teamSize: "2",
    domain: "Vanguard",
    points: 410,
    registeredAt: "2026-10-10T11:00:00.000Z",
    activities: [
      {
        id: "act-8",
        agentId: "TECH15-AVGR-4055",
        prn: "2023EX0412",
        name: "Aditi Dhanawade",
        type: "registration",
        title: "Quantum UI Access Pass",
        pointsEarned: 100,
        totalPoints: 100,
        timestamp: "2026-10-10T11:00:00.000Z",
      },
      {
        id: "act-9",
        agentId: "TECH15-AVGR-4055",
        prn: "2023EX0412",
        name: "Aditi Dhanawade",
        type: "game_played",
        title: "Speed UI Design Jam",
        pointsEarned: 310,
        totalPoints: 410,
        timestamp: "2026-10-10T16:00:00.000Z",
      },
    ],
  },
  {
    id: "agent-spidey-05",
    agentId: "TECH15-SPDR-5012",
    name: "Ayush Bhadane",
    prn: "2024CS0518",
    email: "ayush@ieee-siesgst.ac.in",
    phone: "+91 98205 55667",
    college: "SIES Graduate School of Technology",
    teamName: "Web Slingers",
    teamSize: "2",
    domain: "Squabble",
    points: 290,
    registeredAt: "2026-10-10T11:30:00.000Z",
    activities: [],
  },
];

// Persistent in-memory store for local development, tests, or Supabase downtime
const localParticipants: Participant[] = JSON.parse(JSON.stringify(INITIAL_SEED_PARTICIPANTS));

function getLocalParticipantsSorted(): Participant[] {
  return [...localParticipants]
    .sort((a, b) => b.points - a.points)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));
}

export function mapStudentToParticipant(
  row: StudentRow,
  activities: ActivityLog[] = []
): Participant {
  return {
    id: row.id,
    agentId: row.agent_id,
    name: row.name,
    prn: row.prn,
    email: row.email,
    phone: row.phone || "",
    college: row.college || "SIES Graduate School of Technology",
    teamName: row.team_name || "Avengers Initiative",
    teamSize: row.team_size || "1",
    domain: row.domain,
    points: row.points ?? 0,
    qrCodeUrl: row.qr_code_url || undefined,
    registeredAt: row.registered_at,
    activities,
  };
}

export function mapTransactionToActivity(
  t: PointTransactionRow,
  studentName: string = "",
  studentPrn: string = ""
): ActivityLog {
  return {
    id: t.id,
    agentId: t.agent_id,
    prn: studentPrn,
    name: studentName,
    type: "game_played",
    title: t.reason,
    pointsEarned: t.points,
    totalPoints: 0,
    timestamp: t.created_at,
  };
}

function buildStudentLookupFilter(clean: string): string {
  const isNumeric = /^\d+$/.test(clean);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
  if (isNumeric || isUuid) {
    return `agent_id.ilike.${clean},prn.ilike.${clean},email.ilike.${clean},id.eq.${clean}`;
  }
  return `agent_id.ilike.${clean},prn.ilike.${clean},email.ilike.${clean}`;
}

export const db = {
  /**
   * Fetch all participants from Supabase (or fallback to local store), sorted by points descending with calculated rank
   */
  async getParticipants(): Promise<Participant[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .select("*")
          .order("points", { ascending: false });

        if (!error && data && data.length > 0) {
          return (data as StudentRow[]).map((row, idx) => ({
            ...mapStudentToParticipant(row),
            rank: idx + 1,
          }));
        }
      } catch (err) {
        console.warn("Supabase getParticipants failed, using local store:", err);
      }
    }
    return getLocalParticipantsSorted();
  },

  /**
   * Fetch single participant by ID, Agent ID, or PRN
   */
  async getParticipantById(idOrAgentId: string): Promise<Participant | null> {
    const clean = idOrAgentId.trim();
    if (!clean) return null;

    if (isSupabaseConfigured) {
      try {
        const { data: students, error } = await supabaseAdmin
          .from("students")
          .select("*")
          .or(buildStudentLookupFilter(clean))
          .limit(1);

        if (!error && students && students.length > 0) {
          const studentRow = students[0] as StudentRow;

          // Fetch transaction activities for this agent
          const { data: transactions } = await supabaseAdmin
            .from("point_transactions")
            .select("*")
            .eq("agent_id", studentRow.agent_id)
            .order("created_at", { ascending: false })
            .limit(50);

          const activities: ActivityLog[] = (transactions || []).map((t: PointTransactionRow) => ({
            id: t.id,
            agentId: t.agent_id,
            prn: studentRow.prn,
            name: studentRow.name,
            type: t.reason.toLowerCase().includes("activation") || t.reason.toLowerCase().includes("registration")
              ? "registration"
              : "game_played",
            title: t.reason,
            pointsEarned: t.points,
            totalPoints: studentRow.points,
            timestamp: t.created_at,
          }));

          if (activities.length === 0) {
            activities.push({
              id: `act-${studentRow.agent_id}`,
              agentId: studentRow.agent_id,
              prn: studentRow.prn,
              name: studentRow.name,
              type: "registration",
              title: "S.H.I.E.L.D. Clearance Activation",
              pointsEarned: 100,
              totalPoints: studentRow.points,
              timestamp: studentRow.registered_at,
            });
          }

          const { count } = await supabaseAdmin
            .from("students")
            .select("*", { count: "exact", head: true })
            .gt("points", studentRow.points);

          const rank = (count || 0) + 1;

          return {
            ...mapStudentToParticipant(studentRow, activities),
            rank,
          };
        }
      } catch (err) {
        console.warn("Supabase getParticipantById failed, checking local store:", err);
      }
    }

    // Local in-memory fallback lookup
    const sorted = getLocalParticipantsSorted();
    const found = sorted.find(
      (p) =>
        p.id.toLowerCase() === clean.toLowerCase() ||
        p.agentId.toLowerCase() === clean.toLowerCase() ||
        p.prn.toLowerCase() === clean.toLowerCase()
    );

    return found || null;
  },

  /**
   * Fetch participant by PRN
   */
  async getParticipantByPrn(prn: string): Promise<Participant | null> {
    const clean = prn.trim();
    if (!clean) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .select("*")
          .ilike("prn", clean)
          .limit(1);

        if (!error && data && data.length > 0) {
          return mapStudentToParticipant(data[0] as StudentRow);
        }
      } catch (err) {
        console.warn("Supabase getParticipantByPrn failed, checking local store:", err);
      }
    }

    const found = localParticipants.find((p) => p.prn.toLowerCase() === clean.toLowerCase());
    return found || null;
  },

  /**
   * Fetch participant by Email
   */
  async getParticipantByEmail(email: string): Promise<Participant | null> {
    const clean = email.trim().toLowerCase();
    if (!clean) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .select("*")
          .ilike("email", clean)
          .limit(1);

        if (!error && data && data.length > 0) {
          return mapStudentToParticipant(data[0] as StudentRow);
        }
      } catch (err) {
        console.warn("Supabase getParticipantByEmail failed, checking local store:", err);
      }
    }

    const found = localParticipants.find((p) => p.email.toLowerCase() === clean);
    return found || null;
  },

  /**
   * Add a new participant into Supabase or fallback to local in-memory store
   */
  async addParticipant(
    participant: Omit<Participant, "id" | "registeredAt" | "activities">
  ): Promise<Participant> {
    const registeredAt = new Date().toISOString();
    const initialPoints = participant.points || 100;

    const initialActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      agentId: participant.agentId,
      prn: participant.prn,
      name: participant.name,
      type: "registration",
      title: "S.H.I.E.L.D. Protocol Clearance Activated",
      pointsEarned: initialPoints,
      totalPoints: initialPoints,
      timestamp: registeredAt,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("students")
          .insert({
            agent_id: participant.agentId,
            name: participant.name,
            prn: participant.prn,
            email: participant.email,
            phone: participant.phone || null,
            college: participant.college || "SIES Graduate School of Technology",
            team_name: participant.teamName || "Avengers Initiative",
            team_size: participant.teamSize || "1",
            domain: participant.domain,
            points: initialPoints,
            qr_code_url: participant.qrCodeUrl || null,
            registered_at: registeredAt,
          })
          .select()
          .single();

        if (!error && data) {
          const createdStudent = data as StudentRow;
          try {
            await supabaseAdmin.from("point_transactions").insert({
              agent_id: createdStudent.agent_id,
              event_id: "REGISTRATION",
              points: initialPoints,
              reason: "S.H.I.E.L.D. Protocol Clearance Activated",
              awarded_by: "Command Center Auto-Clearance",
              created_at: registeredAt,
            });
          } catch (txErr) {
            console.warn("Initial transaction log warning:", txErr);
          }
          return mapStudentToParticipant(createdStudent, [initialActivity]);
        }
      } catch (err) {
        console.warn("Supabase addParticipant failed, falling back to in-memory store:", err);
      }
    }

    // Fallback: save to local memory store
    const localNew: Participant = {
      id: `agent-${Date.now().toString(36)}`,
      agentId: participant.agentId,
      name: participant.name,
      prn: participant.prn,
      email: participant.email,
      phone: participant.phone || "",
      college: participant.college || "SIES Graduate School of Technology",
      teamName: participant.teamName || "Avengers Initiative",
      teamSize: participant.teamSize || "1",
      domain: participant.domain,
      points: initialPoints,
      qrCodeUrl: participant.qrCodeUrl,
      registeredAt,
      activities: [initialActivity],
    };

    localParticipants.unshift(localNew);
    return localNew;
  },

  /**
   * Award battle points to an agent
   */
  async awardPoints(
    identifier: string,
    pointsToAdd: number,
    activityTitle: string,
    scannedBy: string = "Stall Coordinator"
  ): Promise<{ participant: Participant; activity: ActivityLog } | null> {
    const safePoints = Math.max(0, Math.min(5000, Math.round(pointsToAdd) || 0));
    if (safePoints <= 0) return null;

    const clean = identifier.trim();
    if (!clean) return null;
    const timestamp = new Date().toISOString();
    const fullReason = `${activityTitle} (+${safePoints} PTS · via ${scannedBy})`;

    if (isSupabaseConfigured) {
      try {
        const { data: students, error: findError } = await supabaseAdmin
          .from("students")
          .select("*")
          .or(buildStudentLookupFilter(clean))
          .limit(1);

        if (!findError && students && students.length > 0) {
          const currentStudent = students[0] as StudentRow;
          const newTotalPoints = (currentStudent.points || 0) + safePoints;

          const { data: updatedData, error: updateError } = await supabaseAdmin
            .from("students")
            .update({ points: newTotalPoints })
            .eq("id", currentStudent.id)
            .select()
            .single();

          if (!updateError && updatedData) {
            const updatedStudent = updatedData as StudentRow;
            const { data: transData } = await supabaseAdmin
              .from("point_transactions")
              .insert({
                agent_id: updatedStudent.agent_id,
                event_id: activityTitle.replace(/[^a-zA-Z0-9]/g, "-").toUpperCase().slice(0, 30),
                points: safePoints,
                reason: fullReason,
                awarded_by: scannedBy,
                created_at: timestamp,
              })
              .select()
              .single();

            const newActivity: ActivityLog = {
              id: transData?.id || `act-${Date.now()}`,
              agentId: updatedStudent.agent_id,
              prn: updatedStudent.prn,
              name: updatedStudent.name,
              type: "game_played",
              title: fullReason,
              pointsEarned: safePoints,
              totalPoints: newTotalPoints,
              timestamp,
            };

            return {
              participant: mapStudentToParticipant(updatedStudent, [newActivity]),
              activity: newActivity,
            };
          }
        }
      } catch (err) {
        console.warn("Supabase awardPoints failed, falling back to local store:", err);
      }
    }

    // Local in-memory fallback update
    const target = localParticipants.find(
      (p) =>
        p.id.toLowerCase() === clean.toLowerCase() ||
        p.agentId.toLowerCase() === clean.toLowerCase() ||
        p.prn.toLowerCase() === clean.toLowerCase() ||
        p.email.toLowerCase() === clean.toLowerCase()
    );

    if (!target) return null;

    target.points += safePoints;
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      agentId: target.agentId,
      prn: target.prn,
      name: target.name,
      type: "game_played",
      title: fullReason,
      pointsEarned: safePoints,
      totalPoints: target.points,
      timestamp,
    };

    if (!target.activities) target.activities = [];
    target.activities.unshift(newActivity);

    return {
      participant: { ...target },
      activity: newActivity,
    };
  },

  /**
   * Fetch recent activity transactions
   */
  async getRecentActivities(limit: number = 20): Promise<ActivityLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("point_transactions")
          .select("id, agent_id, event_id, points, reason, awarded_by, created_at")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          const rows = data as PointTransactionRow[];
          const agentIds = Array.from(new Set(rows.map((d) => d.agent_id)));
          const studentMap = new Map<string, { name: string; prn: string }>();

          if (agentIds.length > 0) {
            const { data: studentList } = await supabaseAdmin
              .from("students")
              .select("agent_id, name, prn")
              .in("agent_id", agentIds);

            if (studentList) {
              studentList.forEach((s: { agent_id: string; name: string; prn: string }) => {
                studentMap.set(s.agent_id, { name: s.name, prn: s.prn });
              });
            }
          }

          return rows.map((t) => {
            const student = studentMap.get(t.agent_id);
            return {
              id: t.id,
              agentId: t.agent_id,
              prn: student?.prn || "",
              name: student?.name || t.agent_id,
              type: (t.reason.toLowerCase().includes("activation") || t.reason.toLowerCase().includes("registration")
                ? "registration"
                : "game_played") as "registration" | "game_played",
              title: t.reason,
              pointsEarned: t.points,
              totalPoints: 0,
              timestamp: t.created_at,
            };
          });
        }
      } catch (err) {
        console.warn("Supabase getRecentActivities failed, using local activities:", err);
      }
    }

    // Local in-memory fallback
    const allActs: ActivityLog[] = [];
    localParticipants.forEach((p) => {
      if (p.activities && p.activities.length > 0) {
        allActs.push(...p.activities);
      }
    });

    return allActs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
};
