# ⚡ TECHOPEDIA LEVEL 15 — The Multiverse of Tech (Marvel MCU Edition)

> **Annual National Technical Symposium** organized by **IEEE Student Branch**  
> An Awwwards-grade, 3D WebGL scroll-driven cinematic web application powered by **Next.js 16 (App Router, Turbopack)**, **Three.js / React Three Fiber**, **GSAP ScrollTrigger**, and the **Official Marvel MCU Red, Crimson & Stark Gold theme**.

---

## ✦ Highlights

- 🔴 **Official Marvel MCU Aesthetic**: Marvel Studios Heroic Red (`#ED1D24`), Deep Crimson (`#B31016`), Stark Gold (`#FFD700`), Arc Reactor Cyan (`#00E5FF`), and Obsidian Carbon.
- 🔤 **Authentic Avengeance Typography**: Beveled metallic headers in *Avengeance Heroic Avenger* font with dynamic crimson glow and telemetry subtitles.
- 🌌 **3D Multiverse WebGL Atmosphere**: Volumetric crimson fog, rising Stark Arc embers, procedural lightning strikes, and a faded Marvel Multiverse cosmic backdrop.
- 🛸 **Fast-Jump Sci-Fi HUD Deck (`HudNavDock`)**: Instant telemetry navigation bar with real-time scroll tracking percentage and one-click teleport to key sections.
- 🎮 **Mini-Games Arcade Hub**:
  - **Bug Blitz**: Rapid-fire 60-second code bug diagnosis game with live scoring.
  - **Tesseract Memory Matrix**: 3x3 quantum sequence recall game with sound synthesis.
  - **CTF Terminal**: Live interactive hacker console with CTF challenge flags.
- 📜 **Complete Event Architecture**: 6 technical competition domains (Code Conquest, Cyber Realm & CTF, Robo Blitz, Pixel Craft, Paper & Project Expo, E-Sports Arena), 2-day filterable schedule, organizing committee gallery, and interactive sponsorship pedestals.
- 🔊 **Zero-Dependency Web Audio API Sound Engine**: Real-time synthesized HUD pips, ascending victory chords, and matrix notes.
- 🛡️ **Instant Digital Pass Generator**: Interactive registration modal with real-time pass rendering, ticket ID generation, and copy-to-clipboard access.

---

## ✦ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16 (Turbopack)** | React Framework, Static Generation & App Router |
| **React 19 & TypeScript 5** | UI Component Architecture with Strict Types |
| **Three.js & React Three Fiber** | 3D WebGL Canvas, Volumetric Fog Shaders & Particle Fields |
| **GSAP & ScrollTrigger** | High-performance frame-by-frame scrub orchestration |
| **Lenis** | Smooth inertial kinetic scrolling |
| **Framer Motion** | Spring physics modals, tabs, and filter chip transitions |
| **Web Audio API** | Real-time browser audio synthesis |

---

## ✦ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open in browser
http://localhost:3000

# 4. Create optimized production build
npm run build

# 5. Start production server
npm run start
```

---

## ✦ Project Structure

```
Techopedia/
├── app/
│   ├── layout.tsx              # Root HTML, fonts (Avengeance, Bebas, Anton, Chakra), SEO metadata
│   ├── page.tsx                # Main Landing Experience
│   ├── globals.css             # Marvel MCU design tokens, metallic text gradients & stage lighting
│   ├── not-found.tsx           # Custom Marvel Multiverse 404 screen
│   ├── schedule/               # Filterable 2-Day Symposium Agenda
│   ├── team/                   # Departmental Organizing Committee Gallery
│   └── sponsors/               # Tiered Partner Pedestals & Stat Metrics
├── components/
│   ├── Experience.tsx          # Master Timeline Director (GSAP + ScrollTrigger)
│   ├── webgl/                  # Three.js Canvas, Volumetric Fog, Lightning, Particles, Portal
│   ├── overlays/               # Domain Cards Orbit, Story Stack, Horizontal Reel, Event Dossier
│   ├── games/                  # Arcade Hub, Bug Blitz, Tesseract Memory Matrix
│   └── ui/                     # SiteHeader, HudNavDock, RegistrationModal, TerminalModal, PageShell
├── lib/
│   ├── eventData.ts            # Master Event Domains, Schedule Items, Team & Sponsor Data
│   ├── audio.ts                # Web Audio API Sound Synthesis Engine
│   ├── signals.ts              # Zero-re-render per-frame state singleton
│   └── constants.ts            # Timing constants, video paths & color definitions
└── public/
    ├── fonts/                  # Avengeance Heroic Avenger TrueType font files
    ├── videos/                 # Scrubbed cinematic video footage
    └── marvel-bg.jpg           # Faded high-res Marvel Universe cosmic backdrop
```

---

## ✦ GitHub Push Setup

To connect and push this repository to your remote GitHub repository:

```bash
git remote set-url origin https://github.com/IEEE-TECH/Techopedia-15-website-Marvel-MCU.git
git add .
git commit -m "feat: complete Techopedia 15 Marvel MCU Red & Gold edition overhaul"
git branch -M main
git push -u origin main
```

---

*Organized with ❤️ by IEEE Student Branch for Techopedia Level 15.*
