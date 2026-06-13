import React from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { AmbientBokeh } from "./AmbientBokeh";
import { NAMES, DATE } from "./MonogramAnimation";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX_CENTERED_ON_CROSSING } from "./paths";

import ornamentDataRaw from "./lottie/ornament.json";
import branchesDataRaw from "./lottie/branches.json";

const ornamentData = ornamentDataRaw as LottieAnimationData;
const branchesData = branchesDataRaw as LottieAnimationData;

import {
  FRAME_VB_W,
  FRAME_VB_H,
  FRAME_X,
  FRAME_Y,
  FRAME_W,
  FRAME_H,
  FRAME_RADIUS,
  CORNER_TRANSFORMS,
  FRAME_HEIGHT_VH,
  FRAME_INNER_WIDTH_VH,
  MONOGRAM_Y_SHIFT_VH,
  NAME_RULE_LENGTH,
} from "./MonogramCrest";

// Lower than the shared NAMES_TOP_PERCENT (64%) — the Lottie crest's
// monogram sits larger/breathes wider than the plain crest's, and at 64%
// the letterforms' glow brushed the names row (68% proved too low —
// dead air between mark and names). Local override so the other crests'
// layout is untouched.
const LOTTIE_NAMES_TOP_PERCENT = "68%";

// Keeps the names/date row clear of the frame's inner border during the
// wide-letter-spacing entrance/exit, when the row is at its widest.
const TEXT_SIDE_INSET_VH = 6;

const TIMINGS = {
  totalFrames: 480,
  frameDraw: { start: 12, end: 130 },
  lottieIn: { start: 40, end: 180 },
  branchesIn: { start: 70, end: 210 },
  markIn: { start: 110, end: 220 },
  textIn: { start: 190, end: 290 },
  shimmer: { start: 300, end: 400 },
  exit: { start: 420, end: 475 },
};

const BG = "#0d0d0d";
const LETTER = "#e8c992";
const SHIMMER = "#fff6e6";
const GOLD = "#cda86a";
const SPARK_GOLD = "#d8b76a";
const SPARK_CORE = "#fff3d6";

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap');";

// Loop-mode Lottie envelope: draw on once during the crest's entrance,
// hold fully drawn through the middle, undraw during the exit. (The
// previous ping-pong counter replayed the draw 3–4 times mid-loop —
// awkward repetition — and its cycle didn't divide 900, so the branches
// also popped at the loop seam. This envelope starts and ends at 0, so
// the seam is clean by construction.)
const LOOP_DRAW = { inStart: 50, inEnd: 230, outStart: 700, outEnd: 850 };

const getLoopDrawFrame = (frame: number, op: number) => {
  const full = Math.floor(op) - 1;
  if (frame < LOOP_DRAW.inStart) return 0;
  if (frame < LOOP_DRAW.inEnd) {
    return Math.round(((frame - LOOP_DRAW.inStart) / (LOOP_DRAW.inEnd - LOOP_DRAW.inStart)) * full);
  }
  if (frame < LOOP_DRAW.outStart) return full;
  if (frame < LOOP_DRAW.outEnd) {
    return Math.round((1 - (frame - LOOP_DRAW.outStart) / (LOOP_DRAW.outEnd - LOOP_DRAW.outStart)) * full);
  }
  return 0;
};

// The crest's triple "fine engraving" border (in frame viewBox units).
// Each successive rule is inset another even step and drawn a touch finer
// and fainter — but all kept crisp and reasonably opaque, so the three
// read as three deliberate lines rather than one bold rule trailed by two
// faint, fuzzy smudges (the old 0/16/27 insets at 0.55/0.3 opacity). Even
// BORDER_STEP gaps give the regular cadence of real engraving. Local to
// the Lottie crest so tuning it doesn't perturb the other crests' shared
// insets. Each line gets a screened shimmer twin (see render) so a slow
// gold highlight travels all three.
const BORDER_STEP = 12;
const BORDER_LINES = [
  { inset: 0, width: 2.2, opacity: 1.0 },
  { inset: BORDER_STEP, width: 1.3, opacity: 0.6 },
  { inset: BORDER_STEP * 2, width: 1.0, opacity: 0.42 },
];

