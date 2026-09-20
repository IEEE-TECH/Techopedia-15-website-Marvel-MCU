"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Smooth-scroll spine. The whole experience is scroll-driven, so Lenis runs from
 * load and feeds GSAP's ticker + ScrollTrigger. Its inertia is what makes the
 * scrubbed trailers glide instead of snap.
 */
export function useLenis() {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.65,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.25,
      touchMultiplier: 1.5,
      syncTouch: false,
    });
    ref.current = lenis;
    (window as unknown as Record<string, unknown>).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as Record<string, unknown>).__lenis;
      ref.current = null;
    };
  }, []);

  return ref;
}
