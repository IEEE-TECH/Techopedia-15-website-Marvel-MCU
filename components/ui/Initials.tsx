"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Renders initials and measures the drawn glyphs so they can be centred,
 * instead of trusting the font's (wrong) advance/ascent metrics.
 * Exposes the correction as --ink-x / --ink-y; apply it with transform in CSS.
 */
export default function Initials({
  text,
  ...rest
}: { text: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const cs = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      (ctx as unknown as { letterSpacing?: string }).letterSpacing = cs.letterSpacing;
      const m = ctx.measureText(text);

      // horizontal: centre of the drawn ink vs centre of the advance box
      const dx = m.width / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;

      // vertical: centre of the drawn ink vs centre of the line box
      let dy = 0;
      if (m.fontBoundingBoxAscent !== undefined) {
        const A = m.actualBoundingBoxAscent;
        const D = m.actualBoundingBoxDescent;
        const fA = m.fontBoundingBoxAscent;
        const fD = m.fontBoundingBoxDescent;
        dy = (A - D - (fA - fD)) / 2;
      }

      el.style.setProperty("--ink-x", `${dx.toFixed(2)}px`);
      el.style.setProperty("--ink-y", `${dy.toFixed(2)}px`);
    };

    fit();
    document.fonts?.ready.then(fit);
  }, [text]);

  return (
    <span ref={ref} {...rest}>
      {text}
    </span>
  );
}
