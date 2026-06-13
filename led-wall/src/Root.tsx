import React from "react";
import { Composition } from "remotion";
import { MonogramAnimation } from "./MonogramAnimation";
import { MonogramCrestLoop } from "./MonogramCrestLoop";
import { MonogramCrestLottie } from "./MonogramCrestLottie";
import { MonogramCrestLoopLottieV2 } from "./MonogramCrestLoopLottieV2";
import { MonogramNamesReveal } from "./MonogramNamesReveal";
import { MonogramEmbers } from "./MonogramEmbers";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        LED Wall composition (the backdrop)
        1920×1080 @ 60fps, 15 seconds (900 frames) — a slow, seamless
        loop suited to playing for hours behind us at the reception.
        durationInFrames must always match TIMINGS.totalFrames in
        MonogramAnimation.tsx, or the loop seam will be visible.
      */}
      <Composition
        id="MonogramAnimation"
        component={MonogramAnimation}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Crest — Lottie Version (experimental luxury)
      */}
      <Composition
        id="MonogramCrestLottie"
        component={MonogramCrestLottie}
        durationInFrames={480}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Crest — Loop Lottie V2 (candlelit)
        1920×1080 @ 60fps, 15 seconds (900 frames) — the Lottie crest
        loop over MonogramEmbers' flickering hearth-glow, with embers
        drifting up in front of the crest. durationInFrames must always
        match TIMINGS.totalFrames in MonogramCrestLoopLottieV2.tsx.
      */}
      <Composition
        id="MonogramCrestLoopLottieV2"
        component={MonogramCrestLoopLottieV2}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Crest — Loop Lottie V2, ALPHA (transparent background)
        Same 1920×1080 @ 60fps, 900-frame loop as above, but with the
        opaque warm-black fill dropped so it renders onto an alpha
        channel — a hand-off asset for the photo/video team to overlay
        on their own footage. Export as PNG (still) or a PNG sequence
        (animated); see the render commands in CLAUDE.md.
      */}
      <Composition
        id="MonogramCrestLoopLottieV2Alpha"
        component={MonogramCrestLoopLottieV2}
        defaultProps={{ transparent: true }}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Crest — Loop (the fancier, ornamental LED-wall version)
        1920×1080 @ 60fps, 15 seconds (900 frames) — the same gold
        flourish-frame crest as MonogramCrest, rebuilt as a perpetual
        seamless loop so it can run for hours on the LED wall, the same
        way MonogramAnimation does. durationInFrames must always match
        TIMINGS.totalFrames in MonogramCrestLoop.tsx.
      */}
      <Composition
        id="MonogramCrestLoop"
        component={MonogramCrestLoop}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Names Reveal (the spell-out loop)
        1920×1080 @ 60fps, 20 seconds (1200 frames) — the crest loop
        with a once-per-cycle moment where leader lines draw out from
        the A's apex and the S's tail and ARUN / SHALET cascade in
        letter by letter, hold, then slip back into the mark. The loop
        seam lives inside the settled-crest portion, so it stays
        seamless despite the "event" in the middle.
        durationInFrames must always match TIMINGS.totalFrames in
        MonogramNamesReveal.tsx.
      */}
      <Composition
        id="MonogramNamesReveal"
        component={MonogramNamesReveal}
        durationInFrames={1200}
        fps={60}
        width={1920}
        height={1080}
      />

      {/*
        Monogram Embers (the candlelit loop)
        1920×1080 @ 60fps, 15 seconds (900 frames) — frameless gold
        monogram over a flickering hearth-glow with embers drifting
        upward. Flicker is layered whole-cycle sinusoids and each ember
        climbs a whole number of times per loop, so it stays seamless.
        durationInFrames must always match TIMINGS.totalFrames in
        MonogramEmbers.tsx.
      */}
      <Composition
        id="MonogramEmbers"
        component={MonogramEmbers}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
