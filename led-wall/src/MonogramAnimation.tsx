import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AmbientBokeh } from "./AmbientBokeh";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX_CENTERED_ON_CROSSING } from "./paths";

/**
 * MonogramAnimation
 *
 * LED wall composition: 1920 × 1080, 60fps, 15 seconds (900 frames),
 * played on an endless loop as a backdrop behind the two of us at the
 * reception — so it can't have an "entrance" or an "exit". It opens
 * already in its settled, steady state and simply breathes there. A
 * slow loop means every cycle (breathe, shimmer, sparkle) takes its
 * time and the repeat is far less noticeable over hours of play.
 *
 * The traced monogram is a single connected silhouette (the source
 * artwork has A and S overlapping), shown at rest, dead-centre, dressed
 * with a soft ambient glow, a slow "living" breathe, a gentle shimmer
 * that drifts back and forth across the letterforms like candlelight on
 * gilt, and ambient bokeh particles — plus the names + date settled in
 * place beneath it.
 *
 * Every motion is perfectly periodic over `totalFrames` (an integer
 * number of cycles each), so frame 0 and the final frame are identical
 * for every animated value — the render loops with no seam, no matter
 * how many hours it plays.
 *
 * Tweak TIMINGS / NAMES / DATE below without touching animation logic.
 *
 * The visual itself (`MonogramAnimationView`) takes `frame` as a plain
 * prop rather than calling `useCurrentFrame` directly — every motion is
 * just a function of `frame / totalFrames`, with no other Remotion
 * dependency (`AbsoluteFill`/`interpolate` are pure helpers that work
 * anywhere). That makes it trivial to reuse outside Remotion: feed it
 * an elapsed-time-based counter instead of the render's frame counter
 * and it'll run as a live, continuously-animating React component (e.g.
 * a hero section on the wedding website) — see `MonogramAnimation`
 * below for the thin Remotion-bound wrapper this same view is used in.
 */

const TIMINGS = {
  totalFrames: 900, // 15s @ 60fps — matches durationInFrames in Root.tsx.
                     // Every cyclesPerLoop below must be a whole number so
                     // each motion's phase lines up exactly at the seam.
                     // Raising totalFrames while holding cyclesPerLoop
                     // fixed both lengthens the loop AND slows every
                     // motion in it proportionally — exactly what you
                     // want for an hours-long ambient backdrop.
  breatheCyclesPerLoop: 1, // one slow inhale/exhale across the whole loop
  shimmerCyclesPerLoop: 1, // one gentle drift back and forth across the loop
};

// Shared with MonogramCrest — single source of truth so the two
// compositions never drift apart.
export const NAMES = "ARUN  &  SHALET";
export const DATE = "06 . 27 . 2026";

// Colors
const BG       = "#0d0d0d";
const LETTER   = "#f5f0eb"; // warm white
const SHIMMER  = "#fff6e6"; // warm hot highlight for the sweep

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap');";

