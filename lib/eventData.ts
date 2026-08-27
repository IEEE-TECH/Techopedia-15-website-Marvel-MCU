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
  prizePool: string;
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
    tagline: "Algorithmic Battlegrounds & 24-Hour Hackathon",
    shortDesc: "Compete in intense speed-coding rounds and build game-changing full-stack AI applications under 24 hours.",
    fullDesc: "Code Conquest is Techopedia's flagship hackathon & algorithmic showdown. Teams tackle real-world problem statements spanning AI/ML, Cloud Infrastructures, Web3, and Open Innovation. Features dedicated industry mentors, midnight code sprints, and direct investor evaluations.",
    prizePool: "₹50,000+",
    teamSize: "1 - 4 Members",
    venue: "Main Computing Hub / Lab Alpha",
    time: "Day 01 · 11:30 AM (24 Hours)",
    rounds: [
      { title: "Round 1: Rapid Algorithmic Duel", description: "60-minute intense competitive coding round testing DSA and optimization.", duration: "1 Hour" },
      { title: "Round 2: Problem Statement Drop", description: "Teams choose domain tracks and begin architectural development.", duration: "12 Hours" },
      { title: "Round 3: Midnight Pitch & Prototype Demo", description: "Mid-way mentor check-in and code review.", duration: "2 Hours" },
      { title: "Round 4: Grand Finale Presentations", description: "Top 8 teams pitch functional prototypes to industry judges.", duration: "3 Hours" }
    ],
    rules: [
      "All code must be written during the hackathon period. Pre-built templates must be declared.",
      "Open-source libraries and public APIs are permitted with proper attribution.",
      "Git repositories will be audited for commit frequency and authenticity.",
      "Decisions of the jury and technical coordinators will be final."
    ],
    judgingCriteria: [
      "Innovation & Technical Complexity (30%)",
      "Functionality & Code Quality (25%)",
      "UI/UX & User Experience (20%)",
      "Real-World Impact & Feasibility (25%)"
    ],
    accentColor: "#ed1d24",
    glowColor: "rgba(237, 29, 36, 0.4)",
    coordinators: [
      { name: "Rohan Mehta", contact: "+91 98765 43210" },
      { name: "Ishaan Verma", contact: "+91 98765 43211" }
    ]
  },
  {
    id: "eureka",
    slug: "blackpanther",
    name: "Eureka",
    mcuCodename: "Wakanda Firewall Siege",
    tagline: "Offensive Security, Cryptography & Live Jeopardy CTF",
    shortDesc: "Crack cryptographic ciphers, reverse engineer binaries, bypass web defenses, and conquer the live leaderboard.",
    fullDesc: "Step into the cyber battlefield. Participants face realistic cybersecurity challenges spanning Web Exploitation, Reverse Engineering, Cryptography, Forensics, and OSINT. Race against time as points dynamically adjust on the live big-screen scoreboard.",
    prizePool: "₹35,000+",
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
      { name: "Kavya Nair", contact: "+91 98765 43212" },
      { name: "Arjun Reddy", contact: "+91 98765 43213" }
    ]
  },
  {
    id: "inquisitve",
    slug: "cyclops",
    name: "Inquisitve",
    mcuCodename: "Stark Industries Bot Wars",
    tagline: "Combat Robotics, Autonomous Line Followers & Drone Arena",
    shortDesc: "Pit customized combat robots in the steel cage, test autonomous line-followers, and pilot drones through obstacle mazes.",
    fullDesc: "The ultimate physical engineering colosseum. High-torque motors, custom PCBs, weapon mechanisms, and precision autonomous navigation collide in a multi-round tournament. Witness sparks fly in the reinforced battle cage!",
    prizePool: "₹40,000+",
    teamSize: "2 - 4 Members",
    venue: "Outdoor Tech Amphitheater / Robo Cage",
    time: "Day 01 & Day 02 · 02:00 PM",
    rounds: [
      { title: "Stage 1: Autonomous Speed Run", description: "Line follower and grid navigator speed trials.", duration: "2 Hours" },
      { title: "Stage 2: Drone Obstacle Course", description: "FPV drone time-attack obstacle navigation.", duration: "2 Hours" },
      { title: "Stage 3: Robo-Wars Steel Cage Deathmatch", description: "1v1 combat robot knockouts in the enclosed arena.", duration: "3 Hours" }
    ],
    rules: [
      "Robots must comply with weight class specifications (Max 15kg for combat bots).",
      "Wireless controllers must operate on 2.4GHz with fail-safe cutoff.",
      "Liquid projectiles, electrical tasers, or toxic smoke weapons are prohibited.",
      "Safety goggles must be worn in the pit area at all times."
    ],
    judgingCriteria: [
      "Combat Damage & Aggression Points (40%)",
      "Autonomous Course Time & Accuracy (30%)",
      "Mechanical & Electrical Engineering Design (30%)"
    ],
    accentColor: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.4)",
    coordinators: [
      { name: "Aditya Joshi", contact: "+91 98765 43214" },
      { name: "Kabir Singh", contact: "+91 98765 43215" }
    ]
  },
  {
    id: "laser-tag",
    slug: "mystique",
    name: "laser tag",
    mcuCodename: "Quantum Reality UI/UX",
    tagline: "Futuristic Design Sprints & Interactive 3D Web Dev",
    shortDesc: "Design breathtaking interfaces, craft micro-animations, and code interactive 3D WebGL experiences from scratch.",
    fullDesc: "Where art meets deep engineering. Designers and frontend architects are tasked with solving complex user-journey problems, prototyping futuristic design systems in Figma, and coding live interactive web experiences using modern frameworks and Three.js.",
    prizePool: "₹25,000+",
    teamSize: "1 - 2 Members",
    venue: "Design & Media Lab 3",
    time: "Day 01 · 04:00 PM (4 Hours)",
    rounds: [
      { title: "Sprint 1: UI/UX Rapid Prototyping", description: "Design a futuristic spatial OS or tech interface in Figma.", duration: "2 Hours" },
      { title: "Sprint 2: Code Implementation", description: "Bring the design alive using HTML/CSS/JS/React with motion.", duration: "2 Hours" }
    ],
    rules: [
      "Design systems must be created from scratch during the sprint.",
      "Accessibility (WCAG) and responsive mobile layouts are required.",
      "Code must run cleanly with zero console errors."
    ],
    judgingCriteria: [
      "Visual Aesthetics & Creativity (35%)",
      "Interaction Design & Micro-animations (30%)",
      "Code Quality & Performance (35%)"
    ],
    accentColor: "#00e5ff",
    glowColor: "rgba(0, 229, 255, 0.4)",
    coordinators: [
      { name: "Ananya Iyer", contact: "+91 98765 43216" },
      { name: "Vihaan Rao", contact: "+91 98765 43217" }
    ]
  },
];

