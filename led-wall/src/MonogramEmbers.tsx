import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { NAMES, DATE } from "./MonogramAnimation";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX_CENTERED_ON_CROSSING } from "./paths";

/**
 * MonogramEmbers
 *
 * A candlelit, frameless variant of the monogram loop — the mark in
 * champagne gold over a warm hearth-glow that flickers like real
 * candlelight, with embers drifting slowly up through the dark around
 * it. Quieter and moodier than the crests; suited to late-evening LED
 * wall duty and as an alternative website hero.
 *
 * Loop-safety notes, since this one leans on two tricks beyond the
 * usual whole-cycle sinusoids:
 *  - The candle flicker is a sum of three sinusoids at different
 *    whole-number cycle counts (3, 7, 13 per loop) — irregular enough
 *    to read as flame, still exactly periodic over the loop.
 *  - Each ember climbs the screen a whole number of times per loop
 *    (its y position wraps modulo the travel range), and fades in/out
 *    near the wrap edges so the teleport is never visible. Sway and
 *    twinkle are whole-cycle sinusoids as everywhere else.
 * Frame 0 and the final frame are therefore identical — no seam.
 */

const TIMINGS = {
  totalFrames: 900, // 15s @ 60fps — matches durationInFrames in Root.tsx
  breatheCyclesPerLoop: 1,
  shimmerCyclesPerLoop: 1,
};

/**
 * Candle flicker — three sinusoids at whole-number cycle counts (3, 7,
 * 13 per loop) layered into an irregular-feeling but perfectly periodic
 * flame, range ~0.45..1. Exported for reuse by other candlelit loops
 * (MonogramCrestLoopLottieV2).
 */
export const candleFlicker = (loopPhase: number) =>
  0.72 +
  0.14 * Math.sin(loopPhase * 3 + 1.3) +
  0.09 * Math.sin(loopPhase * 7 + 4.1) +
  0.05 * Math.sin(loopPhase * 13 + 2.2);

// Palette — the crest family's golds, plus ember oranges for the sparks
const BG = "#0c0a09"; // a touch warmer than the crests' #0d0d0d
const LETTER = "#e8c992";
const SHIMMER = "#fff6e6";
const EMBER_HOT = "#ffd9a0"; // bright ember core
const EMBER_BODY = "#e8923f"; // glowing ember body
const HEARTH = "rgba(232, 170, 100, 0.16)"; // the candle-glow wash behind the mark

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap');";

// ── Embers ─────────────────────────────────────────────────────────────────
// Seeded like AmbientBokeh's particles so the field is stable across
// re-renders. Each ember rises from below the frame to above it `wraps`
// whole times per loop, swaying and twinkling on whole-cycle sinusoids.
const EMBER_COUNT = 22;
// Vertical travel range, in vh-like percentage points: embers wrap from
// 112% (just below frame) up to -12% (just above it).
const EMBER_TRAVEL_TOP = -12;
const EMBER_TRAVEL_RANGE = 124;

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999.7) * 10000;
  return x - Math.floor(x);
};

const EMBERS = Array.from({ length: EMBER_COUNT }, (_, i) => {
  const r1 = seededRandom(i * 1.37 + 3);
  const r2 = seededRandom(i * 2.71 + 11);
  const r3 = seededRandom(i * 3.91 + 17);
  const r4 = seededRandom(i * 5.23 + 23);
  const r5 = seededRandom(i * 6.47 + 31);
  const r6 = seededRandom(i * 7.91 + 41);
  return {
    baseXPct: 4 + r1 * 92,
    yOffset: r2, // where in its climb this ember starts at frame 0
    wraps: 1 + Math.round(r3), // 1 or 2 full climbs per loop — whole numbers keep the seam clean
    size: 2.2 + r4 * 3.6,
    swayAmpPct: 0.8 + r5 * 2.4,
    swayCycles: 1 + Math.round(r5 * 2), // whole-number sway cycles per loop
    swayPhase: r6 * Math.PI * 2,
    twinkleCycles: 2 + Math.round(r6 * 3), // whole-number twinkle cycles per loop
    twinklePhase: r1 * Math.PI * 2,
    baseOpacity: 0.35 + r2 * 0.45,
  };
});

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

/**
 * The drifting ember layer on its own — exported so other candlelit
 * loops (MonogramCrestLoopLottieV2) can reuse it. Same frame-prop
 * contract as AmbientBokeh: seamless as long as totalFrames matches the
 * composition length.
 */