export const MonogramAnimationView: React.FC<{ frame: number }> = ({ frame }) => {
  // Shared loop phase: goes from 0 to exactly 2π over the composition's
  // length, so sin/cos of (phase * wholeNumberOfCycles) is identical at
  // frame 0 and at the final frame — the basis for every seamless loop
  // below. No interpolate-with-clamp ramps anywhere: nothing "arrives"
  // or "departs", everything is just always quietly in motion.
  const loopPhase = (frame / TIMINGS.totalFrames) * 2 * Math.PI;

  // ── Living breathe — slow, continuous scale oscillation ─────────────────
  const breathe = 1 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);

  // ── Soft ambient glow, brightening and dimming gently with the breathe ──
  const glowStrength =
    0.7 + 0.3 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glow = `drop-shadow(0 0 ${18 * glowStrength}px rgba(245, 240, 235, ${0.4 * glowStrength}))
                drop-shadow(0 0 ${48 * glowStrength}px rgba(245, 240, 235, ${0.2 * glowStrength}))`;

  // ── Shimmer: a soft highlight drifts back and forth across the
  //    letterforms, like candlelight catching gilt — never starts, never
  //    stops, just keeps gently moving. ────────────────────────────────────
  const sweep = interpolate(
    Math.sin(loopPhase * TIMINGS.shimmerCyclesPerLoop),
    [-1, 1],
    [-0.5, 1.5]
  );

  // ── Depth echo: a soft, blurred duplicate of the monogram sitting just
  //    behind the crisp one, breathing slightly out of phase — reads as
  //    quiet dimensionality (like a shadow cast on velvet) rather than a
  //    flat cutout, without resorting to actual 3D. ───────────────────────
  const echoBreathe =
    1.05 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop + Math.PI / 2);

  return (
    // Flat solid background — no gradient, so nothing to band. Cleanest
    // possible look for an LED wall, and lets the glow/shimmer on the
    // monogram itself provide all the visual depth.
    <AbsoluteFill style={{ background: BG }}>
      {/*
        Quick @import for live preview in Remotion Studio. For a final
        rendered export, swap to @remotion/google-fonts so the font is
        guaranteed to be loaded before each frame is captured.
      */}
      <style>{FONT_IMPORT}</style>

      {/*
        Ambient bokeh — soft drifting flecks of warm candlelight that
        periodically catch the light and flare into a sharp, shiny
        glint. Sits between the flat background and the monogram so it
        reads as atmosphere, not foreground. To turn it off, just
        comment out this single line — see AmbientBokeh.tsx for details
        on why it's safe to add/remove without touching anything else
        (it carries its own colors, particle data, and seamless-loop
        math; the only thing it needs from here is the loop length).
      */}
      <AmbientBokeh frame={frame} totalFrames={TIMINGS.totalFrames} />

      {/*
        The monogram gets its own full-frame centring layer, independent
        of the names/date below. The crossing point of the A and S strokes
        — not the shape's bounding-box centroid, and not the centre of a
        "monogram + text" group — is what should land on the screen's true
        centre, so VIEWBOX_CENTERED_ON_CROSSING re-frames the artwork
        around that point and this layer centres it on the full 1920×1080
        frame with nothing else competing for the centring.
      */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/*
          Depth echo — a soft, blurred duplicate of the monogram sitting
          just behind the crisp one, breathing slightly out of phase. It
          reads as a shadow cast on velvet rather than a flat cutout —
          quiet dimensionality without any actual 3D.
        */}
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
                id="monogram-shimmer"
                gradientUnits="objectBoundingBox"
                gradientTransform={`translate(${sweep} 0) rotate(20)`}
              >
                <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
                <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.65} />
                <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/*
              An SVG element can't carry both a `transform` attribute (the
              potrace coordinate-space fix-up) and a CSS `transform` style —
              the CSS one replaces the attribute instead of composing with
              it. So the potrace transform stays an SVG attribute on this
              <g>, and all entrance/breathe animation lives on the wrapping
              <div> above.
            */}
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
              <path
                d={PATH_AS}
                fill="url(#monogram-shimmer)"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {/*
        Names + date — settled in place from frame one, anchored at a
        fixed position independent of the monogram's centring layer
        above, so this block never shifts the monogram off-centre.
      */}
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

      {/*
        Cinematic vignette — a static, gentle radial darkening toward the
        edges. Focuses the eye on the monogram and gives the flat
        background a sense of depth, the way a candlelit room falls off
        into shadow at its corners. Pure CSS, no animation needed: a
        vignette that pulsed would read as a lighting glitch, not mood.
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
 * Remotion-bound wrapper — the thing actually registered as a
 * <Composition> in Root.tsx. It does nothing but pull the render's
 * frame counter from `useCurrentFrame` and hand it to the frame-agnostic
 * view above. To reuse the animation in a plain React page (outside
 * Remotion), skip this wrapper and render `MonogramAnimationView`
 * directly, feeding it an elapsed-time-based frame counter instead
 * (e.g. `(elapsedMs / 1000) * 60` via requestAnimationFrame) — every
 * motion here is just a function of `frame / totalFrames`, so a
 * continuous, non-quantized counter animates it just as smoothly.
 */
export const MonogramAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  return <MonogramAnimationView frame={frame} />;
};
