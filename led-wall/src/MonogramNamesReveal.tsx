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
  FRAME_Y,
  MONOGRAM_Y_SHIFT_VH,
  NAME_RULE_LENGTH,
  NAMES_TOP_PERCENT,
} from "./MonogramCrest";
import { NAMES, DATE } from "./MonogramAnimation";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX_CENTERED_ON_CROSSING } from "./paths";

/**
 * MonogramNamesReveal
 *
 * The crest loop with a recurring "unweaving" moment: once per cycle
 * the interlocked monogram genuinely comes apart into its two
 * letterforms — the A (with its left leg, crossbar swash and curling
 * swash-descender) glides up-left, the S (top curve, middle diagonal,
 * bottom bowl) glides down-right — and each becomes the drop-cap
 * initial of its name: A·RUN above, S·HALET below, the small-cap
 * letters dealt out from behind each initial. They hold, then the
 * letters tuck back in and the two pieces weave back into the crest.
 *
 * The traced monogram is a single connected silhouette (see paths.ts),
 * so the letters can't be split by subpath. Instead, a hand-fitted
 * partition polygon (S_CLIP_D below) follows the boundary between the
 * two letters through every junction; clipping the silhouette with the
 * polygon yields the S, and with its even-odd complement yields the A.
 * The cuts sit where the strokes genuinely merge, so each separated
 * piece reads as a complete letter: the S's top curve stays continuous
 * where it weaves over the A's descender (the A keeps a clean gap
 * there), the merged middle stroke splits down its centreline, and the
 * A's terminal curl and the S's bowl part tip-to-tip at their thinnest
 * point. At rest the two clipped pieces tile back into exactly the
 * original silhouette (same polygon both ways), with the unclipped
 * path crossfaded on top at the seam for sub-pixel insurance.
 *
 * Loop-safe: the whole reveal is one smooth periodic window of the
 * loop phase that is exactly 0 at the seam, so frame 0 and the final
 * frame are the identical settled crest.
 *
 * Sequence (normalized loop time t):
 *   0.00–0.20  settled crest (the seam lives in here)
 *   0.20–0.36  pieces glide apart; letters cascade out
 *   0.36–0.74  drop-cap lockup holds, breathing
 *   0.74–0.90  letters tuck back; pieces weave together
 *   0.90–1.00  settled crest again
 */

const TIMINGS = {
  totalFrames: 1200, // 20s @ 60fps — matches durationInFrames in Root.tsx
  breatheCyclesPerLoop: 1,
  shimmerCyclesPerLoop: 1,
  frameShimmerCyclesPerLoop: 1,
  reveal: { riseStart: 0.2, riseEnd: 0.36, fallStart: 0.74, fallEnd: 0.9 },
};

// Gold palette — matches MonogramCrest
const BG = "#0d0d0d";
const LETTER = "#e8c992";
const SHIMMER = "#fff6e6";
const GOLD = "#cda86a";
const SPARK_GOLD = "#d8b76a";
const SPARK_CORE = "#fff3d6";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap');";

const FRAME_PHASE_OFFSET = Math.PI * 0.6;

// ── The letter partition ───────────────────────────────────────────────────
// Hand-fitted polygon in VIEWBOX_CENTERED_ON_CROSSING coordinates tracing
// the A/S boundary through every stroke junction (verified against
// two-colour renders; vertices follow real stroke edges):
//  - down the gap between the A's apex and the S's top curve,
//  - across the descender along the S-curve's edges (the S weaves over),
//  - down the centreline of the merged middle stroke,
//  - around the bowl's inner-top rim,
//  - tip-to-tip through the thin point where the A's terminal curl
//    meets the S's bowl ring,
//  - then out and around the right/bottom to enclose the rest of the S.
const S_CLIP_D = [
  "M 1280 349",
  "L 1278 430",
  "L 1272 475",
  "L 1252 515",
  "L 1242 575",
  "L 1262 640",
  "L 1320 660",
  "L 1368 672",
  "L 1390 750",
  "L 1430 850",
  "L 1470 950",
  "L 1510 1050",
  "L 1550 1150",
  "L 1590 1250",
  "L 1615 1310",
  "L 1640 1420",
  "L 1660 1500",
  "L 1668 1525",
  "L 1620 1565",
  "L 1560 1590",
  "L 1500 1605",
  "L 1440 1622",
  "L 1372 1650",
  "L 1318 1695",
  "L 1050 1620",
  "L 557 1610",
  "L 557 2207",
  "L 2414 2207",
  "L 2414 349",
  "Z",
].join(" ");

// The A's clip is the even-odd complement: a rectangle generously
// covering the whole viewBox with the S polygon as a hole.
const A_CLIP_D = `M -1000 -1000 H 4000 V 4000 H -1000 Z ${S_CLIP_D}`;

