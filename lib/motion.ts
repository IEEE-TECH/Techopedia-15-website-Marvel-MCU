/**
 * Canonical motion tokens & transition recipes.
 * Reused across Framer Motion overlays and modal entrances.
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const MODAL_SPRING = {
  type: "spring",
  stiffness: 340,
  damping: 28,
  mass: 0.8,
} as const;

export const TAB_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 32,
} as const;

export const OVERLAY_FADE = {
  duration: 0.25,
} as const;
