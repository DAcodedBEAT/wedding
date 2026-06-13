import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MonogramCrestLottieView } from "./MonogramCrestLottie";
import { candleFlicker, EmberField } from "./MonogramEmbers";

/**
 * MonogramCrestLoopLottieV2
 *
 * The Lottie crest loop dressed in MonogramEmbers' candlelight: the
 * same ornamental Lottie crest as MonogramCrestLoopLottie, with a
 * flickering hearth-glow wash and embers drifting up through the
 * scene. The hearth sits behind the crest; the embers drift in front
 * of it (screen-blended warm sparks reading as atmosphere between the
 * crest and the viewer).
 *
 * The crest animates in at the top of each cycle and away at the end
 * (the loop mode's entrance/exit windows), but the Lottie ornaments
 * draw on exactly once with that entrance, hold fully drawn through
 * the middle, and undraw with the exit — no mid-loop replay (the old
 * ping-pong counter redrew them 3–4 times per cycle, which read as
 * awkward repetition; see LOOP_DRAW in MonogramCrestLottie.tsx).
 *
 * Loop-safety: the flicker is layered whole-cycle sinusoids, each
 * ember climbs the screen a whole number of times per loop (see
 * MonogramEmbers), and the crest's entrance/exit envelopes all start
 * and end at zero, so frame 0 and the final frame match.
 *
 * `transparent` drops the opaque warm-black fill so the loop renders
 * onto an alpha channel — the crest, glow and embers composite over
 * transparency for the photo/video team to lay over their own footage.
 * The MonogramCrestLoopLottieV2Alpha composition in Root.tsx is this
 * variant; export it as a PNG (still) or PNG sequence (animated) to get
 * alpha. The crest view is already fed background="transparent", so its
 * own mask rects stay invisible rather than punching black squares.
 */

const TIMINGS = {
  totalFrames: 900, // 15s @ 60fps — matches durationInFrames in Root.tsx
};

const BG = "#0c0a09"; // MonogramEmbers' slightly-warm black
const HEARTH = "rgba(232, 170, 100, 0.16)";

export const MonogramCrestLoopLottieV2: React.FC<{ transparent?: boolean }> = ({
  transparent = false,
}) => {
  const frame = useCurrentFrame();
  const loopPhase = (frame / TIMINGS.totalFrames) * 2 * Math.PI;
  const flicker = candleFlicker(loopPhase);

  return (
    <AbsoluteFill style={{ background: transparent ? "transparent" : BG }}>
      {/* Hearth glow — a broad warm wash behind the crest whose strength
          rides the candle flicker, centred a little low like candles at
          table height. */}
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

      {/* The ornamental Lottie crest — animating in and away each cycle,
          Lottie ornaments drawing once per cycle (no replay), composited
          over the hearth glow */}
      <MonogramCrestLottieView
        frame={frame % TIMINGS.totalFrames}
        isLoop={true}
        loopPhase={loopPhase}
        loopDurationInFrames={TIMINGS.totalFrames}
        textScale={1.18}
        monogramShiftVh={-8}
        namesTopPercent="67%"
        topBranchSpreadVh={4}
        background="transparent"
      />

      {/* Embers drifting up in front of the crest — atmosphere between
          the crest and the viewer. Screen blend keeps them reading as
          light, never as dark specks over the gold. */}
      <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
        <EmberField frame={frame} totalFrames={TIMINGS.totalFrames} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
