import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AmbientBokeh } from "./AmbientBokeh";
import {
  CORNER_CLUSTER_SCALE,
  CORNER_COUNTER_FLOURISH_TRANSFORM,
  CORNER_FLOURISH,
  CORNER_TRANSFORMS,
  FRAME_H,
  FRAME_HEIGHT_VH,
  FRAME_INNER_INSET,
  FRAME_INNER_INSET_2,
  FRAME_INNER_WIDTH_VH,
  FRAME_RADIUS,
  FRAME_VB_H,
  FRAME_VB_W,
  FRAME_W,
  FRAME_X,
  MONOGRAM_Y_SHIFT_VH,
  NAME_RULE_LENGTH,
  NAMES_TOP_PERCENT,
  FRAME_Y,
} from "./MonogramCrest";
import { NAMES, DATE } from "./MonogramAnimation";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX_CENTERED_ON_CROSSING } from "./paths";

/**
 * MonogramCrestLoop
 *
 * The ornamental gold crest — MonogramCrest's hand-drawn flourish frame
 * around the breathing monogram — rebuilt as a perpetual, seamless loop
 * for the LED wall. Like MonogramAnimation, it has to play for hours
 * behind us, so it can't have an entrance or exit: the frame is always
 * fully drawn and everything simply lives in place — a slow breathe and
 * glow on the monogram, two independent gold shimmer sweeps (one on the
 * letterforms, one gliding along the frame, out of phase with each
 * other so they never move in lockstep), and a drift of warm gold
 * sparkle through the whole crest. The "fancier" ornamental look, made
 * loop-safe.
 *
 * Every motion is a sinusoid of `loopPhase` at a whole-number cycle
 * count, so frame 0 and the final frame are identical and the loop has
 * no seam, however long it plays — the same discipline as
 * MonogramAnimation, just dressed in the crest's gold flourish frame.
 *
 * Tweak TIMINGS / colors below without touching the animation logic.
 *
 * Like MonogramAnimation, the visual (`MonogramCrestLoopView`) takes
 * `frame` as a plain prop instead of calling `useCurrentFrame` directly
 * — see that file's note for why this makes it reusable outside
 * Remotion (e.g. as a live web hero) via the thin wrapper below.
 */

const TIMINGS = {
  totalFrames: 900, // 15s @ 60fps — matches durationInFrames in Root.tsx
  breatheCyclesPerLoop: 1, // one slow inhale/exhale across the whole loop
  shimmerCyclesPerLoop: 1, // one sweep across the monogram per loop
  frameShimmerCyclesPerLoop: 1, // one sweep along the frame per loop, out of phase
};

// Gold palette — matches MonogramCrest, for a cohesive "fancy" look
const BG = "#0d0d0d";
const LETTER = "#e8c992"; // champagne gold for the monogram + names/date
const SHIMMER = "#fff6e6"; // warm hot highlight for the sweeps
const GOLD = "#cda86a"; // antique gold for the ornamental frame
const SPARK_GOLD = "#d8b76a"; // richer gold for the sparkle halos
const SPARK_CORE = "#fff3d6"; // warm bright highlight for sparkle flares

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap');";

// Offsets the frame's shimmer/glow cycle from the monogram's, so the two
// catch the light at different moments rather than pulsing in lockstep —
// a small touch that keeps the steady loop feeling alive, not mechanical.
const FRAME_PHASE_OFFSET = Math.PI * 0.6;

