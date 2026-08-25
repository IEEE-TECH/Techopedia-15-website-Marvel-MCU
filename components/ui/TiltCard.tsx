"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";

const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.4 };
const GLOW_SPRING = { stiffness: 160, damping: 24 };

/**
 * Wraps its children in a motion.div that tilts toward the cursor in 3D
 * (mouse-tracking rotateX/rotateY) and, optionally, shows a radial glow
 * that follows the pointer. Pure motion-value driven — no re-renders on
 * mousemove, so it stays smooth at 60fps.
 */
export default function TiltCard({
  children,
  className,
  maxTilt = 10,
  glow = false,
  glowColor = "0, 255, 156",
  style,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glow?: boolean;
  glowColor?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const glowOpacity = useSpring(useMotionValue(0), GLOW_SPRING);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), TILT_SPRING);
  const glowX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glowBg = useMotionTemplate`radial-gradient(280px circle at ${glowX} ${glowY}, rgba(${glowColor}, 0.3), transparent 72%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    glowOpacity.set(1);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    glowOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      style={{
        position: "relative",
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {glow && (
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: glowBg,
            opacity: glowOpacity,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
