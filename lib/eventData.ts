/**
 * TECHOPEDIA LEVEL 15 // IEEE ANNUAL TECHNICAL FEST
 * Marvel Multiverse of Tech — Master Content & Event Architecture
 */

export interface EventDomain {
  id: string;
  slug: string;
  name: string;
  mcuCodename: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  teamSize: string;
  venue: string;
  time: string;
  rounds: {
    title: string;
    description: string;
    duration: string;
  }[];
  rules: string[];
  judgingCriteria: string[];
  accentColor: string;
  glowColor: string;
  coordinators: {
    name: string;
    contact: string;
  }[];
}

export const DOMAINS: EventDomain[] = [
  {
    id: "squabble",
    slug: "doom",
    name: "Squabble",
    mcuCodename: "Project Doomsday",
    tagline: "Where Wit, Skill & Strategy Collide",
    shortDesc: "A fast-paced face-to-face debate competition where teams battle through rapid arguments, rebuttals, and the ultimate Topic Swap challenge.",
    fullDesc: "Squabble is Techopedia 15's high-energy debate competition designed to test logic, communication, adaptability, and stage presence. Teams face off in intense debate rounds where topics are revealed at the start, and the moderator can trigger a Topic Swap mid-round, forcing participants to defend the opposite stance. From preliminary rounds to the grand final, every argument, rebuttal, and strategic shift can change the outcome.",
    teamSize: "2 Members per Team",
    venue: "To Be Announced",
    time: "Event Day · Preliminary → Semi-final → Final",
    rounds: [
      {
        title: "Round 1: Topic Reveal",
        description: "The debate motion is revealed from a sealed set. Teams receive their preparation time and are assigned their initial stances.",
        duration: "1 Minute Reveal"
      },
      {
        title: "Round 2: Opening Statements",
        description: "Both teams prepare their arguments and deliver their opening statements before the opposing side begins its case.",
        duration: "5 Min Prep + 3 Min Speaking"
      },
      {
        title: "Round 3: Rapid Rebuttal",
        description: "Teams engage in alternating 30-second rebuttal bursts, challenging opposing arguments under intense time pressure.",
        duration: "4 Minutes"
      },
      {
        title: "Round 4: The Topic Swap",
        description: "At the moderator's discretion, the Topic Swap can be triggered once during the rebuttal phase, forcing teams to adapt and defend the opposite stance.",
        duration: "During Rebuttal"
      },
      {
        title: "Round 5: Closing Statements",
        description: "Teams deliver their final closing statements, summarizing their strongest arguments and responding to the direction of the debate.",
        duration: "1 Minute Each"
      }
    ],
    rules: [
      "No personal attacks — arguments must target the motion, not the opponent.",
      "The timekeeper's buzzer or bell is final. Speaking after time expires results in a point deduction.",
      "Topics are selected blindly from a sealed set and cannot be repeated across rounds.",
      "The Topic Swap can only be triggered once per round by the moderator and only during the rebuttal phase.",
      "Judges' scores are final. On-spot disputes are not permitted and concerns may only be flagged through the scorekeeper."
    ],
    judgingCriteria: [
      "Argument Strength & Logic (30%)",
      "Rebuttal Quality (25%)",
      "Adaptability After Topic Swap (20%)",
      "Delivery & Stage Presence (15%)",
      "Audience Response — Optional Live Poll (10%)"
    ],
    accentColor: "#ed1d24",
    glowColor: "rgba(237, 29, 36, 0.4)",
    coordinators: [
      { name: "Krish", contact: "+91 9819537896" }
    ]
  },
  {
    id: "inquisitive",
    slug: "blackpanther",
    name: "Inquisitive",
    mcuCodename: "Project Black Panther",
    tagline: "The Ultimate Multiverse Quiz Showdown",
    shortDesc: "A high-energy Marvel-themed quiz where teams battle through three rounds of questions, characters, images, Infinity Stone powers, and Chaos Cards.",
    fullDesc: "Inquisitive is Techopedia 15's Marvel Cinematic Universe themed quiz competition designed to test knowledge, speed, teamwork, strategy, and adaptability. Teams of two compete across three rounds. Round I, Multiverse Scan, introduces the Infinity Stones mechanic, where each team blindly selects one of six stones and receives a unique power. Round II, Wakanda Who?, challenges teams to identify famous personalities, characters, or scientists through yes-or-no questions and buzzer-based competition. Round III, Civil War, brings the remaining teams together for an image-based final where teams discuss and simultaneously reveal their answers. Chaos Cards add another strategic layer, allowing teams to disrupt opponents or modify their own scoring and answers.",
    teamSize: "2 Members per Team",
    venue: "To Be Announced",
    time: "Event Day · 3 Rounds",
    rounds: [
      {
        title: "Round I: Multiverse Scan",
        description: "A typical quiz round where teams answer questions one by one. Each team blindly selects one of the six Infinity Stones before the game and receives its corresponding power for the round. The power must be activated before the opposing team answers a question and can only be used once during the round. Each question has a 10-second answering limit.",
        duration: "10 Seconds per Question"
      },
      {
        title: "Infinity Stones: Round I Powers",
        description: "TIME: Extra 5 seconds. SPACE: Skip one question and still receive points. REALITY: Get a second chance. POWER: Double points for one question only. MIND: Receive one clue. SOUL: Receive the same points as the opposing team for one question only.",
        duration: "One Power per Team"
      },
      {
        title: "Round II: Wakanda Who?",
        description: "Teams identify a famous personality, character, or scientist. Each team receives 20 questions using only yes-or-no answers. The first team to click the buzzer and answer correctly moves forward. A wrong answer results in the team losing one question.",
        duration: "20 Questions per Team"
      },
      {
        title: "Round III: Civil War",
        description: "The remaining five teams compete in the final round. Four images are displayed. Teams are given time to discuss and write their answers on paper. After the discussion period ends, every team reveals its answer simultaneously. Only correct answers receive points, and the team with the highest score wins.",
        duration: "Final Round"
      }
    ],
    rules: [
      "Each team consists of 2 members.",
      "The competition consists of 3 rounds.",
      "In Round I, 6 Infinity Stones are placed inside an opaque box and each team blindly selects one stone.",
      "The selected Infinity Stone determines the team's power for Round I.",
      "An Infinity Stone power can be activated only once during the entire round.",
      "The Infinity Stone power must be activated before the opposing team answers the question.",
      "Round I questions have a 10-second answering limit.",
      "In Round II, teams identify famous personalities, characters, or scientists using yes-or-no questions.",
      "Each team receives 20 questions in Round II.",
      "The first team to click the buzzer and answer correctly moves forward.",
      "A wrong answer in Round II causes the team to lose one question.",
      "In Round III, teams discuss the displayed images and write their answers on paper.",
      "All teams reveal their answers simultaneously after the discussion period.",
      "Only correct answers receive points in Round III.",
      "The team with the highest final score wins.",
      "Each team picks one Chaos Card before the game.",
      "A Chaos Card can be activated once before a question is displayed.",
      "SNAP: Select another team to lose points worth one question.",
      "NO WAY HOME: Choose another team that cannot answer the next question.",
      "STARK OVERRIDE: If the team answers the next question correctly, they receive double points.",
      "LOKI'S BETRAYAL: Select one member from another team to leave the room for one question.",
      "DR. STRANGE: Change the team's answer after everyone reveals their answer and before the final answer reveal."
    ],
    judgingCriteria: [
      "Correct Answers",
      "Final Score",
      "Speed & Buzzer Response",
      "Strategic Use of Infinity Stone Powers",
      "Strategic Use of Chaos Cards"
    ],
    accentColor: "#6f42c1",
    glowColor: "rgba(111, 66, 193, 0.4)",
    coordinators: [
      { name: "Sakshi", contact: "+91 7738113784" }
    ]
  },
  {
    id: "eureka",
    slug: "eureka",
    name: "Eureka",
    mcuCodename: "Wakanda Firewall Siege",
    tagline: "Offensive Security, Cryptography & Live Jeopardy CTF",
    shortDesc: "Crack cryptographic ciphers, reverse engineer binaries, bypass web defenses, and conquer the live leaderboard.",
    fullDesc: "Step into the cyber battlefield. Participants face realistic cybersecurity challenges spanning Web Exploitation, Reverse Engineering, Cryptography, Forensics, and OSINT. Race against time as points dynamically adjust on the live big-screen scoreboard.",
    teamSize: "1 - 2 Members",
    venue: "Cyber Defense Arena / Hall B",
    time: "Day 01 · 12:00 PM (8 Hours)",
    rounds: [
      { title: "Phase 1: Recon & Web Exploitation", description: "Discover hidden endpoints, SQL injections, and auth bypasses.", duration: "2.5 Hours" },
      { title: "Phase 2: Reverse Engineering & Binary Exploits", description: "Disassemble ELF binaries, analyze heap overflows, and decrypt payloads.", duration: "3 Hours" },
      { title: "Phase 3: Final Matrix Siege", description: "Live king-of-the-hill attack/defense challenge for the top 5 finalists.", duration: "2.5 Hours" }
    ],
    rules: [
      "Attacking the scoring infrastructure or other teams' machines is strictly forbidden.",
      "Flag sharing or collusion between teams leads to immediate disqualification.",
      "All captured flags follow standard format: TECH15{...}.",
      "Brute-forcing challenge servers is prohibited unless explicitly stated."
    ],
    judgingCriteria: [
      "Total Valid Flags Captured (50%)",
      "Time of Flag Submission / Speed (30%)",
      "Clean Exploit Write-Up Verification (20%)"
    ],
    accentColor: "#ff4d4d",
    glowColor: "rgba(255, 77, 77, 0.4)",
    coordinators: [
      { name: "Shankilya", contact: "+91 9326214923" }
    ]
  },
  {
    id: "vanguard",
    slug: "vanguard",
    name: "Vanguard",
    mcuCodename: "Project Sentinel",
    tagline: "IR Laser Tag — Enter. Aim. Survive.",
    shortDesc: "A fast-paced team laser-tag battle where players use IR-based laser guns and receiver-equipped vests to eliminate the opposing team.",
    fullDesc: "Vanguard is a high-energy IR-based laser tag game where two teams of two players compete inside a designated battlefield. Each player is equipped with an electronic laser-tag gun and a receiver-equipped vest. Successful hits are registered by the electronic system and reduce the player's health until they are eliminated. The game ends when the allotted time expires or all players on one team are eliminated.",
    teamSize: "2 Members per Team",
    venue: "Designated Laser Tag Playing Area",
    time: "Event Day · Fixed Time Limit",
    rounds: [
      {
        title: "Phase 1: Briefing & Equipment Check",
        description: "Participants receive a short demonstration, game rules, safety instructions, and their laser-tag equipment. All guns and receiver-equipped vests are tested before gameplay.",
        duration: "Pre-Game"
      },
      {
        title: "Phase 2: Battlefield Deployment",
        description: "Two teams of two players enter the designated playing area and take their assigned positions before the referee gives the start signal.",
        duration: "Setup"
      },
      {
        title: "Phase 3: Vanguard Battle",
        description: "Players aim their IR-based laser-tag guns at opponents' receiver-equipped vests. Registered hits automatically reduce the opponent's health.",
        duration: "Fixed Time Limit"
      },
      {
        title: "Phase 4: Elimination & Scoring",
        description: "Players whose health reaches zero are eliminated. The game concludes when the time expires or all players of one team are eliminated, with the winner determined by the agreed scoring or elimination format.",
        duration: "Final Phase"
      }
    ],
    rules: [
      "Each team consists of 2 players.",
      "Players must use only the equipment provided by the organizers.",
      "Physical hitting, pushing, or intentionally obstructing opponents is not permitted.",
      "Players must not tamper with or remove their receiver-equipped vest during gameplay.",
      "Players must remain within the designated playing area.",
      "Only hits registered by the electronic system will be counted.",
      "A player whose health reaches zero will be eliminated.",
      "The game follows a fixed time limit decided by the organizers.",
      "Referee and volunteer decisions regarding gameplay are final."
    ],
    judgingCriteria: [
      "Opponent Eliminations",
      "Health/Score Remaining",
      "Registered Hits",
      "Final Team Score"
    ],
    accentColor: "#6f42c1",
    glowColor: "rgba(111, 66, 193, 0.4)",
    coordinators: [
      { name: "Premraj", contact: "+91 7900180771" }
    ]
  },
  {
    id: "final-incursion",
    slug: "final-incursion",
    name: "The Final Incursion",
    mcuCodename: "The Final Incursion",
    tagline: "Knowledge, Coordination, Strategy & The Ultimate Web Challenge",
    shortDesc: "A multi-stage team challenge combining rapid-fire knowledge, communication, clue solving, physical coordination, and a final web-trap showdown.",
    fullDesc: "The Final Incursion is a multi-stage team challenge where teams compete through rapid-fire questions and mini-games, a blind path mission, and a strategic treasure hunt before facing the ultimate Spider-Man-inspired Web Trap final. Teams must combine knowledge, communication, trust, problem-solving, physical coordination, and strategy to emerge as the final winner.",
    teamSize: "2 Members",
    venue: "Rooms 211, 202 / EXTC Lab / ECS Lab",
    time: "Day 01 · Final Game",
    rounds: [
      {
        title: "Stage 1: Rapid Fire & Mini Games",
        description: "Test knowledge, speed and quick decision-making through software-based rapid-fire quiz rounds followed by Paper and Ball Games.",
        duration: "15 Minutes"
      },
      {
        title: "Stage 2: Blind Path Mission",
        description: "One teammate navigates a marked path while blindfolded and the other guides them through the challenge using communication and coordination.",
        duration: "15 Minutes"
      },
      {
        title: "Stage 3: Treasure Hunt",
        description: "Solve a sequence of clues, communicate with your teammate, and navigate different locations to complete the hunt.",
        duration: "15 Minutes"
      },
      {
        title: "Stage 4: Spider-Man Web Trap",
        description: "The finalists enter the Web Trap and transport four Power Cores through the web without triggering penalties.",
        duration: "30–40 Minutes"
      }
    ],
    rules: [
      "Each team consists of exactly 2 participants.",
      "Stage 1 consists of Rapid Fire & Mini Games, Blind Path Mission, and Treasure Hunt.",
      "Points from all Stage 1 rounds are recorded cumulatively.",
      "During the Blind Path Mission, one participant is blindfolded while the teammate provides instructions.",
      "Treasure Hunt teams must follow the clue sequence provided by the coordinators.",
      "The phone/video-call mechanic may only be used as instructed by the coordinators.",
      "Only one player may enter the Web Trap zone at a time.",
      "Only one Power Core may be carried during each Web Trap attempt.",
      "Four Power Cores must be transported from the designated area to the team's base.",
      "Web touches are counted continuously throughout the team's attempt.",
      "1st, 4th and 7th web touch results in a 1-minute penalty to the team's time.",
      "2nd, 5th and 8th web touch results in a 2-minute penalty to the team's time.",
      "3rd, 6th and 9th web touch gives the opposing team a 1-minute penalty advantage; there is no elimination.",
      "After the 9th touch, the penalty cycle continues from the beginning.",
      "All starts, stops, penalties and scoring decisions are controlled by the judges/coordinators.",
      "All physical activities must be performed within the designated and supervised areas."
    ],
    judgingCriteria: [
      "Stage 1 Cumulative Performance",
      "Rapid Fire & Mini Games Score",
      "Blind Path Mission Performance",
      "Treasure Hunt Performance",
      "Stage 2 Web Trap Completion Time",
      "Web Touch Penalties",
      "Final Overall Score / Result as recorded on the official scoring sheet"
    ],
    accentColor: "#e62429",
    glowColor: "rgba(230, 36, 41, 0.4)",
    coordinators: [
      { name: "Purva", contact: "+91 9082677683" }
    ]
  }
];

