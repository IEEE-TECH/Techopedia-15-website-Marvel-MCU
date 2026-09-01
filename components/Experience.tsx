"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/useLenis";
import { useExperience } from "@/lib/store";
import { signals } from "@/lib/signals";
import { getVideoEl, scrubEl } from "@/lib/videos";
import { VIDEO, SCROLL, TIMELINE_UNITS } from "@/lib/constants";
import { EventDomain } from "@/lib/eventData";
import { sound } from "@/lib/audio";

import CinematicCanvas from "@/components/webgl/CinematicCanvas";
import VideoLayer from "@/components/overlays/VideoLayer";
import CharacterOrbit from "@/components/overlays/CharacterOrbit";
import StoryStack from "@/components/overlays/StoryStack";
import HorizontalReel from "@/components/overlays/HorizontalReel";
import FlashOverlay from "@/components/overlays/FlashOverlay";
import CinematicText from "@/components/overlays/CinematicText";
import ScrollCue from "@/components/ui/ScrollCue";
import SiteHeader from "@/components/ui/SiteHeader";
import HeroOverlay from "@/components/ui/HeroOverlay";
import SiteFooter from "@/components/ui/SiteFooter";
import RegistrationModal from "@/components/ui/RegistrationModal";
import MiniGamesModal from "@/components/games/MiniGamesModal";
import EventDetailModal from "@/components/overlays/EventDetailModal";
import TeamSection from "@/components/overlays/TeamSection";
import SponsorsSection from "@/components/overlays/SponsorsSection";

// Master timeline positions (arbitrary units; ScrollTrigger scrubs scroll→time).
const T = {
  introEnd: 1.4,
  marvelEnd: 3.8,
  portalStart: 3.9,
  heroEnter: 4.7,
  textStart: 5.2,
  textEnd: 7.8,
  videoStart: 7.8,
  videoEnd: 11.2,
  showcaseStart: 11.8,
  showcaseEnd: 16.5,
  storyStart: 16.8,
  storyEnd: 23.4,
  reelStart: 24.5,
  reelEnd: 31.3,
  total: TIMELINE_UNITS,
};

