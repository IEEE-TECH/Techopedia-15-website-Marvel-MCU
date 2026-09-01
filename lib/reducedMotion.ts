/**
 * Global accessibility & performance helpers for motion gating.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isReducedPerformance(): boolean {
  if (typeof window === "undefined") return false;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const isReduced = prefersReducedMotion();
  const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return isMobile || isReduced || lowCores;
}