// The branch ornaments are clipped to the innermost (3rd) border's inner
// edge — inset BORDER_STEP*2 from the outer frame in viewBox units —
// converted to the same vh space the frame is drawn in (FRAME_HEIGHT_VH
// over the FRAME_VB_H-unit viewBox). This keeps the leaves nested inside
// all three rules rather than spilling out toward the outer line.
const INNER_BORDER_INSET = BORDER_STEP * 2;
const BRANCH_CLIP_WIDTH_VH =
  FRAME_HEIGHT_VH * ((FRAME_W - INNER_BORDER_INSET * 2) / FRAME_VB_H);
const BRANCH_CLIP_HEIGHT_VH =
  FRAME_HEIGHT_VH * ((FRAME_H - INNER_BORDER_INSET * 2) / FRAME_VB_H);

/**
 * <Lottie> has no `frame` prop — it reads the timeline via
 * useCurrentFrame internally. To drive it from our envelope in loop
 * mode, wrap it in <Freeze>, which makes children render as if the
 * timeline were at the given frame. In steady mode it freezes at the
 * final frame — every layer holds to the end, so that's the fully-drawn
 * ornament, motionless. In one-shot mode the Lottie just plays from
 * wherever its enclosing <Sequence> starts it.
 */
const CrestLottie: React.FC<{
  animationData: LottieAnimationData;
  frame: number;
  isLoop: boolean;
  steady?: boolean;
}> = ({ animationData, frame, isLoop, steady = false }) => {
  const lottie = (
    <Lottie animationData={animationData} style={{ width: "100%", height: "100%" }} />
  );
  if (steady) {
    return <Freeze frame={Math.floor(animationData.op) - 1}>{lottie}</Freeze>;
  }
  if (!isLoop) {
    return lottie;
  }
  return <Freeze frame={getLoopDrawFrame(frame, animationData.op)}>{lottie}</Freeze>;
};

export const MonogramCrestLottie: React.FC = () => {
  const frame = useCurrentFrame();
  return <MonogramCrestLottieView frame={frame} isLoop={false} />;
};