export function findEventBySlug(value: string): EventDomain | undefined {
  const key = value.trim().toLowerCase();

  return DOMAINS.find(
    (event) =>
      event.id.toLowerCase() === key ||
      event.slug.toLowerCase() === key ||
      event.name.toLowerCase() === key
  );
}

export function getDefaultEvent(): EventDomain {
  return DOMAINS.find((event) => event.id === "squabble") ?? DOMAINS[0];
}

export function getEventRegistrationPath(value: EventDomain | string): string {
  const event = typeof value === "string" ? findEventBySlug(value) : value;
  const slug = event?.slug ?? (typeof value === "string" ? value.trim().toLowerCase() : "squabble");

  return `/register?event=${encodeURIComponent(slug)}`;
}

export function getEventDossierPath(value: EventDomain | string): string {
  const event = typeof value === "string" ? findEventBySlug(value) : value;
  const slug = event?.slug ?? (typeof value === "string" ? value.trim().toLowerCase() : "squabble");

  return `/events/${encodeURIComponent(slug)}`;
}

export type Track =
  | "General"
  | "Debate Competition"
  | "Quiz Competition"
  | "Gun Game"
  | "Squabble"
  | "Inquisitive"
  | "Eureka"
  | "Vanguard"
  | "National Symposium";

export interface ScheduleItem {
  time: string;
  title: string;
  detail: string;
  track: Track;
  venue: string;
  status?: "upcoming" | "live" | "completed";
}

