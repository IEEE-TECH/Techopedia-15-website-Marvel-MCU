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
  glowColor = "237, 29, 36",
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
  const glowOpacityRaw = useMotionValue(0);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    glowOpacityRaw.set(1);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glowOpacityRaw.set(0);
  };

  const rotX = useTransform(py, [0, 1], [maxTilt, -maxTilt]);
  const rotY = useTransform(px, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useSpring(rotX, TILT_SPRING);
  const rotateY = useSpring(rotY, TILT_SPRING);

  const glowOpacity = useSpring(glowOpacityRaw, GLOW_SPRING);
  const glowX = useSpring(useTransform(px, (v) => `${(v * 100).toFixed(1)}%`), GLOW_SPRING);
  const glowY = useSpring(useTransform(py, (v) => `${(v * 100).toFixed(1)}%`), GLOW_SPRING);

  const glowBg = useMotionTemplate`radial-gradient(400px circle at ${glowX} ${glowY}, rgba(${glowColor}, 0.28), transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