export const MonogramCrestLottieView: React.FC<{
  frame: number;
  isLoop?: boolean;
  loopPhase?: number;
  /** Steady loop mode: the crest is fully drawn and simply lives in
      place — no per-loop draw-on/undraw cycling and no Lottie replay
      (the ornaments freeze at their fully-drawn final frame). The
      entrance-free discipline of MonogramCrestLoop, applied to the
      Lottie crest; used by MonogramCrestLoopLottieV2. Implies isLoop. */
  steady?: boolean;
  /** Background override — pass "transparent" to composite the crest
      over other layers (e.g. MonogramCrestLoopLottieV2's hearth glow). */
  background?: string;
  /** The enclosing loop's real length. The Lottie crest's own TIMINGS
      is the 480-frame one-shot; a loop wrapper (e.g.
      MonogramCrestLoopLottieV2 at 900) must pass its own duration so the
      AmbientBokeh sparkles share the loop's clock and stay seamless at
      the seam. Defaults to the one-shot length. */
  loopDurationInFrames?: number;
  /** Multiplier on the names/date type size. Defaults to 1 (the
      one-shot crest's sizing); the LED-wall loop bumps it up so the
      names read from across the room. The names row clips to the frame's
      inner width regardless, so larger values can't escape the crest. */
  textScale?: number;
  /** Vertical shift of the AS mark within the crest, in vh (negative =
      up). Defaults to the shared crest balance; the LED-wall loop lifts
      it a little higher so it sits clear above the enlarged names row. */
  monogramShiftVh?: number;
  /** Top offset of the names/date row, as a CSS percentage of frame
      height. Defaults to the Lottie crest's standard; the LED-wall loop
      nudges it up a touch to tighten the gap under the lifted mark. */
  namesTopPercent?: string;
  /** Extra outward horizontal spread (vh) for the top pair of branch
      ornaments — pushes the top-left leaves further left and the
      top-right leaves further right. Defaults to 0; the loop spreads
      them out a little. */
  topBranchSpreadVh?: number;
}> = ({
  frame,
  isLoop = false,
  loopPhase = 0,
  steady = false,
  background = BG,
  loopDurationInFrames = TIMINGS.totalFrames,
  textScale = 1,
  monogramShiftVh = MONOGRAM_Y_SHIFT_VH,
  namesTopPercent = LOTTIE_NAMES_TOP_PERCENT,
  topBranchSpreadVh = 0,
}) => {
  const { fps, height } = useVideoConfig();

  // The frame and monogram are sized in vh, so they scale with the canvas
  // in both the Studio preview and the headless render. The names/date were
  // in absolute px, which only matched at the true 1080-tall render and read
  // oversized in the smaller preview viewport. Size them in vh too — derived
  // from the live composition height — so they track the crest everywhere.
  const pxToVh = (px: number) => `${(px / height) * 100}vh`;

  const exitOpacity = isLoop
    ? 1
    : interpolate(frame, [TIMINGS.exit.start, TIMINGS.exit.end], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const frameDrawOffset = steady
    ? 0
    : isLoop
    ? interpolate(
        frame,
        [50, 150, 750, 850],
        [1, 0, 0, 1]
      )
    : interpolate(
        frame,
        [TIMINGS.frameDraw.start, TIMINGS.frameDraw.end],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const frameOpacity = steady
    ? 1
    : isLoop
    ? interpolate(
        frame,
        [50, 150, 750, 850],
        [0, 1, 1, 0]
      )
    : interpolate(
        frame,
        [TIMINGS.frameDraw.start - 6, TIMINGS.frameDraw.start],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      ) * exitOpacity;

  const markOpacity = isLoop
    ? 1
    : interpolate(frame, [TIMINGS.markIn.start, TIMINGS.markIn.end], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const markInScale = isLoop
    ? 1
    : spring({
        frame: frame - TIMINGS.markIn.start,
        fps,
        config: { damping: 18, stiffness: 80, mass: 1 },
        from: 0.88,
        to: 1,
        durationInFrames: TIMINGS.markIn.end - TIMINGS.markIn.start,
      });

  const breatheRamp = isLoop
    ? 1
    : interpolate(
        frame,
        [TIMINGS.markIn.start, TIMINGS.markIn.end],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
  const breathe =
    1 + 0.014 * Math.sin((frame / fps / 6) * 2 * Math.PI) * breatheRamp;

  // In any looping mode the glow breathes with the loop instead of
  // re-ramping from zero every cycle. The one-shot entrance ramp below is
  // only correct for the non-looping crest: as a clamped interpolate it
  // ends pinned at 1, so in a loop the last frame carries full glow while
  // frame 0 has none — a visible pop at the seam. Riding loopPhase lands
  // both ends at 0.7, so the seam is clean.
  const glowStrength =
    steady || isLoop
      ? 0.7 + 0.3 * Math.sin(loopPhase)
      : interpolate(
          frame,
          [TIMINGS.markIn.start, TIMINGS.markIn.end + 40],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

  // Frame-border shimmer logic (using loopPhase passed via props or calculated)
  const totalFrames = isLoop ? TIMINGS.totalFrames : 480;
  const currentLoopPhase = isLoop ? loopPhase : (frame / totalFrames) * 2 * Math.PI;
  const framePhase = currentLoopPhase + (Math.PI * 0.6);
  const frameSweep = interpolate(Math.sin(framePhase), [-1, 1], [-0.5, 1.5]);
  const frameGlowStrength = 0.6 + 0.4 * Math.sin(framePhase);

  const glow = `drop-shadow(0 0 ${18 * glowStrength}px rgba(232, 201, 146, ${0.45 * glowStrength}))
                drop-shadow(0 0 ${48 * glowStrength}px rgba(216, 183, 106, ${0.25 * glowStrength}))`;

  // The monogram shimmer. In loop mode it rides the exact same sweep as
  // the border (frameSweep) — same value, same rotate(20) angle, both
  // gradients in object-bounding-box space over concentric boxes — so the
  // gold highlight crosses the mark and the frame together as one light
  // travelling the whole crest, rather than the mark flashing once mid-loop
  // (the old 300→400 one-shot ramp) while the border shimmered on its own
  // clock. The one-shot crest keeps that single timed sweep.
  const sweep = isLoop
    ? frameSweep
    : interpolate(
        frame,
        [TIMINGS.shimmer.start, TIMINGS.shimmer.end],
        [-0.6, 1.6],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
  const sweepOpacity = isLoop
    ? 1
    : interpolate(
        frame,
        [
          TIMINGS.shimmer.start,
          TIMINGS.shimmer.start + 30,
          TIMINGS.shimmer.end - 30,
          TIMINGS.shimmer.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const textOpacity = steady
    ? 1
    : isLoop
    ? interpolate(
        frame,
        [50, 150, 750, 850],
        [0, 1, 1, 0]
      )
    : interpolate(frame, [TIMINGS.textIn.start, TIMINGS.textIn.end], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const textRise = isLoop
    ? 0
    : interpolate(
        frame,
        [TIMINGS.textIn.start, TIMINGS.textIn.end],
        [22, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const ruleScale = isLoop
    ? 1
    : interpolate(
        frame,
        [TIMINGS.textIn.start, TIMINGS.textIn.start + 70],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const namesTracking = steady
    ? 10
    : isLoop
    ? interpolate(
        frame,
        [50, 150, 750, 850],
        [13, 10, 10, 13]
      )
    : interpolate(
        frame,
        [TIMINGS.textIn.start, TIMINGS.textIn.end],
        [13, 10],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
  const dateTracking = steady
    ? 8
    : isLoop
    ? interpolate(
        frame,
        [50, 150, 750, 850],
        [10, 8, 8, 10]
      )
    : interpolate(
        frame,
        [TIMINGS.textIn.start, TIMINGS.textIn.end],
        [10, 8],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const lottieOpacity = steady
    ? 1
    : isLoop
    ? interpolate(frame, [50, 150, 750, 850], [0, 1, 1, 0])
    : interpolate(
        frame,
        [TIMINGS.lottieIn.start, TIMINGS.lottieIn.start + 20],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const branchesOpacity = steady
    ? 0.4
    : isLoop
    ? interpolate(frame, [50, 150, 750, 850], [0, 0.4, 0.4, 0])
    : interpolate(
        frame,
        [TIMINGS.branchesIn.start, TIMINGS.branchesIn.start + 30],
        [0, 0.4],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  return (
    <AbsoluteFill style={{ background }}>
      <style>{FONT_IMPORT}</style>

      {/* Lottie Branches - Bold Large-Scale Framing along the borders */}
      {[
        { delay: 0, scale: 0.9, y: -25, x: 25, rot: 40 },
        { delay: 15, scale: 0.9, y: 25, x: 25, rot: 140 },
      ].map((cfg, pairIdx) => {
        // Top pair (pairIdx 0) can be spread further outward via
        // topBranchSpreadVh — left leaves further left, right further right.
        const x = cfg.x + (pairIdx === 0 ? topBranchSpreadVh : 0);
        return (
        <Sequence key={`pair-${pairIdx}`} from={steady ? 0 : TIMINGS.branchesIn.start + cfg.delay}>
          <AbsoluteFill
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: branchesOpacity * exitOpacity,
            }}
          >
            <div
              style={{
                width: `${BRANCH_CLIP_WIDTH_VH}vh`,
                height: `${BRANCH_CLIP_HEIGHT_VH}vh`,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Left Instance */}
              <div
                style={{
                  position: "absolute",
                  width: "50vh",
                  height: "50vh",
                  transform: `translateY(calc(${MONOGRAM_Y_SHIFT_VH}vh + ${cfg.y}vh)) translateX(-${x}vh) rotate(${cfg.rot}deg) scale(-${cfg.scale}, ${cfg.scale})`,
                  filter: "sepia(0.8) brightness(1.2) contrast(1.1) hue-rotate(-10deg)",
                  mixBlendMode: "screen",
                }}
              >
                <CrestLottie animationData={branchesData} frame={frame} isLoop={isLoop} steady={steady} />
              </div>
              {/* Right Instance - Synchronized with Left */}
              <div
                style={{
                  position: "absolute",
                  width: "50vh",
                  height: "50vh",
                  transform: `translateY(calc(${MONOGRAM_Y_SHIFT_VH}vh + ${cfg.y}vh)) translateX(${x}vh) rotate(-${cfg.rot}deg) scale(${cfg.scale})`,
                  filter: "sepia(0.8) brightness(1.2) contrast(1.1) hue-rotate(-10deg)",
                  mixBlendMode: "screen",
                }}
              >
                <CrestLottie animationData={branchesData} frame={frame} isLoop={isLoop} steady={steady} />
              </div>

            </div>
          </AbsoluteFill>
        </Sequence>
        );
      })}

      {/* Ornamental gold crest frame — a triple "fine engraving" border:
          a bold outer rule and two finer, evenly-inset rules (see
          BORDER_LINES), each shadowed by a screened shimmer twin so a slow
          gold highlight glides along all three and the gilt never sits
          flat. A soft breathing glow on the whole frame keeps it lit by
          the same candlelight as the mark. Every line draws on / undraws
          with the loop's frame envelope (frameDrawOffset / frameOpacity),
          so the border is absent at the loop seam. */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          viewBox={`0 0 ${FRAME_VB_W} ${FRAME_VB_H}`}
          style={{
            height: `${FRAME_HEIGHT_VH}vh`,
            width: "auto",
            display: "block",
            filter: `drop-shadow(0 0 ${8 * frameGlowStrength}px rgba(205, 168, 106, ${0.32 * frameGlowStrength}))`,
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

          {BORDER_LINES.map((b, i) => {
            const common = {
              x: FRAME_X + b.inset,
              y: FRAME_Y + b.inset,
              width: FRAME_W - b.inset * 2,
              height: FRAME_H - b.inset * 2,
              rx: Math.max(FRAME_RADIUS - b.inset, 4),
              fill: "none" as const,
              strokeWidth: b.width,
              pathLength: 1,
              strokeDasharray: 1,
              strokeDashoffset: frameDrawOffset,
            };
            return (
              <React.Fragment key={i}>
                {/* base gold rule */}
                <rect {...common} stroke={GOLD} opacity={frameOpacity * b.opacity} />
                {/* screened shimmer twin gliding along it */}
                <rect
                  {...common}
                  stroke="url(#frame-loop-shimmer)"
                  style={{ mixBlendMode: "screen" }}
                  opacity={frameOpacity * b.opacity}
                />
              </React.Fragment>
            );
          })}

          {/* Side-ornament gaps — small background-filled squares at each
              edge midpoint that break the rules where a side ornament sits,
              so the ornament reads as set into the frame rather than laid
              over a continuous line. DRAWN LAST, over all three rules.
              Filled with the composition background, not hard-coded black:
              over an opaque backdrop they erase cleanly, but when the crest
              is composited over the loop's hearth glow (background
              "transparent") they go transparent instead of punching dark
              squares through the glow. */}
          {[
            { cx: FRAME_X + FRAME_W / 2, cy: FRAME_Y },
            { cx: FRAME_X + FRAME_W / 2, cy: FRAME_Y + FRAME_H },
            { cx: FRAME_X, cy: FRAME_Y + FRAME_H / 2 },
            { cx: FRAME_X + FRAME_W, cy: FRAME_Y + FRAME_H / 2 },
          ].map((m, i) => (
            <rect key={`mask-${i}`} x={m.cx - 10} y={m.cy - 10} width={20} height={20} fill={background} />
          ))}
        </svg>
      </AbsoluteFill>

      {/* Lottie Frame Ornaments */}
      <Sequence from={steady ? 0 : TIMINGS.lottieIn.start}>
        <AbsoluteFill style={{ pointerEvents: "none", opacity: lottieOpacity * exitOpacity }}>
          {/* Side Center Ornaments */}
          {[
            { side: "top", rotate: 0 },
            { side: "bottom", rotate: 180 },
            { side: "left", rotate: -90 },
            { side: "right", rotate: 90 },
          ].map((s, i) => {
            const offsetH = (FRAME_H / 2) * (FRAME_HEIGHT_VH / FRAME_VB_H);
            const offsetW = (FRAME_W / 2) * (FRAME_HEIGHT_VH / FRAME_VB_H);

            return (
              <div
                key={`side-${i}`}
                style={{
                  position: "absolute",
                  top:
                    s.side === "top"
                      ? `calc(50% - ${offsetH}vh)`
                      : s.side === "bottom"
                      ? `calc(50% + ${offsetH}vh)`
                      : "50%",
                  left:
                    s.side === "left"
                      ? `calc(50% - ${offsetW}vh)`
                      : s.side === "right"
                      ? `calc(50% + ${offsetW}vh)`
                      : "50%",
                  width: "40vh",
                  height: "40vh",
                  transform: `translate(-50%, -50%) rotate(${s.rotate}deg) scale(1)`,
                  filter:
                    "brightness(1.1) contrast(1.1) drop-shadow(0 0 10px rgba(205, 168, 106, 0.3))",
                }}
              >
                <CrestLottie animationData={ornamentData} frame={frame} isLoop={isLoop} steady={steady} />
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      <div style={{ opacity: markOpacity * exitOpacity }}>
        <AmbientBokeh
          frame={frame}
          totalFrames={isLoop ? loopDurationInFrames : TIMINGS.totalFrames} // match the enclosing loop's clock when looping
          sparkColor={SPARK_GOLD}
          coreColor={SPARK_CORE}
        />
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${monogramShiftVh}vh)`,
        }}
      >
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
        <div
          style={{
            opacity: markOpacity * exitOpacity,
            transform: `scale(${markInScale * breathe * 1.2})`,
          }}
        >
          <svg
            viewBox={VIEWBOX_CENTERED_ON_CROSSING}
            style={{ height: "34vh", width: "auto", display: "block" }}
            overflow="visible"
          >
            <defs>
              <linearGradient
                id="crest-shimmer"
                gradientUnits="objectBoundingBox"
                gradientTransform={`translate(${sweep} 0) rotate(20)`}
              >
                <stop offset="35%" stopColor={SHIMMER} stopOpacity="0" />
                <stop offset="50%" stopColor={SHIMMER} stopOpacity={0.85 * sweepOpacity} />
                <stop offset="65%" stopColor={SHIMMER} stopOpacity="0" />
              </linearGradient>
            </defs>
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill={LETTER} />
              <path
                d={PATH_AS}
                fill="url(#crest-shimmer)"
                style={{ mixBlendMode: "screen" }}
              />
            </g>
          </svg>
        </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: namesTopPercent,
          left: "50%",
          maxWidth: `${FRAME_INNER_WIDTH_VH - TEXT_SIDE_INSET_VH * 2}vh`,
          overflow: "hidden",
          transform: `translate(-50%, 0) translateY(${textRise}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif",
          color: LETTER,
          opacity: textOpacity * exitOpacity,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: pxToVh(20) }}>
          <span
            style={{
              width: pxToVh(NAME_RULE_LENGTH),
              flexShrink: 1,
              minWidth: 0,
              height: 1,
              background: LETTER,
              transform: `scaleX(${ruleScale})`,
              transformOrigin: "right center",
            }}
          />
          <span style={{ flexShrink: 0, fontSize: pxToVh(30 * textScale), fontWeight: 300, letterSpacing: pxToVh(namesTracking), whiteSpace: "nowrap" }}>
            {NAMES}
          </span>
          <span
            style={{
              width: pxToVh(NAME_RULE_LENGTH),
              flexShrink: 1,
              minWidth: 0,
              height: 1,
              background: LETTER,
              transform: `scaleX(${ruleScale})`,
              transformOrigin: "left center",
            }}
          />
        </div>
        <div style={{ marginTop: pxToVh(14), fontSize: pxToVh(20 * textScale), fontWeight: 300, letterSpacing: pxToVh(dateTracking) }}>
          {DATE}
        </div>
      </div>
    </AbsoluteFill>
  );
};