// Piece centres (visual bbox centres, viewBox coords) — the anchor each
// piece scales/rotates about while gliding.
const A_CENTER = { x: 1170, y: 1025 };
const S_CENTER = { x: 1825, y: 1310 };

// Drop-cap lockup targets at full reveal: where each piece's centre
// lands, its scale, and a touch of rotation for life in the glide.
const A_TARGET = { x: 850, y: 870, scale: 0.62, rotate: -3 };
const S_TARGET = { x: 1180, y: 1940, scale: 0.62, rotate: 3 };

// The small-cap letters completing each name, dealt out from behind the
// initials. Positions are viewBox units, baseline-anchored.
const RUN_LETTERS = "RUN".split("");
const HALET_LETTERS = "HALET".split("");
const WORD_FONT_SIZE = 190;
const WORD_ADVANCE = 215;
const RUN_START = { x: 1280, y: 985 };
const HALET_START = { x: 1640, y: 2045 };
const LETTER_STAGGER = 0.16;

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// Composes the glide transform for a piece: identity at r=0, the
// drop-cap target at r=1, scaling/rotating about the piece's own centre.
const pieceTransform = (
  center: { x: number; y: number },
  target: { x: number; y: number; scale: number; rotate: number },
  r: number
) => {
  const s = 1 + (target.scale - 1) * r;
  const cx = center.x + (target.x - center.x) * r;
  const cy = center.y + (target.y - center.y) * r;
  return `translate(${cx - s * center.x} ${cy - s * center.y}) scale(${s}) rotate(${target.rotate * r} ${center.x} ${center.y})`;
};