export interface ScheduleDay {
  day: string;
  date: string;
  tagline: string;
  items: ScheduleItem[];
}

export const SCHEDULE: ScheduleDay[] = [
  {
    day: "Day 01",
    date: "October 16, 2026",
    tagline: "The Grand Opening — Debates, Quiz Arena & Tech Showcases",
    items: [
      { time: "08:30 AM", title: "Registrations & Kit Distribution", detail: "Badge collection, delegate kits, NFC wristbands & team check-in", track: "General", venue: "Central Registration Foyer", status: "upcoming" },
      { time: "10:00 AM", title: "Grand Inaugural Ceremony", detail: "Keynote addresses, lighting the lamp, and the official Level 15 kickoff", track: "General", venue: "Main Auditorium", status: "upcoming" },
      { time: "10:30 AM", title: "Debate Competition Prelims", detail: "Round 1 Lincoln-Douglas intellectual clashes on emerging tech frontiers", track: "Debate Competition", venue: "Main Seminar Hall", status: "upcoming" },
      { time: "11:30 AM", title: "Squabble Debate Kickoff", detail: "Motion reveal, team briefing, and round structure setup for the opening clash", track: "Squabble", venue: "Main Computing Hub", status: "upcoming" },
      { time: "02:00 PM", title: "Quiz Competition Screening & Prelims", detail: "Written grid qualifier & rapid-fire screening rounds", track: "Quiz Competition", venue: "Central Auditorium", status: "upcoming" },
      { time: "04:30 PM", title: "Debate Competition Semi-Finals", detail: "Cross-examination rounds and direct cross-questioning showdowns", track: "Debate Competition", venue: "Main Seminar Hall", status: "upcoming" },
      { time: "06:30 PM", title: "Quiz Competition Audio-Visual Finals", detail: "Live buzzer frenzy and multimedia clue battles on the main stage", track: "Quiz Competition", venue: "Central Auditorium", status: "upcoming" },
      { time: "08:00 PM", title: "Technology Frontiers Keynote & Networking", detail: "Fireside chat with industry leaders and evening developer mixer", track: "General", venue: "Open Air Quad", status: "upcoming" }
    ]
  },
  {
    day: "Day 02",
    date: "October 17, 2026",
    tagline: "The Championship — Gun Game LAN, Grand Finals & Trophy Ceremony",
    items: [
      { time: "09:30 AM", title: "National Technical Paper Symposium", detail: "Research presentations & innovative student project displays", track: "National Symposium", venue: "Exhibition Hall", status: "upcoming" },
      { time: "11:00 AM", title: "Gun Game Qualifier Heats", detail: "16-player free-for-all tactical LAN heats and bracket deciders", track: "Gun Game", venue: "E-Sports Gaming Lounge", status: "upcoming" },
      { time: "02:00 PM", title: "Debate Competition Grand Parliamentary Finale", detail: "Top finalists clash on an unannounced crisis motion for the trophy", track: "Debate Competition", venue: "Main Auditorium", status: "upcoming" },
      { time: "03:30 PM", title: "Gun Game Championship Showdown", detail: "Top 8 finalists in the ultimate weapon ladder tournament", track: "Gun Game", venue: "E-Sports Gaming Lounge", status: "upcoming" },
      { time: "06:00 PM", title: "Grand Awards Ceremony & After-Party", detail: "Distribution of trophies, cash prizes, certificates, and music night", track: "General", venue: "Grand Amphitheater", status: "upcoming" }
    ]
  }
];

