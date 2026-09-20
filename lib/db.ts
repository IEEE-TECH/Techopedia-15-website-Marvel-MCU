import { supabaseAdmin, StudentRow, PointTransactionRow } from "./supabase";

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
   * Fetch all participants from Supabase, sorted by points descending with calculated rank
   */
  async getParticipants(): Promise<Participant[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .order("points", { ascending: false });

      if (error) {
        console.error("Supabase getParticipants error:", error);
        return INITIAL_SEED_PARTICIPANTS.map((p, idx) => ({ ...p, rank: idx + 1 }));
      }

      if (!data || data.length === 0) {
        return INITIAL_SEED_PARTICIPANTS.map((p, idx) => ({ ...p, rank: idx + 1 }));
      }

      return (data as StudentRow[]).map((row, idx) => ({
        ...mapStudentToParticipant(row),
        rank: idx + 1,
      }));
    } catch (err) {
      console.error("getParticipants exception:", err);
      return INITIAL_SEED_PARTICIPANTS.map((p, idx) => ({ ...p, rank: idx + 1 }));
    }
  },

  /**
   * Fetch single participant by ID, Agent ID, or PRN from Supabase with activities & rank
   */
  async getParticipantById(idOrAgentId: string): Promise<Participant | null> {
    try {
      const clean = idOrAgentId.trim();
      if (!clean) return null;

      // Query student by agent_id, prn, email, or id
      const { data: students, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .or(buildStudentLookupFilter(clean))
        .limit(1);

      if (error) {
        console.error("Supabase getParticipantById error:", error);
      }

      let studentRow: StudentRow | null = students && students.length > 0 ? (students[0] as StudentRow) : null;

      // If not found in Supabase, check initial seed for graceful development fallback
      if (!studentRow) {
        const seedIndex = INITIAL_SEED_PARTICIPANTS.findIndex(
          (p) =>
            p.id.toLowerCase() === clean.toLowerCase() ||
            p.agentId.toLowerCase() === clean.toLowerCase() ||
            p.prn.toLowerCase() === clean.toLowerCase()
        );
        if (seedIndex !== -1) {
          return {
            ...INITIAL_SEED_PARTICIPANTS[seedIndex],
            rank: seedIndex + 1,
          };
        }
        return null;
      }

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
        prn: studentRow!.prn,
        name: studentRow!.name,
        type: t.reason.toLowerCase().includes("activation") || t.reason.toLowerCase().includes("registration")
          ? "registration"
          : "game_played",
        title: t.reason,
        pointsEarned: t.points,
        totalPoints: studentRow!.points,
        timestamp: t.created_at,
      }));

      // If no transactions exist, synthesize the registration clearance activity
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

      // Calculate dynamic rank: count how many students have more points
      const { count } = await supabaseAdmin
        .from("students")
        .select("*", { count: "exact", head: true })
        .gt("points", studentRow.points);

      const rank = (count || 0) + 1;

      return {
        ...mapStudentToParticipant(studentRow, activities),
        rank,
      };
    } catch (err) {
      console.error("getParticipantById exception:", err);
      return null;
    }
  },

  /**
   * Fetch participant by PRN from Supabase
   */
  async getParticipantByPrn(prn: string): Promise<Participant | null> {
    try {
      const clean = prn.trim();
      if (!clean) return null;

      const { data, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .ilike("prn", clean)
        .limit(1);

      if (error) {
        console.error("Supabase getParticipantByPrn error:", error);
        return null;
      }

      if (data && data.length > 0) {
        return mapStudentToParticipant(data[0] as StudentRow);
      }
      return null;
    } catch (err) {
      console.error("getParticipantByPrn exception:", err);
      return null;
    }
  },

  /**
   * Fetch participant by Email from Supabase
   */
  async getParticipantByEmail(email: string): Promise<Participant | null> {
    try {
      const clean = email.trim().toLowerCase();
      if (!clean) return null;

      const { data, error } = await supabaseAdmin
        .from("students")
        .select("*")
        .ilike("email", clean)
        .limit(1);

      if (error) {
        console.error("Supabase getParticipantByEmail error:", error);
        return null;
      }

      if (data && data.length > 0) {
        return mapStudentToParticipant(data[0] as StudentRow);
      }
      return null;
    } catch (err) {
      console.error("getParticipantByEmail exception:", err);
      return null;
    }
  },

  /**
   * Add a new participant directly into Supabase PostgreSQL
   */
  async addParticipant(
    participant: Omit<Participant, "id" | "registeredAt" | "activities">
  ): Promise<Participant> {
    const registeredAt = new Date().toISOString();
    const initialPoints = participant.points || 100;

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

    if (error) {
      console.error("Supabase addParticipant error:", error);
      throw new Error(`Cloud database insert failed: ${error.message}`);
    }

    const createdStudent = data as StudentRow;

    // Log initial activation point transaction
    const initialActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      agentId: createdStudent.agent_id,
      prn: createdStudent.prn,
      name: createdStudent.name,
      type: "registration",
      title: "S.H.I.E.L.D. Protocol Clearance Activated",
      pointsEarned: initialPoints,
      totalPoints: initialPoints,
      timestamp: registeredAt,
    };

    try {
      await supabaseAdmin
        .from("point_transactions")
        .insert({
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
  },

  /**
   * Award battle points to an agent in Supabase PostgreSQL
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

    // Find student in Supabase
    const { data: students, error: findError } = await supabaseAdmin
      .from("students")
      .select("*")
      .or(buildStudentLookupFilter(clean))
      .limit(1);

    if (findError || !students || students.length === 0) {
      console.error("awardPoints student lookup failed:", findError);
      return null;
    }

    const currentStudent = students[0] as StudentRow;
    const newTotalPoints = (currentStudent.points || 0) + safePoints;
    const timestamp = new Date().toISOString();

    // Update points in Supabase students table
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from("students")
      .update({ points: newTotalPoints })
      .eq("id", currentStudent.id)
      .select()
      .single();

    if (updateError || !updatedData) {
      console.error("awardPoints update failed:", updateError);
      throw new Error(`Failed to update points in cloud database: ${updateError?.message}`);
    }

    const updatedStudent = updatedData as StudentRow;

    // Insert transaction log in Supabase point_transactions table
    const fullReason = `${activityTitle} (+${safePoints} PTS · via ${scannedBy})`;
    const { data: transData, error: transError } = await supabaseAdmin
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

    if (transError) {
      console.warn("Point transaction log warning:", transError);
    }

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
  },

  /**
   * Fetch recent activity transactions from Supabase
   */
  async getRecentActivities(limit: number = 20): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("point_transactions")
        .select("id, agent_id, event_id, points, reason, awarded_by, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error || !data) {
        console.error("getRecentActivities Supabase error:", error);
        return [];
      }

      const rows = data as PointTransactionRow[];

      // Fetch student details for these agent_ids to include names and prns
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
    } catch (err) {
      console.error("getRecentActivities exception:", err);
      return [];
    }
  },
};