export const MonogramNamesRevealView: React.FC<{ frame: number }> = ({ frame }) => {
  const loopPhase = (frame / TIMINGS.totalFrames) * 2 * Math.PI;
  const t = frame / TIMINGS.totalFrames;

  // ── The reveal window: 0 → 1 → 0, smooth, exactly 0 at the seam ─────────
  const { riseStart, riseEnd, fallStart, fallEnd } = TIMINGS.reveal;
  const reveal =
    smooth((t - riseStart) / (riseEnd - riseStart)) *
    (1 - smooth((t - fallStart) / (fallEnd - fallStart)));

  // Letters start cascading once the pieces are well on their way.
  const letterDriver = smooth((reveal - 0.45) / 0.55);

  // ── The usual crest-loop motion ──────────────────────────────────────────
  const breathe = 1 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glowStrength = 0.7 + 0.3 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop);
  const glow = `drop-shadow(0 0 ${18 * glowStrength}px rgba(232, 201, 146, ${0.45 * glowStrength}))
                drop-shadow(0 0 ${48 * glowStrength}px rgba(216, 183, 106, ${0.25 * glowStrength}))`;

  const sweep = interpolate(
    Math.sin(loopPhase * TIMINGS.shimmerCyclesPerLoop),
    [-1, 1],
    [-0.5, 1.5]
  );

  const echoBreathe =
    1.05 + 0.014 * Math.sin(loopPhase * TIMINGS.breatheCyclesPerLoop + Math.PI / 2);

  const framePhase = loopPhase * TIMINGS.frameShimmerCyclesPerLoop + FRAME_PHASE_OFFSET;
  const frameSweep = interpolate(Math.sin(framePhase), [-1, 1], [-0.5, 1.5]);
  const frameGlowStrength = 0.6 + 0.4 * Math.sin(framePhase);

  const aTransform = pieceTransform(A_CENTER, A_TARGET, reveal);
  const sTransform = pieceTransform(S_CENTER, S_TARGET, reveal);

  // Per-letter cascade: staggered 0..1 windows of the letter driver; the
  // mapping runs in reverse on the retract (last letters tuck in first).
  const letterProgress = (i: number, n: number) =>
    smooth((letterDriver - i * LETTER_STAGGER) / (1 - (n - 1) * LETTER_STAGGER));

  // Sub-pixel seam insurance: the unclipped silhouette sits on top while
  // the crest is at rest and vanishes the instant the pieces start moving.
  const wholeOpacity = 1 - Math.min(1, reveal * 10);

  const renderPiece = (
    clipId: string,
    transform: string,
    shimmerId: string
  ) => (
    <g transform={transform}>
      <g clipPath={`url(#${clipId})`}>
        <g transform={POTRACE_TRANSFORM}>
          <path d={PATH_AS} fill={LETTER} />
          <path d={PATH_AS} fill={`url(#${shimmerId})`} style={{ mixBlendMode: "screen" }} />
        </g>
      </g>
    </g>
  );

  return (
    <AbsoluteFill style={{ background: BG }}>
      <style>{FONT_IMPORT}</style>

      <AmbientBokeh frame={frame} totalFrames={TIMINGS.totalFrames} sparkColor={SPARK_GOLD} coreColor={SPARK_CORE} />

      {/* Ornamental gold crest frame — identical to MonogramCrestLoop. */}
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
              id="reveal-frame-shimmer"
              gradientUnits="objectBoundingBox"
              gradientTransform={`translate(${frameSweep} 0) rotate(20)`}
            >
              <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
              <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.8} />
              <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x={FRAME_X} y={FRAME_Y} width={FRAME_W} height={FRAME_H} rx={FRAME_RADIUS} fill="none" stroke={GOLD} strokeWidth={2} />
          <rect
            x={FRAME_X}
            y={FRAME_Y}
            width={FRAME_W}
            height={FRAME_H}
            rx={FRAME_RADIUS}
            fill="none"
            stroke="url(#reveal-frame-shimmer)"
            strokeWidth={2}
            style={{ mixBlendMode: "screen" }}
          />
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

          {CORNER_TRANSFORMS.map((tr, i) => (
            <g key={i} transform={tr}>
              <g transform={`scale(${CORNER_CLUSTER_SCALE})`}>
                <path d={CORNER_FLOURISH} fill="none" stroke={GOLD} strokeWidth={2} />
                <path d={CORNER_FLOURISH} fill="none" stroke="url(#reveal-frame-shimmer)" strokeWidth={2} style={{ mixBlendMode: "screen" }} />
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

      {/* Monogram pieces + drop-cap words. Everything lives in one svg in
          viewBox coordinates so the clips, glides and words all share the
          same space and breathe together. */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${MONOGRAM_Y_SHIFT_VH}vh)`,
        }}
      >
        {/* Depth echo — fades while the pieces are apart (a blurred echo
            of the assembled mark under a disassembled one would read as
            a ghost of the wrong shape). */}
        <div
          style={{
            position: "absolute",
            transform: `scale(${echoBreathe})`,
            filter: "blur(12px)",
            opacity: 0.22 * (1 - reveal),
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
                  id="reveal-mark-shimmer"
                  gradientUnits="objectBoundingBox"
                  gradientTransform={`translate(${sweep} 0) rotate(20)`}
                >
                  <stop offset="42%" stopColor={SHIMMER} stopOpacity="0" />
                  <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.85} />
                  <stop offset="58%" stopColor={SHIMMER} stopOpacity="0" />
                </linearGradient>
                <clipPath id="reveal-s-clip" clipPathUnits="userSpaceOnUse">
                  <path d={S_CLIP_D} />
                </clipPath>
                <clipPath id="reveal-a-clip" clipPathUnits="userSpaceOnUse">
                  <path d={A_CLIP_D} clipRule="evenodd" />
                </clipPath>
              </defs>

              {/* The two letterform pieces, gliding apart and back */}
              {renderPiece("reveal-a-clip", aTransform, "reveal-mark-shimmer")}
              {renderPiece("reveal-s-clip", sTransform, "reveal-mark-shimmer")}

              {/* Seam insurance at rest — see comment on wholeOpacity */}
              {wholeOpacity > 0 && (
                <g transform={POTRACE_TRANSFORM} opacity={wholeOpacity}>
                  <path d={PATH_AS} fill={LETTER} />
                  <path d={PATH_AS} fill="url(#reveal-mark-shimmer)" style={{ mixBlendMode: "screen" }} />
                </g>
              )}

              {/* RUN — dealt out from behind the A drop-cap */}
              {RUN_LETTERS.map((ch, i) => {
                const p = letterProgress(i, RUN_LETTERS.length);
                return (
                  <text
                    key={`r${i}`}
                    x={RUN_START.x + i * WORD_ADVANCE}
                    y={RUN_START.y}
                    fill={LETTER}
                    fontSize={WORD_FONT_SIZE}
                    fontWeight={300}
                    fontFamily="'Jost', 'Helvetica Neue', Arial, sans-serif"
                    opacity={p}
                    transform={`translate(${(1 - p) * -130} 0)`}
                  >
                    {ch}
                  </text>
                );
              })}

              {/* HALET — dealt out from behind the S drop-cap */}
              {HALET_LETTERS.map((ch, i) => {
                const p = letterProgress(i, HALET_LETTERS.length);
                return (
                  <text
                    key={`h${i}`}
                    x={HALET_START.x + i * WORD_ADVANCE}
                    y={HALET_START.y}
                    fill={LETTER}
                    fontSize={WORD_FONT_SIZE}
                    fontWeight={300}
                    fontFamily="'Jost', 'Helvetica Neue', Arial, sans-serif"
                    opacity={p}
                    transform={`translate(${(1 - p) * -130} 0)`}
                  >
                    {ch}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      {/* Names + date — the settled row, crossfading away while the
          drop-cap lockup is out so the names never appear twice. */}
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
          opacity: 1 - reveal,
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

/** Remotion-bound wrapper — see MonogramAnimation's wrapper for the pattern. */
export const MonogramNamesReveal: React.FC = () => {
  const frame = useCurrentFrame();
  return <MonogramNamesRevealView frame={frame} />;
};