export default function Experience() {
  const [mounted, setMounted] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regDomain, setRegDomain] = useState("Code Conquest");
  const [isMiniGamesOpen, setIsMiniGamesOpen] = useState(false);
  const [miniGamesTab, setMiniGamesTab] = useState<"ctf" | "bugblitz" | "matrix" | "quiz">("bugblitz");
  const [selectedEvent, setSelectedEvent] = useState<EventDomain | null>(null);

  useLenis();
  const trackRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      signals.mtx = (e.clientX / window.innerWidth) * 2 - 1;
      signals.mty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let started = false;
    const onGesture = () => {
      if (started) return;
      started = true;
      useExperience.getState().start();
      sound.playMarvelFanfare();
    };
    const evs = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;
    evs.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));

    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (rm?.matches) useExperience.getState().setReduceMotion(true);

    return () => {
      window.removeEventListener("pointermove", onMove);
      evs.forEach((e) => window.removeEventListener(e, onGesture));
    };
  }, []);

  useEffect(() => {
    if (!mounted || builtRef.current || !trackRef.current) return;
    builtRef.current = true;
    useExperience.getState().setPhase("intro");

    const heroThreshold = T.heroEnter / T.total;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          signals.scroll = self.progress;

          const marvel = getVideoEl("marvel");
          const hero = getVideoEl("hero");
          const finale = getVideoEl("finale");
          if (marvel) {
            marvel.style.opacity = signals.marvelOp.toFixed(3);
            if (signals.marvelOp > 0.002) scrubEl(marvel, signals.marvelT);
          }
          if (hero) {
            hero.style.opacity = signals.heroOp.toFixed(3);
            if (signals.heroOp > 0.002) scrubEl(hero, signals.heroT);
          }
          if (finale) {
            finale.style.opacity = signals.finale.toFixed(3);
            finale.style.visibility = signals.finale > 0.002 ? "visible" : "hidden";
            if (signals.finale > 0.002) scrubEl(finale, signals.finaleT);
          }
          const next = self.progress >= heroThreshold ? "hero" : "intro";
          if (useExperience.getState().phase !== next) useExperience.getState().setPhase(next);
        },
      },
    });

    // ── Section 1 · storm ──
    tl.to(signals, { energy: 1, duration: T.introEnd }, 0);
    tl.fromTo(signals, { marvelOp: 0 }, { marvelOp: 1, duration: 0.55 }, T.introEnd - 0.55);

    // ── Section 1 · Marvel intro scrubs ──
    tl.to(signals, { energy: 0.28, duration: 0.6 }, T.introEnd);
    tl.to(signals, { marvelT: VIDEO.marvelDur, duration: T.marvelEnd - T.introEnd }, T.introEnd);

    // ── Portal dive ──
    tl.to(signals, { energy: 0.6, duration: 0.5 }, T.marvelEnd);
    tl.to(signals, { portal: 1, duration: 1.0, ease: "power1.in" }, T.portalStart);
    tl.to(signals, { dolly: 1, duration: 1.1 }, T.portalStart);
    tl.to(signals, { marvelOp: 0, duration: 0.2 }, T.heroEnter - 0.15);
    tl.to(signals, { header: 1, duration: 0.7 }, T.heroEnter + 0.05);
    tl.to(signals, { portal: 0, duration: 0.9, ease: "power1.out" }, T.heroEnter + 0.2);
    tl.to(signals, { dolly: 0, duration: 1.0 }, T.heroEnter + 0.2);

    // ── Section 2a · text ──
    tl.to(signals, { energy: 0.12, duration: 0.8 }, T.heroEnter + 0.3);

    // ── Section 2b · Doom video scrubs ──
    tl.to(signals, { heroOp: 1, duration: 0.3, ease: "power2.out" }, T.videoStart);
    tl.to(signals, { energy: 0.15, duration: 0.6 }, T.videoStart);
    tl.to(signals, { heroT: VIDEO.heroDur, duration: T.videoEnd - T.videoStart }, T.videoStart);
    tl.to(signals, { energy: 0.13, duration: 0.8 }, T.videoEnd);

    // ── Section 2 · showcase ──
    tl.to(signals, { heroOp: 0, duration: 1.0, ease: "power2.in" }, T.showcaseStart);
    tl.to(signals, { showcase: 1, duration: T.showcaseEnd - T.showcaseStart, ease: "none" }, T.showcaseStart);
    tl.to(signals, { energy: 0.22, duration: 1.2, ease: "power1.out" }, T.showcaseStart);

    // ── Section 3 · story stack ──
    tl.to(signals, { showcase: 0, duration: 0.9, ease: "power2.inOut" }, T.storyStart);
    tl.to(signals, { story: 1, duration: T.storyEnd - T.storyStart, ease: "none" }, T.storyStart);
    tl.to(signals, { energy: 0.18, duration: 1.0, ease: "power1.inOut" }, T.storyStart);

    // ── Section 4 · horizontal timeline ──
    tl.to(signals, { reel: 1, duration: T.reelEnd - T.reelStart, ease: "none" }, T.reelStart);
    tl.to(signals, { energy: 0.19, duration: 1.4, ease: "power1.out" }, T.reelStart);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      builtRef.current = false;
    };
  }, [mounted]);

  const marvelVh = SCROLL.introAtmos + SCROLL.marvelScrub + SCROLL.transition;
  const heroVh = SCROLL.heroText + SCROLL.heroScrub + SCROLL.heroOutro;
  const showcaseVh = SCROLL.showcaseRise + SCROLL.showcaseOrbit + SCROLL.showcaseOut;
  const storyVh = SCROLL.storyStack;
  const reelVh = SCROLL.reelStrip;
  const outroVh = SCROLL.footerReveal;

  const handleOpenRegistration = (domain: string = "Code Conquest") => {
    setRegDomain(domain);
    setIsRegOpen(true);
  };

  const handleOpenMiniGames = (tab: "ctf" | "bugblitz" | "matrix" | "quiz" = "bugblitz") => {
    setMiniGamesTab(tab);
    setIsMiniGamesOpen(true);
  };

  return (
    <>
      <div className="stage">
        <VideoLayer />
        <StoryStack onSelectEvent={(ev) => setSelectedEvent(ev)} />
        <HorizontalReel />
        <CharacterOrbit onSelectEvent={(ev) => setSelectedEvent(ev)} />
        {mounted && <CinematicCanvas />}
        <FlashOverlay />
        <CinematicText />
      </div>

      <SiteHeader
        onRegisterClick={() => handleOpenRegistration("Code Conquest")}
        onTerminalClick={() => handleOpenMiniGames("ctf")}
        onMiniGamesClick={() => handleOpenMiniGames("bugblitz")}
      />

      <HeroOverlay
        onRegisterClick={() => handleOpenRegistration("Code Conquest")}
        onMiniGamesClick={() => handleOpenMiniGames("bugblitz")}
      />

      <ScrollCue />

      <RegistrationModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        initialDomain={regDomain}
      />

      <MiniGamesModal
        isOpen={isMiniGamesOpen}
        onClose={() => setIsMiniGamesOpen(false)}
        defaultTab={miniGamesTab}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={(domain) => handleOpenRegistration(domain)}
      />

      {/* invisible scroll track */}
      <div className="scroll-track" ref={trackRef} aria-hidden>
        <section style={{ height: `${marvelVh}vh` }} aria-label="Marvel Intro" />
        <section style={{ height: `${heroVh}vh` }} aria-label="Hero" />
        <section style={{ height: `${showcaseVh}vh` }} aria-label="Characters" />
        <section style={{ height: `${storyVh}vh` }} aria-label="Story" />
        <section style={{ height: `${reelVh}vh` }} aria-label="Timeline" />
        <section style={{ height: `${outroVh}vh` }} aria-label="Outro" />
      </div>

      {/* In-page single-page flow sections */}
      <div style={{ position: "relative", zIndex: 10, background: "#06070a" }}>
        <TeamSection />
        <SponsorsSection />
        <SiteFooter />
      </div>
    </>
  );
}