export const MonogramCrestLoopView: React.FC<{ frame: number }> = ({ frame }) => {

  // Shared loop phase: 0 → 2π over the composition's length, so sin/cos
  // of (phase * wholeNumberOfCycles) is identical at frame 0 and the
  // final frame — no interpolate-with-clamp ramps anywhere, nothing
  // ever "arrives" or "departs".
  const loopPhase = (frame / TIMINGS.totalFrames) * 2 * Math.PI;

  // ── Living breathe + glow on the monogram — same as MonogramAnimation ───
  const breathe = 1 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glowStrength = 0.7 + 0.3 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glow = `drop-shadow(0 0 ${18 * glowStrength}px rgba(232, 201, 146, ${0.45 * glowStrength}))
                drop-shadow(0 0 ${48 * glowStrength}px rgba(216, 183, 106, ${0.25 * glowStrength}))`;

  // ── Monogram shimmer — drifts back and forth across the letterforms ─────
  const sweep = interpolate(
    Math.sin(loopPhase * TIMINGS.shimmerCyclesPerLoop),
    [-1, 1],
    [-0.5, 1.5]
  );

  // ── Depth echo — a soft, blurred duplicate of the monogram breathing
  //    slightly out of phase behind the crisp one — same quiet
  //    dimensionality as MonogramAnimation's, dressed in gold here so it
  //    matches the crest's palette. ───────────────────────────────────────
  const echoBreathe =
    1.05 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop + Math.PI / 2);

  // ── Frame shimmer + glow — its own slow sweep along the gold flourish
  //    border, phase-offset from the monogram's so the crest never feels
  //    like one thing pulsing — more like candlelight finding different
  //    facets of the same gilt at different moments. ───────────────────────
  const framePhase = loopPhase * TIMINGS.frameShimmerCyclesPerLoop + FRAME_PHASE_OFFSET;
  const frameSweep = interpolate(Math.sin(framePhase), [-1, 1], [-0.5, 1.5]);
  const frameGlowStrength = 0.6 + 0.4 * Math.sin(framePhase);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <style>{FONT_IMPORT}</style>

      {/* Gold ambient sparkle drifting through the whole crest */}
      <AmbientBokeh frame={frame} totalFrames={TIMINGS.totalFrames} sparkColor={SPARK_GOLD} coreColor={SPARK_CORE} />

      {/*
        Ornamental gold crest frame — fully drawn from frame one (this
        has to loop for hours, not arrive once), with its own slow
        shimmer sweep and breathing glow layered on top via a screened
        gradient duplicate of each stroke, so the gilt never sits flat.
      */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          viewBox={`0 0 ${FRAME_VB_W} ${FRAME_VB_H}`}
          style={{
            height: `${FRAME_HEIGHT_VH}vh`,
            width: "auto",
            display: "block",
            filter: `drop-shadow(0 0 ${10 * frameGlowStrength}px rgba(205, 168, 106, ${0.35 * frameGlowStrength}))`,
          }}
          overflow="visible"
        >
          <defs>
            <linearGradient
              id="frame-loop-shimmer"
              gradientUnits="objectBoundingBox"
              gradientTransform={`translate(${frameSweep} 0) rotate(20)`}
            >
              <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
              <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.8} />
              <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer border, plus a screened shimmer twin gliding along it */}
          <rect x={FRAME_X} y={FRAME_Y} width={FRAME_W} height={FRAME_H} rx={FRAME_RADIUS} fill="none" stroke={GOLD} strokeWidth={2} />
          <rect
            x={FRAME_X}
            y={FRAME_Y}
            width={FRAME_W}
            height={FRAME_H}
            rx={FRAME_RADIUS}
            fill="none"
            stroke="url(#frame-loop-shimmer)"
            strokeWidth={2}
            style={{ mixBlendMode: "screen" }}
          />

          {/* Inner accent border — the classic double-line crest/badge frame */}
          <rect
            x={FRAME_X + FRAME_INNER_INSET}
            y={FRAME_Y + FRAME_INNER_INSET}
            width={FRAME_W - FRAME_INNER_INSET * 2}
            height={FRAME_H - FRAME_INNER_INSET * 2}
            rx={Math.max(FRAME_RADIUS - FRAME_INNER_INSET, 4)}
            fill="none"
            stroke={GOLD}
            strokeWidth={1}
            opacity={0.55}
          />
          {/* Third, hairline border — layers the frame into a triple-line setting like fine engraving */}
          <rect
            x={FRAME_X + FRAME_INNER_INSET_2}
            y={FRAME_Y + FRAME_INNER_INSET_2}
            width={FRAME_W - FRAME_INNER_INSET_2 * 2}
            height={FRAME_H - FRAME_INNER_INSET_2 * 2}
            rx={Math.max(FRAME_RADIUS - FRAME_INNER_INSET_2, 4)}
            fill="none"
            stroke={GOLD}
            strokeWidth={0.6}
            opacity={0.3}
          />

          {CORNER_TRANSFORMS.map((t, i) => (
            <g key={i} transform={t}>
              {/*
                The whole cluster — scroll, jewel, rosette, halo — scaled
                up as one unit so each corner reads as a substantial
                emblem at a glance, not a fine detail you lean in for.
              */}
              <g transform={`scale(${CORNER_CLUSTER_SCALE})`}>
                {/* Main scroll, plus its shimmer twin */}
                <path d={CORNER_FLOURISH} fill="none" stroke={GOLD} strokeWidth={2} />
                <path d={CORNER_FLOURISH} fill="none" stroke="url(#frame-loop-shimmer)" strokeWidth={2} style={{ mixBlendMode: "screen" }} />
                {/*
                  Counter-scroll — the same flourish reflected across the
                  corner's diagonal, spiralling in from the other border
                  arm. Thinner and fainter than the main scroll so the
                  pair reads as call-and-response, not two competing
                  voices — two vines winding in from the frame itself,
                  the baroque "interlacing vines" a single curl can't
                  give a corner on its own.
                */}
                <path
                  d={CORNER_FLOURISH}
                  transform={CORNER_COUNTER_FLOURISH_TRANSFORM}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={1.2}
                  opacity={0.55}
                />
              </g>
            </g>
          ))}
        </svg>
      </AbsoluteFill>

      {/*
        The monogram gets its own full-frame centring layer, just like
        in MonogramAnimation — VIEWBOX_CENTERED_ON_CROSSING re-frames the
        artwork on the true visual crossing point of the A and S, so it
        lands concentrically inside the gold frame above.

        Stacked drop-shadow filters force the browser to rasterize the
        filtered element into an offscreen layer sized to its bounding
        box — and that layer's edge reads as a faint rectangular tint
        against flat black (true in every engine, not a Chromium quirk).
        Rather than fight it, the glow filter sits on a wrapper sized
        and centred to exactly match the gold frame rectangle's
        rendered bounds, so that faint rectangle lands precisely on the
        crest's own border and reads as the frame's inner glow — by
        design — instead of a stray, misaligned smudge.
      */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${MONOGRAM_Y_SHIFT_VH}vh)`,
        }}
      >
        {/*
          Depth echo — a soft, blurred duplicate of the monogram sitting
          just behind the crisp one, breathing slightly out of phase, in
          the crest's gold rather than warm white. Same quiet
          dimensionality as MonogramAnimation's — a shadow cast on
          velvet, not a flat cutout.
        */}
        <div
          style={{
            position: "absolute",
            transform: `scale(${echoBreathe})`,
            filter: "blur(12px)",
            opacity: 0.22,
          }}
        >
          <svg
            viewBox={VIEWBOX_CENTERED_ON_CROSSING}
            style={{ height: "34vh", width: "auto", display: "block" }}
            overflow="visible"
          >
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
            </g>
          </svg>
        </div>

        <div
          style={{
            width: `${FRAME_INNER_WIDTH_VH}vh`,
            height: `${FRAME_HEIGHT_VH * (FRAME_H / FRAME_VB_H)}vh`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: glow,
          }}
        >
        <div style={{ transform: `scale(${breathe})` }}>
          <svg
            viewBox={VIEWBOX_CENTERED_ON_CROSSING}
            style={{ height: "34vh", width: "auto", display: "block" }}
            overflow="visible"
          >
            <defs>
              <linearGradient
                id="crest-loop-mark-shimmer"
                gradientUnits="objectBoundingBox"
                gradientTransform={`translate(${sweep} 0) rotate(20)`}
              >
                <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
                <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.85} />
                <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
              </linearGradient>
            </defs>
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
              <path
                d={PATH_AS}
                fill="url(#crest-loop-mark-shimmer)"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          </svg>
        </div>
        </div>
      </AbsoluteFill>

      {/*
        Names + date — settled in place from frame one, gold, anchored
        independently of the monogram's centring layer so this block
        never shifts the crest off-centre. The row sizes to its natural
        content width (short rule lines either side of the names) and is
        simply centred — comfortably narrower than the frame's inner
        edge, leaving deliberate breathing room between the rule-ends
        and the gold border, the same considered margin as MonogramCrest.
        maxWidth + overflow: hidden together are the hard guarantee
        that this can never spill past the frame's inner edge — same
        belt-and-braces containment as MonogramCrest, even though this
        steady-state loop has no entrance animation to overshoot it.
      */}
      <div
        style={{
          position: "absolute",
          top: NAMES_TOP_PERCENT,
          left: "50%",
          maxWidth: `${FRAME_INNER_WIDTH_VH}vh`,
          overflow: "hidden",
          transform: "translate(-50%, 0)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif",
          color: LETTER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ width: NAME_RULE_LENGTH, flexShrink: 1, minWidth: 0, height: 1, background: LETTER }} />
          <span style={{ flexShrink: 0, fontSize: 30, fontWeight: 300, letterSpacing: 10, whiteSpace: "nowrap" }}>{NAMES}</span>
          <span style={{ width: NAME_RULE_LENGTH, flexShrink: 1, minWidth: 0, height: 1, background: LETTER }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 20, fontWeight: 300, letterSpacing: 8 }}>
          {DATE}
        </div>
      </div>

      {/*
        Cinematic vignette — same static radial darkening as
        MonogramAnimation, so the two LED-wall loops feel like one
        considered piece rather than two different treatments.
      */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Remotion-bound wrapper — registered as the <Composition> in
 * Root.tsx. Pulls the render's frame counter from `useCurrentFrame`
 * and hands it to the frame-agnostic view above. To reuse this crest
 * outside Remotion (e.g. a live web hero), render `MonogramCrestLoopView`
 * directly with an elapsed-time-based frame counter — see
 * MonogramAnimation's wrapper for the same pattern.
 */
export const MonogramCrestLoop: React.FC = () => {
  const frame = useCurrentFrame();
  return <MonogramCrestLoopView frame={frame} />;
};
