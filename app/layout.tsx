import type { Metadata, Viewport } from "next";
import { Anton, Chakra_Petch, Orbitron, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Official Marvel "Avengeance Heroic Avenger" font (the four true weight/style
// files — not the "Avengeance Mightiest Avenger" substitute that was
// previously wired in here under these same filenames).
const avengeance = localFont({
  src: [
    {
      path: "../public/fonts/avengeance-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/avengeance-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/avengeance-italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/avengeance-bolditalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-avengeance",
  display: "swap",
});

// Impact display face for the giant titles.
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

// Sci-fi HUD face for kickers, labels and UI.
const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

// Avengers Heroic Display Font
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

// High-tech Futuristic Sci-Fi font
const orbitron = Orbitron({
  weight: ["400", "600", "800", "900"],
  subsets: ["latin"],
  variable: "--font-orb",
  display: "swap",
});

// Set NEXT_PUBLIC_SITE_URL to your deployed URL so link previews resolve the
// social image correctly. Falls back to a sensible default otherwise.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techopedia15.vercel.app";
const description =
  "Techopedia Level 15 — The ultimate annual national technical symposium featuring hackathons, CTF cybersecurity challenges, robotics arena, paper presentations, and e-sports.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TECHOPEDIA LEVEL 15 — Decoding The Future",
  description,
  keywords: [
    "Techopedia",
    "Techopedia Level 15",
    "Techopedia 15.0",
    "Technical Fest",
    "Hackathon",
    "Cybersecurity CTF",
    "Robotics",
    "Paper Presentation",
    "IEEE",
    "Next.js",
    "Three.js",
    "GSAP",
  ],
  openGraph: {
    title: "TECHOPEDIA LEVEL 15 — Decoding The Future",
    description,
    url: siteUrl,
    siteName: "TECHOPEDIA LEVEL 15",
    type: "website",
    images: [{ url: "/videos/title-reveal-poster.jpg", width: 1180, height: 486, alt: "TECHOPEDIA LEVEL 15" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TECHOPEDIA LEVEL 15 — Decoding The Future",
    description,
    images: ["/videos/title-reveal-poster.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${avengeance.variable} ${anton.variable} ${chakra.variable} ${bebas.variable} ${orbitron.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes on <body> before React hydrates — harmless, not our markup. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
