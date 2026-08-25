/**
 * AVENGERS: DOOMSDAY — global design + timing constants.
 *
 * The experience is entirely SCROLL-DRIVEN. Nothing auto-plays: scroll position
 * scrubs both trailers frame-by-frame and drives every cinematic event through
 * a single scrubbed GSAP/ScrollTrigger master. Tuning lives here.
 */

/** Cinematic palette — Marvel MCU Red, Crimson, Stark Gold, Arc Cyan. */
export const COLORS = {
  black: "#000000",
  graphite: "#0b0d11",
  ink: "#12141a",
  green: "#ed1d24",
  greenDeep: "#b31016",
  greenDark: "#3a0507",
  emerald: "#8b0000",
  mint: "#ffd700",
  core: "#ffffff",
  white: "#ffffff",
  silver: "#cbd5e1",
  gold: "#ffd700",
  cyan: "#00e5ff",
} as const;

export const HEX = {
  green: 0xed1d24,
  greenDeep: 0xb31016,
  greenDark: 0x3a0507,
  emerald: 0x8b0000,
  mint: 0xffd700,
  core: 0xffffff,
  gold: 0xffd700,
  cyan: 0x00e5ff,
} as const;

/** Asset locations (served from /public). Videos are all-intra for scrubbing. */
export const ASSETS = {
  marvelVideo: "/videos/marvel-intro-seq.mp4",
  marvelPoster: "/videos/marvel-intro-poster.jpg",
  // New user-uploaded Hero trailer (landscape ~2.39:1) — fills with object-fit:cover.
  heroVideo: "/videos/hero-seq-v2.mp4",
  heroPoster: "/videos/hero-poster-v2.jpg",
  // Section 5 ending (Thor → Doom → Captain America) — scroll-scrubbed, all-intra.
  // Swap this one file to update the ending; nothing else needs to change.
  finaleVideo: "/videos/finale-seq.mp4",
  finalePoster: "/videos/finale-poster.jpg",
  // Section 6 — the MCU timeline artwork (tall; scroll-panned).
  timelineImg: "/story/timeline.jpg",
  // Section 7 — the AVENGERS DOOMSDAY title reveal (autoplay + loop).
  titleVideo: "/videos/title-reveal.mp4",
  titlePoster: "/videos/title-reveal-poster.jpg",
} as const;

/** Approx durations (s); refined from real metadata at runtime. */
export const VIDEO = {
  marvelDur: 5.35,
  heroDur: 10.67,
  finaleDur: 23.9,
} as const;

/**
 * Scroll section heights (in vh) — the total scroll distance the scrub spans.
 * Bigger = more scroll per second of footage = a more deliberate, frame-by-
 * frame feel.
 */
export const SCROLL = {
  introAtmos: 140, // Section 1 — the void + storm builds
  marvelScrub: 240, // Section 1 — Marvel intro scrubs
  transition: 140, // continuous portal dive into the Hero
  heroText: 260, // Hero — cinematic text sequence (video hidden)
  heroScrub: 340, // Hero — Doom video appears fullscreen + scrubs
  heroOutro: 80, // Hero settle
  // ── Phase 2 · Section 2 (character showcase) ──
  showcaseRise: 160, // Hero fades / Section 2 rises from the bottom, model appears
  showcaseOrbit: 360, // the 6 cards orbit the model, active card cycles to front
  showcaseOut: 70, // settle
  // ── Phase 3 · Section 3 (cinematic story stack) ──
  storyStack: 660, // 6 fullscreen panels rise + stack sequentially (pinned)
  // ── Phase 4 · Section 4 (horizontal cinematic timeline) ──
  reelStrip: 680, // pinned; vertical scroll drives the strip right→left
  // ── Ending · Outro ──
  // A short settle on the reel's last frame before the page scrolls on into the
  // in-flow Team / Sponsors / footer content. (Was 150vh back when the footer
  // was a fixed overlay that needed a reveal runway here.)
  footerReveal: 60,
} as const;

/**
 * Total scroll distance (vh) and the equivalent master-timeline length in units
 * (100vh = 1 unit). Derived from SCROLL so the two never drift — the timeline's
 * total AND the scroll→time mapping both come from here, which keeps every
 * scroll-positioned cue (e.g. the cinematic text beats) locked to its moment
 * even as sections are added.
 */
export const SCROLL_VH_TOTAL = Object.values(SCROLL).reduce((a, b) => a + b, 0);
export const TIMELINE_UNITS = SCROLL_VH_TOTAL / 100;

export type Phase = "loading" | "intro" | "hero";
