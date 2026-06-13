import React from "react";

/**
 * AmbientBokeh
 *
 * Soft drifting specks of warm light that occasionally catch the light
 * and flare into a bright, shiny glint — like candlelight or starlight
 * on dust in the air. Pulled out as its own component so the whole
 * effect can be toggled with a single line: just comment out
 * `<AmbientBokeh />` in MonogramAnimation.tsx and the backdrop falls
 * back to the flat background + monogram, no other changes needed.
 *
 * Each particle is two layers: a soft ever-present halo (the ambient
 * bokeh glow) and a hot white core that periodically "flares" — briefly
 * brightening and growing into a sharp point of light, the way a speck
 * of glitter or a droplet catches a beam. About half also throw a thin
 * four-point glint cross at the peak of their flare, like light
 * refracting through a faceted surface — true sparkle, not just glow.
 *
 * Every drift, twinkle and flare is a sinusoid whose period is exactly
 * `totalFrames` (or a whole-number multiple within it), so each
 * particle's state at frame 0 and at the final frame are identical and
 * the rendered loop has no visible seam — pass in the same totalFrames
 * as the composition's durationInFrames. (A seeded PRNG keeps the
 * layout stable across re-renders instead of using Math.random, which
 * would reshuffle on every refresh in the Studio.)
 *
 * Takes `frame` as a prop rather than calling `useCurrentFrame` itself —
 * that keeps it usable both inside Remotion (fed the render's frame
 * counter) and in a plain React page (fed an elapsed-time counter), with
 * no Remotion runtime dependency of its own.
 */

const DEFAULT_SPARK = "#f3dfb8"; // warm candlelight gold
const DEFAULT_SPARKLE_CORE = "#fffaf0"; // near-white hot centre for flare/glint moments

const PARTICLE_COUNT = 26;

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999.7) * 10000;
  return x - Math.floor(x);
};

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const r1 = seededRandom(i * 1.13 + 1);
  const r2 = seededRandom(i * 2.31 + 7);
  const r3 = seededRandom(i * 3.71 + 13);
  const r4 = seededRandom(i * 4.97 + 19);
  const r5 = seededRandom(i * 6.11 + 29);
  const r6 = seededRandom(i * 7.43 + 37);
  const r7 = seededRandom(i * 8.59 + 43);
  return {
    baseXPct: r1 * 100,
    baseYPct: r2 * 100,
    size: 2.5 + r3 * 6,
    driftX: 16 + r4 * 46,
    driftY: 22 + r5 * 56,
    phase: r1 * Math.PI * 2,
    twinklePhase: r6 * Math.PI * 2,
    twinkleSpeed: Math.round(1 + r2 * 2), // whole-number flare cycles per loop — keeps it seamless
    baseOpacity: 0.08 + r3 * 0.16,
    sparkly: r7 > 0.45, // ~55% throw a four-point glint cross at their peak flare
    glintLength: 14 + r7 * 24,
  };
});

export const AmbientBokeh: React.FC<{
  /** Current frame — from Remotion's `useCurrentFrame` or an elapsed-time equivalent. */
  frame: number;
  totalFrames: number;
  /** Halo/glint base color — defaults to a soft candlelight gold. */
  sparkColor?: string;
  /** Hot flare-core color — defaults to a near-white warm highlight. */
  coreColor?: string;
}> = ({ frame, totalFrames, sparkColor = DEFAULT_SPARK, coreColor = DEFAULT_SPARKLE_CORE }) => {
  const loopPhase = (frame / totalFrames) * 2 * Math.PI;

  return (
    <>
      {PARTICLES.map((p, i) => {
        const drift = loopPhase + p.phase;
        const x = p.baseXPct + (p.driftX / 19.2) * Math.cos(drift);
        const y = p.baseYPct + (p.driftY / 10.8) * Math.sin(drift);

        const flarePhase = loopPhase * p.twinkleSpeed + p.twinklePhase;
        const glow = 0.5 + 0.5 * Math.sin(flarePhase);
        // Spends most of its cycle low and pops briefly to full bright —
        // the "catching the light" sparkle moment, not a smooth pulse.
        const flash = Math.max(0, Math.sin(flarePhase)) ** 5;

        const haloSize = p.size * 5;
        const coreSize = p.size * (1.3 + flash * 1.3);

        return (
          <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%` }}>
            {/* soft ambient halo — the ever-present bokeh glow */}
            <div
              style={{
                position: "absolute",
                width: haloSize,
                height: haloSize,
                left: -haloSize / 2,
                top: -haloSize / 2,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${sparkColor} 0%, transparent 70%)`,
                opacity: p.baseOpacity * (0.4 + 0.6 * glow),
                filter: `blur(${p.size * 0.8}px)`,
              }}
            />
            {/* hot core — flares into a sharp, shiny point of light */}
            <div
              style={{
                position: "absolute",
                width: coreSize,
                height: coreSize,
                left: -coreSize / 2,
                top: -coreSize / 2,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${coreColor} 0%, ${sparkColor} 45%, transparent 75%)`,
                opacity: 0.2 + flash * 0.8,
                filter: `blur(${p.size * 0.18}px)`,
              }}
            />
            {/* four-point glint — a brief star-cross at the flare's peak */}
            {p.sparkly && (
              <>
                <div
                  style={{
                    position: "absolute",
                    width: p.glintLength,
                    height: 1.4,
                    left: -p.glintLength / 2,
                    top: -0.7,
                    background: `linear-gradient(90deg, transparent, ${coreColor}, transparent)`,
                    opacity: flash,
                    transform: `scaleX(${0.35 + flash * 0.65})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 1.4,
                    height: p.glintLength,
                    left: -0.7,
                    top: -p.glintLength / 2,
                    background: `linear-gradient(180deg, transparent, ${coreColor}, transparent)`,
                    opacity: flash,
                    transform: `scaleY(${0.35 + flash * 0.65})`,
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};
