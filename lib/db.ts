import fs from "fs";
import path from "path";

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

interface DatabaseSchema {
  participants: Participant[];
  activities: ActivityLog[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "techopedia.json");

// Default seed participants so the Leaderboard & Bubble graph looks vibrant immediately
const INITIAL_SEED: DatabaseSchema = {
  participants: [
    {
      id: "agent-tony-01",
      agentId: "TECH15-STARK-1001",
      name: "Prathamesh Palve",
      prn: "2023CS0101",
      email: "prathamesh@ieee-siesgst.ac.in",
      phone: "+91 98201 11223",
      college: "SIES Graduate School of Technology",
      teamName: "Project Stark",
      teamSize: "4",
      domain: "Code Conquest",
      points: 750,
      registeredAt: "2026-10-10T10:00:00.000Z",
      activities: [
        {
          id: "act-1",
          agentId: "TECH15-STARK-1001",
          prn: "2023CS0101",
          name: "Prathamesh Palve",
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
          name: "Prathamesh Palve",
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
          name: "Prathamesh Palve",
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
      domain: "Cyber Realm & CTF",
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
      domain: "Robo Blitz",
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
      domain: "Pixel Craft",
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
      domain: "Code Conquest",
      points: 290,
      registeredAt: "2026-10-10T11:30:00.000Z",
      activities: [],
    },
  ],
  activities: [
    {
      id: "act-3",
      agentId: "TECH15-STARK-1001",
      prn: "2023CS0101",
      name: "Prathamesh Palve",
      type: "game_played",
      title: "Matrix Memory Challenge",
      pointsEarned: 300,
      totalPoints: 750,
      timestamp: "2026-10-10T14:15:00.000Z",
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
};

// Serializes read-modify-write cycles within this process so two near-
// simultaneous requests (e.g. two organizers scanning at once) can't clobber
// each other's write. This does NOT protect against concurrent writes across
// multiple server instances/processes — a JSON file is not a real database.
// For a single-process deployment (the expected setup for this event) it
// closes the common race window.
let writeChain: Promise<unknown> = Promise.resolve();
function withWriteLock<T>(fn: () => T): Promise<T> {
  const result = writeChain.then(fn);
  writeChain = result.catch(() => undefined);
  return result;
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED, null, 2), "utf8");
      return INITIAL_SEED;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Database read error:", err);
    return INITIAL_SEED;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Database write error:", err);
  }
}

export const db = {
  getParticipants(): Participant[] {
    const data = readDb();
    // Sort descending by points
    const sorted = [...data.participants].sort((a, b) => b.points - a.points);
    return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
  },

  getParticipantById(idOrAgentId: string): Participant | null {
    const data = readDb();
    const clean = idOrAgentId.trim().toLowerCase();
    const p = data.participants.find(
      (item) =>
        item.id.toLowerCase() === clean ||
        item.agentId.toLowerCase() === clean ||
        item.prn.toLowerCase() === clean
    );
    if (!p) return null;

    const rank =
      data.participants.sort((a, b) => b.points - a.points).findIndex((x) => x.id === p.id) + 1;
    return { ...p, rank };
  },

  getParticipantByPrn(prn: string): Participant | null {
    const data = readDb();
    const clean = prn.trim().toLowerCase();
    return data.participants.find((item) => item.prn.toLowerCase() === clean) || null;
  },

  getParticipantByEmail(email: string): Participant | null {
    const data = readDb();
    const clean = email.trim().toLowerCase();
    return data.participants.find((item) => item.email.toLowerCase() === clean) || null;
  },

  addParticipant(participant: Omit<Participant, "id" | "registeredAt" | "activities">): Promise<Participant> {
    return withWriteLock(() => {
      const data = readDb();
      const id = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const registeredAt = new Date().toISOString();

      const initialActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        agentId: participant.agentId,
        prn: participant.prn,
        name: participant.name,
        type: "registration",
        title: "S.H.I.E.L.D. Protocol Clearance Activated",
        pointsEarned: participant.points || 100,
        totalPoints: participant.points || 100,
        timestamp: registeredAt,
      };

      const newParticipant: Participant = {
        ...participant,
        id,
        registeredAt,
        activities: [initialActivity],
      };

      data.participants.unshift(newParticipant);
      data.activities.unshift(initialActivity);

      // Keep activities log capped at recent 150 items
      if (data.activities.length > 150) {
        data.activities = data.activities.slice(0, 150);
      }

      writeDb(data);
      return newParticipant;
    });
  },

  awardPoints(
    identifier: string,
    pointsToAdd: number,
    activityTitle: string,
    scannedBy: string = "Stall Coordinator"
  ): Promise<{ participant: Participant; activity: ActivityLog } | null> {
    // Defense-in-depth hard ceiling — the API route enforces the real
    // business rule (currently 500/award); this just stops any caller from
    // ever writing an absurd/spoofed value straight to the ledger.
    const safePoints = Math.max(0, Math.min(5000, Math.round(pointsToAdd) || 0));
    if (safePoints <= 0) return Promise.resolve(null);

    return withWriteLock(() => {
      const data = readDb();
      const clean = identifier.trim().toLowerCase();

      const index = data.participants.findIndex(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.agentId.toLowerCase() === clean ||
          p.prn.toLowerCase() === clean
      );

      if (index === -1) return null;

      const p = data.participants[index];
      const newTotal = p.points + safePoints;
      p.points = newTotal;

      const newActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        agentId: p.agentId,
        prn: p.prn,
        name: p.name,
        type: "game_played",
        title: `${activityTitle} (+${safePoints} PTS · via ${scannedBy})`,
        pointsEarned: safePoints,
        totalPoints: newTotal,
        timestamp: new Date().toISOString(),
      };

      p.activities.unshift(newActivity);
      data.activities.unshift(newActivity);

      if (data.activities.length > 150) {
        data.activities = data.activities.slice(0, 150);
      }

      writeDb(data);
      return { participant: p, activity: newActivity };
    });
  },

  getRecentActivities(limit: number = 10): ActivityLog[] {
    const data = readDb();
    return data.activities.slice(0, limit);
  },
};