export type Track =
  | "General"
  | "Code Conquest"
  | "Cyber Realm & CTF"
  | "Robo Blitz"
  | "Pixel Craft"
  | "Paper & Project Expo"
  | "E-Sports Arena";

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
    tagline: "The Multiverse Awakens — Hackathon, CTF & Robot Arenas",
    items: [
      { time: "08:30 AM", title: "Registrations & Kit Distribution", detail: "Badge collection, delegate kits, NFC wristbands & team check-in", track: "General", venue: "Central Registration Foyer", status: "upcoming" },
      { time: "10:00 AM", title: "Grand Inaugural Ceremony", detail: "Keynote addresses, lighting the lamp, and the official Level 15 trailer unlock", track: "General", venue: "Main Auditorium", status: "upcoming" },
      { time: "11:30 AM", title: "Code Conquest 24-Hr Hackathon Kickoff", detail: "Problem statement drop, repository creation, and mentor briefings", track: "Code Conquest", venue: "Lab Alpha & Beta", status: "upcoming" },
      { time: "12:00 PM", title: "Cyber Realm CTF Gates Open", detail: "Jeopardy-style offensive security challenges go live on the main scoreboard", track: "Cyber Realm & CTF", venue: "Cyber Arena B", status: "upcoming" },
      { time: "02:00 PM", title: "Robo Blitz Prelims & Speed Trials", detail: "Autonomous line followers and bot deathmatch qualifier heats", track: "Robo Blitz", venue: "Robotics Amphitheater", status: "upcoming" },
      { time: "04:00 PM", title: "Pixel Craft UI/UX Design Sprint", detail: "Futuristic interface design jam and 3D web experience coding", track: "Pixel Craft", venue: "Design Center", status: "upcoming" },
      { time: "07:30 PM", title: "AI & Quantum Frontiers Keynote", detail: "Special fireside chat with leading AI researchers and tech industry veterans", track: "General", venue: "Main Auditorium", status: "upcoming" },
      { time: "11:00 PM", title: "Midnight Coding Break & Energy Fuel", detail: "Snacks, Red Bull station, developer trivia, and acoustic jam session", track: "General", venue: "Open Air Quad", status: "upcoming" }
    ]
  },
  {
    day: "Day 02",
    date: "October 17, 2026",
    tagline: "The Climax — Project Expos, Grand Finals & Trophy Ceremony",
    items: [
      { time: "08:00 AM", title: "Hackathon Overnight Checkpoint", detail: "Progress audit, mentor ratings, and breakfast fuel-up", track: "Code Conquest", venue: "Lab Alpha", status: "upcoming" },
      { time: "10:00 AM", title: "Robo Blitz Championship Steel Cage", detail: "Heavyweight combat bot finals and drone obstacle race", track: "Robo Blitz", venue: "Robotics Arena", status: "upcoming" },
      { time: "11:30 AM", title: "CTF Finals & Flag Verification", detail: "King-of-the-Hill attack defense rounds and exploit reviews", track: "Cyber Realm & CTF", venue: "Cyber Arena B", status: "upcoming" },
      { time: "01:30 PM", title: "Code Conquest Freeze & Submissions", detail: "Code repositories lock, live prototype demo evaluations begin", track: "Code Conquest", venue: "Main Auditorium", status: "upcoming" },
      { time: "02:30 PM", title: "National Paper & Project Expo", detail: "Research paper presentations & hardware invention exhibition", track: "Paper & Project Expo", venue: "Exhibition Hall", status: "upcoming" },
      { time: "04:00 PM", title: "E-Sports Arena Grand Finals", detail: "Valorant & BGMI tournament championship bracket deciders", track: "E-Sports Arena", venue: "E-Sports Lounge", status: "upcoming" },
      { time: "06:30 PM", title: "Grand Awards Ceremony & After-Party", detail: "Distribution of ₹2,00,000+ prize pool, trophies, certificates, and DJ night", track: "General", venue: "Grand Amphitheater", status: "upcoming" }
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
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface TeamGroup {
  dept: string;
  blurb: string;
  members: TeamMember[];
}

export const TEAM: TeamGroup[] = [
  {
    dept: "Core Leadership",
    blurb: "The prime command steering Techopedia Level 15 from vision to flawless execution.",
    members: [
      { name: "Dr. K. Sharma", role: "Faculty Sponsor", detail: "IEEE Student Branch Mentor & HOD", mcuTitle: "Director of S.H.I.E.L.D.", initials: "KS", linkedin: "https://linkedin.com" },
      { name: "Aarav Sharma", role: "President & Lead Organizer", detail: "Overall Festival Director", mcuTitle: "Captain America", initials: "AS", linkedin: "https://linkedin.com", github: "https://github.com" },
      { name: "Diya Patel", role: "Vice President", detail: "Operations & Strategic Alliances", mcuTitle: "Rescue", initials: "DP", linkedin: "https://linkedin.com" }
    ]
  },
  {
    dept: "Technical & Web Arch",
    blurb: "Architecting the 3D WebGL portal, CTF infrastructure, judge consoles, and live scoreboard.",
    members: [
      { name: "Rohan Mehta", role: "Technical Head", detail: "Lead WebGL & Architecture", mcuTitle: "Iron Man", initials: "RM", linkedin: "https://linkedin.com", github: "https://github.com" },
      { name: "Ishaan Verma", role: "Full-Stack Engineer", detail: "Frontend & 3D Shaders", mcuTitle: "Doctor Strange", initials: "IV", linkedin: "https://linkedin.com", github: "https://github.com" },
      { name: "Kavya Nair", role: "Cybersecurity Lead", detail: "CTF Challenges & Backend", mcuTitle: "Black Widow", initials: "KN", linkedin: "https://linkedin.com", github: "https://github.com" }
    ]
  },
  {
    dept: "Design & Media",
    blurb: "Crafting every cinematic visual, teaser trailer, motion poster, and holographic asset.",
    members: [
      { name: "Ananya Iyer", role: "Design Director", detail: "Brand Identity & 3D UI", mcuTitle: "Scarlet Witch", initials: "AI", instagram: "https://instagram.com" },
      { name: "Vihaan Rao", role: "Motion & Video Producer", detail: "Cinematic Trailers & Reels", mcuTitle: "Vision", initials: "VR", instagram: "https://instagram.com" },
      { name: "Myra Kapoor", role: "Creative Producer", detail: "Visual Arts & Photography", mcuTitle: "Wasp", initials: "MK", instagram: "https://instagram.com" }
    ]
  },
  {
    dept: "Operations & Logistics",
    blurb: "Managing 1500+ participants, arena staging, hardware pits, and 48 hours of uninterrupted flow.",
    members: [
      { name: "Aditya Joshi", role: "Head of Operations", detail: "Arena Management & Pits", mcuTitle: "Thor", initials: "AJ", linkedin: "https://linkedin.com" },
      { name: "Sara Khan", role: "Hospitality & Judges", detail: "VIP Delegates & Logistics", mcuTitle: "Gamora", initials: "SK", linkedin: "https://linkedin.com" },
      { name: "Kabir Singh", role: "Hardware Logistics", detail: "Robotics Arena & Power Grid", mcuTitle: "War Machine", initials: "KS", linkedin: "https://linkedin.com" }
    ]
  },
  {
    dept: "PR, Sponsorship & Media",
    blurb: "Propelling Techopedia across 100+ universities and locking in global technology sponsors.",
    members: [
      { name: "Zara Ahmed", role: "Head of PR & Outreach", detail: "Campus Ambassador Network", mcuTitle: "Shuri", initials: "ZA", linkedin: "https://linkedin.com" },
      { name: "Arjun Reddy", role: "Sponsorship Lead", detail: "Corporate & Tech Partnerships", mcuTitle: "Hawkeye", initials: "AR", linkedin: "https://linkedin.com" },
      { name: "Naina Gupta", role: "Social & Digital Growth", detail: "Community & Campaigns", mcuTitle: "Mantis", initials: "NG", instagram: "https://instagram.com" }
    ]
  }
];

export const EVENT_STATS = [
  { value: "₹2.5L+", label: "Prize Pool" },
  { value: "1500+", label: "Participants" },
  { value: "04", label: "Heroic Domains" },
  { value: "48hrs", label: "Non-Stop Action" }
];
