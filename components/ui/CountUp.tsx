"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animates a stat string like "1500+", "48hrs" or "15" by counting up its
 * numeric portion once it scrolls into view, preserving any prefix/suffix.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  const prefix = match ? match[1] : "";
  const numeric = match ? parseInt(match[2].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[3] : "";

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 70, damping: 22 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView && numeric !== null) {
      motionVal.set(numeric);
    }
  }, [isInView, numeric, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.floor(v)));
    return unsubscribe;
  }, [spring]);

  if (numeric === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
