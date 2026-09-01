"use client";

import DoomModel from "./DoomModel";

/**
 * Section 2 — the character showcase. A rim-lit Doom placeholder at centre; the
 * six character cards now orbit as real DOM <video> panels (components/overlays/
 * CharacterOrbit) straddling this canvas in z, so cards genuinely pass behind the
 * model. Lights only touch the lit (Standard) materials of the model; the additive
 * atmosphere ignores them. Self-gates on `signals.showcase`.
 */
export default function Showcase() {
  return (
    <>
      {/* dim red/crimson ambient so the dark metal never crushes to pure black */}
      <ambientLight color="#26080b" intensity={1.6} />
      {/* cool key from the front-top gives form */}
      <directionalLight color="#ffffff" intensity={2.6} position={[3.5, 5, 4]} />
      {/* strong red rim from behind — the cinematic edge glow */}
      <pointLight color="#ed1d24" intensity={55} distance={26} decay={2} position={[-4.2, 3, -3.2]} />
      {/* soft gold fill from the front-right */}
      <pointLight color="#ffd700" intensity={22} distance={20} decay={2} position={[4, 1.2, 3]} />
      {/* faint underglow */}
      <pointLight color="#b31016" intensity={10} distance={10} decay={2} position={[0, -1.6, 1.5]} />

      <DoomModel />
    </>
  );
}
