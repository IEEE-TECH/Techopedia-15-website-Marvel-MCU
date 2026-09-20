"use client";

import { useEffect, useRef } from "react";
import { signals } from "@/lib/signals";
import { useRaf } from "@/lib/useRaf";
import styles from "./reel.module.css";

interface Scene {
  n: string;
  slug: string;
  day: string;
  timecode: string;
  title: string;
  venue: string;
  accent: string;
}

const SCENES: Scene[] = [
  {
    n: "01",
    slug: "doom",
    day: "DAY 01",
    timecode: "10:30 AM",
    title: "Debate Competition Prelims",
    venue: "Main Seminar Hall / AV Room",
    accent: "#ed1d24",
  },
  {
    n: "02",
    slug: "cyclops",
    day: "DAY 01",
    timecode: "02:00 PM",
    title: "Quiz Competition Screening & Prelims",
    venue: "Central Auditorium",
    accent: "#ffd700",
  },
  {
    n: "03",
    slug: "blackpanther",
    day: "DAY 01",
    timecode: "06:30 PM",
    title: "Quiz Competition Audio-Visual Finals",
    venue: "Central Auditorium",
    accent: "#ff4d4d",
  },
  {
    n: "04",
    slug: "mystique",
    day: "DAY 02",
    timecode: "11:00 AM",
    title: "Gun Game Qualifier LAN Heats",
    venue: "E-Sports Gaming Lounge / Lab 4",
    accent: "#00e5ff",
  },
  {
    n: "05",
    slug: "gambit",
    day: "DAY 02",
    timecode: "02:00 PM",
    title: "Debate Competition Grand Parliamentary Finale",
    venue: "Main Auditorium",
    accent: "#ff9900",
  },
  {
    n: "06",
    slug: "namor",
    day: "DAY 02",
    timecode: "06:00 PM",
    title: "Grand Finale & Trophy Distribution",
    venue: "Grand Amphitheater",
    accent: "#ed1d24",
  },
];

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function HorizontalReel() {
  return null;
}