export interface Sponsor {
  name: string;
  role: string;
  logoText: string;
  tagline: string;
  url?: string;
}

export interface SponsorTier {
  tier: string;
  codename: string;
  blurb: string;
  badge: string;
  sponsors: Sponsor[];
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    tier: "Title Sponsor",
    codename: "STARK INDUSTRIES TIER",
    blurb: "Presenting partner holding premier branding across every main stage, live stream, and digital touchpoint.",
    badge: "TITLE PARTNER",
    sponsors: [
      {
        name: "Stark Tech Global",
        role: "Presenting Partner",
        logoText: "STARK",
        tagline: "Powering Next-Gen Computational Paradigms"
      }
    ]
  },
  {
    tier: "Vibranium Tier (Gold)",
    codename: "WAKANDA DESIGN LABS",
    blurb: "Official track sponsors delivering exclusive hackathon problem statements, cloud credits, and recruitment access.",
    badge: "GOLD PARTNER",
    sponsors: [
      { name: "Quantum Cloud Networks", role: "Official Cloud Partner", logoText: "Q-CLOUD", tagline: "High-Performance Cloud Compute" },
      { name: "CyberMatrix Security", role: "CTF Track Partner", logoText: "CYBERMATRIX", tagline: "Defending Critical Digital Frontiers" },
      { name: "DevCore Labs", role: "AI & Innovation Partner", logoText: "DEVCORE", tagline: "Applied Artificial Intelligence" }
    ]
  },
  {
    tier: "Pym Tech Tier (Silver)",
    codename: "PYM ADVANCED TECH",
    blurb: "Hardware, developer tooling, and platform ecosystem partners powering event infrastructure.",
    badge: "SILVER PARTNER",
    sponsors: [
      { name: "RoboDynamics", role: "Hardware Partner", logoText: "ROBODYN", tagline: "Precision Robotics & Motors" },
      { name: "PixelForge Studio", role: "Creative Media Partner", logoText: "PIXELFORGE", tagline: "Modern UI/UX Systems" },
      { name: "CodeStream CLI", role: "Tooling Partner", logoText: "CODESTREAM", tagline: "Instant Cloud IDE & Dev Environments" },
      { name: "HyperSpeed Gaming", role: "Gaming Hardware Partner", logoText: "HYPERSPEED", tagline: "Ultra High Refresh Displays" }
    ]
  },
  {
    tier: "Community & Media Partners",
    codename: "MULTIVERSE NETWORK",
    blurb: "Student developer clubs, open-source organizations, and technical media publications.",
    badge: "ECOSYSTEM",
    sponsors: [
      { name: "IEEE Computer Society", role: "Technical Chapter", logoText: "IEEE CS", tagline: "Advancing Technology for Humanity" },
      { name: "DevFolio Community", role: "Platform Partner", logoText: "DEVFOLIO", tagline: "Powering India's Top Hackathons" },
      { name: "GeeksForGeeks Campus", role: "Education Partner", logoText: "GFG", tagline: "A Computer Science Portal" },
      { name: "Campus Times Media", role: "Media Partner", logoText: "CAMPUS TIMES", tagline: "Connecting University Talent" }
    ]
  }
];