export const EmberField: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const loopPhase = (frame / totalFrames) * 2 * Math.PI;
  const phase01 = frame / totalFrames;

  return (
    <>
      {EMBERS.map((e, i) => {
        const climb = (phase01 * e.wraps + e.yOffset) % 1;
        const y = EMBER_TRAVEL_TOP + (1 - climb) * EMBER_TRAVEL_RANGE;
        const x =
          e.baseXPct +
          e.swayAmpPct * Math.sin(loopPhase * e.swayCycles + e.swayPhase);
        const twinkle =
          0.55 + 0.45 * Math.sin(loopPhase * e.twinkleCycles + e.twinklePhase);
        const edgeFade = smooth(climb / 0.12) * (1 - smooth((climb - 0.88) / 0.12));
        const size = e.size;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${EMBER_HOT} 0%, ${EMBER_BODY} 55%, transparent 80%)`,
              boxShadow: `0 0 ${size * 2.5}px rgba(232, 146, 63, ${0.5 * twinkle * edgeFade})`,
              opacity: e.baseOpacity * twinkle * edgeFade,
              filter: "blur(0.4px)",
            }}
          />
        );
      })}
    </>
  );
};

export const MonogramEmbersView: React.FC<{ frame: number }> = ({ frame }) => {
  const loopPhase = (frame / TIMINGS.totalFrames) * 2 * Math.PI;

  const flicker = candleFlicker(loopPhase);

  // ── The usual living breathe, with the glow riding the flicker ──────────
  const breathe = 1 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glow = `drop-shadow(0 0 ${20 * flicker}px rgba(232, 201, 146, ${0.5 * flicker}))
                drop-shadow(0 0 ${54 * flicker}px rgba(216, 183, 106, ${0.28 * flicker}))`;

  const sweep = interpolate(
    Math.sin(loopPhase * TIMINGS.shimmerCyclesPerLoop),
    [-1, 1],
    [-0.5, 1.5]
  );

  const echoBreathe =
    1.05 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop + Math.PI / 2);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <style>{FONT_IMPORT}</style>

      {/* Hearth glow — a broad warm wash behind the mark whose strength
          rides the candle flicker. Centred a little low, like light from
          candles at table height. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "56%",
          width: "110vh",
          height: "85vh",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${HEARTH} 0%, transparent 65%)`,
          opacity: flicker,
        }}
      />

      {/* Embers — drifting up through the dark, swaying and twinkling.
          Opacity fades near the top and bottom of each climb so the
          wrap-around is invisible. */}
      <EmberField frame={frame} totalFrames={TIMINGS.totalFrames} />

      {/* Monogram — depth echo + crisp breathing mark, glow tied to the
          flicker so the gilt looks lit by the same flame as the room. */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            transform: `scale(${echoBreathe})`,
            filter: "blur(14px)",
            opacity: 0.22,
          }}
        >
          <svg
            viewBox={VIEWBOX_CENTERED_ON_CROSSING}
            style={{ height: "42vh", width: "auto", display: "block" }}
            overflow="visible"
          >
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
            </g>
          </svg>
        </div>

        <div
          style={{
            transform: `scale(${breathe})`,
            filter: glow,
          }}
        >
          <svg
            viewBox={VIEWBOX_CENTERED_ON_CROSSING}
            style={{ height: "42vh", width: "auto", display: "block" }}
            overflow="visible"
          >
            <defs>
              <linearGradient
                id="embers-mark-shimmer"
                gradientUnits="objectBoundingBox"
                gradientTransform={`translate(${sweep} 0) rotate(20)`}
              >
                <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
                <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.7} />
                <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
              </linearGradient>
            </defs>
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
              <path
                d={PATH_AS}
                fill="url(#embers-mark-shimmer)"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/* Names + date — settled in place, gold, same layout as
          MonogramAnimation's. */}
      <div
        style={{
          position: "absolute",
          top: "73%",
          left: "50%",
          transform: "translate(-50%, 0)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif",
          color: LETTER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ display: "inline-block", width: 64, height: 1, background: LETTER }} />
          <span style={{ fontSize: 30, fontWeight: 300, letterSpacing: 10 }}>{NAMES}</span>
          <span style={{ display: "inline-block", width: 64, height: 1, background: LETTER }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 20, fontWeight: 300, letterSpacing: 8 }}>
          {DATE}
        </div>
      </div>

      {/* Vignette — a touch heavier than the crests', for the candlelit
          fall-off into shadow. */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Remotion-bound wrapper — see MonogramAnimation's wrapper for the pattern. */
export const MonogramEmbers: React.FC = () => {
  const frame = useCurrentFrame();
  return <MonogramEmbersView frame={frame} />;
};