export interface TeamMember {
  name: string;
  role: string;
  detail: string;
  mcuTitle: string;
  initials: string;
  photo?: string;
  council?: "Senior" | "Junior" | string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface TeamGroup {
  dept: string;
  blurb: string;
  members: TeamMember[];
}

const JUNIOR_COUNCIL_ORDER = [
  "Joint Secretary",
  "Operational Lead",
  "MDO",
  "WiE Head",
  "CS Head",
  "MTT-S Head",
  "Technical Head",
  "Media Head",
  "Design Head",
  "Creative Head",
  "Publicity Head",
  "PR & Admin Head",
  "PR Head",
];

export function sortTeamMembersForCouncil(
  members: TeamMember[],
  council: "Senior" | "Junior",
) {
  if (council !== "Junior") return members;

  return members
    .map((member, index) => ({
      member,
      index,
      order: JUNIOR_COUNCIL_ORDER.indexOf(member.role),
    }))
    .sort((a, b) => {
      const aOrder = a.order === -1 ? JUNIOR_COUNCIL_ORDER.length : a.order;
      const bOrder = b.order === -1 ? JUNIOR_COUNCIL_ORDER.length : b.order;
      return aOrder - bOrder || a.index - b.index;
    })
    .map(({ member }) => member);
}

export const TEAM: TeamGroup[] = [
  {
    dept: "Leadership",
    blurb: "The leadership council steering IEEE SIESGST through vision, administration, and strategic direction.",
    members: [
      { name: "Prathmesh Palve", role: "Chairperson", detail: "Chairperson", mcuTitle: "Chairperson", initials: "PP", council: "Senior", linkedin: "https://www.linkedin.com/in/prathmesh-palve-7565822b7" },
      { name: "Abhang Rane", role: "Vice Chairperson", detail: "Vice Chairperson", mcuTitle: "Vice Chairperson", initials: "AR", council: "Senior", linkedin: "https://www.linkedin.com/in/abhang-rane-414a24344" },
      { name: "Mukul Wani", role: "Secretary", detail: "Secretary", mcuTitle: "Secretary", initials: "MW", council: "Senior", linkedin: "https://www.linkedin.com/in/mukul-wani-1a2ba82b7" },
      { name: "Aditi Dhanawade", role: "Treasurer", detail: "Treasurer", mcuTitle: "Treasurer", initials: "AD", council: "Senior", linkedin: "https://www.linkedin.com/in/aditi-dhanawade-0675812b7" },
      { name: "Prathamesh Bhagwat", role: "MDO", detail: "MDO", mcuTitle: "MDO", initials: "PB", council: "Junior", linkedin: "https://www.linkedin.com/in/prathamesh-bhagwat-191409298" },
      { name: "Ayush Bhadane", role: "Joint Secretary", detail: "Joint Secretary", mcuTitle: "Joint Secretary", initials: "AB", council: "Junior", linkedin: "https://www.linkedin.com/in/ayush-bhadane-b38a71353" },
      { name: "Vaishnavi Iyer", role: "Joint Secretary", detail: "Joint Secretary", mcuTitle: "Joint Secretary", initials: "VI", council: "Junior", linkedin: "https://www.linkedin.com/in/vaishnavi-iyer-503460350" }
    ]
  },
  {
    dept: "Technical",
    blurb: "The technical team driving IEEE SIESGST technology initiatives and development.",
    members: [
      { name: "Janmanjay Verma", role: "Tech Mentor", detail: "Tech Mentor", mcuTitle: "Tech Mentor", initials: "JV", council: "Senior", linkedin: "https://www.linkedin.com/in/janmanjay-verma-64585927b" },
      { name: "Chirayu Marathe", role: "Tech Mentor", detail: "Tech Mentor", mcuTitle: "Tech Mentor", initials: "CM", council: "Senior", linkedin: "https://www.linkedin.com/in/chirayu-marathe69/" },
      { name: "Aditya Sharma", role: "Tech Mentor", detail: "Tech Mentor", mcuTitle: "Tech Mentor", initials: "AS", council: "Senior", linkedin: "https://www.linkedin.com/in/aditya-sharma-3625732a8" },
      { name: "Dakshata Dalvi", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "DD", council: "Junior", linkedin: "https://www.linkedin.com/in/dakshata-dalvi-475864344" },
      { name: "Arya Muthukrishnan", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "AM", council: "Junior", linkedin: "https://www.linkedin.com/in/arya-muthukrishnan-pandaram-a2264430a" },
      { name: "Nanmathi Balachandran", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "NB", council: "Junior", linkedin: "https://www.linkedin.com/in/nanmathi-balachandran-11038b32b/" },
      { name: "Siddharth Patil", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "SP", council: "Junior", linkedin: "https://www.linkedin.com/in/siddharth-patil-763635426/" },
      { name: "Akilesh K", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "AK", council: "Junior", linkedin: "https://www.linkedin.com/in/akilesh-kalyanakumar-7901b9255" },
      { name: "Anoushka Rajesh", role: "Technical Head", detail: "Technical Head", mcuTitle: "Technical Head", initials: "AR", council: "Junior", linkedin: "https://www.linkedin.com/in/anoushka-rajesh-181a85422" }
    ]
  },
  {
    dept: "CS",
    blurb: "The Computer Society team supporting technical communities and initiatives.",
    members: [
      { name: "Gaurav Patil", role: "CS Representative", detail: "CS Representative", mcuTitle: "CS Representative", initials: "GP", council: "Senior", linkedin: "https://www.linkedin.com/in/gauravpatil2515" },
      { name: "Atharva Matale", role: "CS Head", detail: "CS Head", mcuTitle: "CS Head", initials: "AM", council: "Junior", linkedin: "https://www.linkedin.com/in/atharvamatale/" }
    ]
  },
  {
    dept: "MTT-S",
    blurb: "The MTT-S team supporting microwave, RF, and emerging technology initiatives.",
    members: [
      { name: "Payal Wagh", role: "MTT-S Representative", detail: "MTT-S Representative", mcuTitle: "MTT-S Representative", initials: "PW", council: "Senior", linkedin: "https://www.linkedin.com/in/payal-wagh-4395842b7" },
      { name: "Siddhesh Murkute", role: "MTT-S Head", detail: "MTT-S Head", mcuTitle: "MTT-S Head", initials: "SM", council: "Junior", linkedin: "https://www.linkedin.com/in/siddhesh-murkute-9025332a4" }
    ]
  },
  {
    dept: "Design",
    blurb: "The design team shaping the visual identity and creative direction.",
    members: [
      { name: "Divya Hindurao", role: "Design Mentor", detail: "Design Mentor", mcuTitle: "Design Mentor", initials: "DH", council: "Senior", linkedin: "https://www.linkedin.com/in/divya-hindurao-895a992a7" },
      { name: "Antara Kadam", role: "Design Head", detail: "Design Head", mcuTitle: "Design Head", initials: "AK", council: "Junior", linkedin: "https://www.linkedin.com/in/antarakadam2006/" },
      { name: "Trushna Mhatre", role: "Design Head", detail: "Design Head", mcuTitle: "Design Head", initials: "TM", council: "Junior", linkedin: "https://www.linkedin.com/in/trushna-mhatre-88930b354" },
      { name: "Riya Parab", role: "Creative Head", detail: "Creative Head", mcuTitle: "Creative Head", initials: "RP", council: "Junior", linkedin: "https://www.linkedin.com/in/riya-parab-bb712333" }
    ]
  },
  {
    dept: "Media",
    blurb: "The media team managing communications, storytelling, and event coverage.",
    members: [
      { name: "Varun Ubable", role: "Media Mentor", detail: "Media Mentor", mcuTitle: "Media Mentor", initials: "VU", council: "Senior", linkedin: "https://www.linkedin.com/in/varun-ubale" },
      { name: "Kaustubh Bhoir", role: "Media Head", detail: "Media Head", mcuTitle: "Media Head", initials: "KB", council: "Junior", linkedin: "https://www.linkedin.com/in/kaustubh-bhoir-7b5220380" },
      { name: "Karthik Kabadi", role: "Media Head", detail: "Media Head", mcuTitle: "Media Head", initials: "KK", council: "Junior", linkedin: "https://www.linkedin.com/in/karthik-kabadi-6a911a330" }
    ]
  },
  {
    dept: "Operations",
    blurb: "The operations team coordinating logistics and smooth execution.",
    members: [
      { name: "Taazeen Ansari", role: "Operational Lead", detail: "Operational Lead", mcuTitle: "Operational Lead", initials: "TA", council: "Junior", linkedin: "https://linkedin.com/in/taazeenansari" }
    ]
  },
  {
    dept: "WiE",
    blurb: "The Women in Engineering team encouraging participation and technical engagement.",
    members: [
      { name: "Nidhi Hegde", role: "WiE Representative", detail: "WiE Representative", mcuTitle: "WiE Representative", initials: "NH", council: "Senior", linkedin: "https://www.linkedin.com/in/nidhi-hegde-0a35822b7" },
      { name: "Madhu Gowda", role: "WiE Head", detail: "WiE Head", mcuTitle: "WiE Head", initials: "MG", council: "Junior", linkedin: "https://www.linkedin.com/in/madhu-gowda-561307395" }
    ]
  },
  {
    dept: "Publicity",
    blurb: "The publicity team expanding IEEE SIESGST's reach and community presence.",
    members: [
      { name: "Devanand Bhosale", role: "Publicity Mentor", detail: "Publicity Mentor", mcuTitle: "Publicity Mentor", initials: "DB", council: "Senior", linkedin: "https://www.linkedin.com/in/devanand-bhosale-7405822b7" },
      { name: "Aarya Yewale", role: "Publicity Head", detail: "Publicity Head", mcuTitle: "Publicity Head", initials: "AY", council: "Junior", linkedin: "https://www.linkedin.com/in/aarya-yewale-047032356" }
    ]
  },
  {
    dept: "PR & Admin",
    blurb: "The PR and administration team managing communication and organizational coordination.",
    members: [
      { name: "Sudeepto Ghosh", role: "PR & Admin Mentor", detail: "PR & Admin Mentor", mcuTitle: "PR & Admin Mentor", initials: "SG", council: "Senior", linkedin: "https://www.linkedin.com/in/sudeeptoghosh10" },
      { name: "Neeraj Dalvi", role: "PR & Admin Head", detail: "PR & Admin Head", mcuTitle: "PR & Admin Head", initials: "ND", council: "Junior" },
      { name: "Ashwin L", role: "PR Head", detail: "PR Head", mcuTitle: "PR Head", initials: "AL", council: "Junior", linkedin: "https://www.linkedin.com/in/ashwin-lakshminarasimman-4b3512412" }
    ]
  }
];

export const EVENT_STATS = [
  { value: "04", label: "Heroic Domains" }
];

/** Single source of truth for "when/where" copy reused across hero intros and the footer. */
export const EVENT_INFO = {
  dates: "October 16–17, 2026",
  duration: "2 Days · 48 Hours",
  org: "IEEE SIESGST Student Branch",
  contactEmail: "hello@techopedia15.com",
  sponsorEmail: "sponsorships@techopedia15.com",
} as const;
