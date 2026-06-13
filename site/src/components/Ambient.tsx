import { useEffect, useRef } from "react";

/**
 * Ambient backdrop: a warm hearth glow, drifting embers, and soft bokeh
 * that occasionally flares — ported from the LED-wall loop's
 * MonogramEmbers (EmberField) + AmbientBokeh, but drawn on a single
 * <canvas> with requestAnimationFrame instead of ~100 React-updated DOM
 * nodes, so it stays smooth on phones. Tuned warm-gold for the ivory
 * theme. Pauses when the tab is hidden; renders a single still frame
 * under prefers-reduced-motion.
 *
 * The seeded particle fields mirror the originals so the motion character
 * matches the video.
 */

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999.7) * 10000;
  return x - Math.floor(x);
};
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// ── Embers (from MonogramEmbers.EMBERS) ────────────────────────────────
const EMBER_TRAVEL_TOP = -12;
const EMBER_TRAVEL_RANGE = 124;
const EMBERS = Array.from({ length: 20 }, (_, i) => {
  const r1 = seededRandom(i * 1.37 + 3);
  const r2 = seededRandom(i * 2.71 + 11);
  const r3 = seededRandom(i * 3.91 + 17);
  const r4 = seededRandom(i * 5.23 + 23);
  const r5 = seededRandom(i * 6.47 + 31);
  const r6 = seededRandom(i * 7.91 + 41);
  return {
    baseXPct: 4 + r1 * 92,
    yOffset: r2,
    wraps: 1 + Math.round(r3),
    size: 2.2 + r4 * 3.6,
    swayAmpPct: 0.8 + r5 * 2.4,
    swayCycles: 1 + Math.round(r5 * 2),
    swayPhase: r6 * Math.PI * 2,
    twinkleCycles: 2 + Math.round(r6 * 3),
    twinklePhase: r1 * Math.PI * 2,
    baseOpacity: 0.3 + r2 * 0.4,
  };
});

// ── Bokeh (from AmbientBokeh.PARTICLES) ────────────────────────────────
const BOKEH = Array.from({ length: 24 }, (_, i) => {
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
    driftXPct: 16 + r4 * 46,
    driftYPct: 22 + r5 * 56,
    phase: r1 * Math.PI * 2,
    twinklePhase: r6 * Math.PI * 2,
    twinkleSpeed: Math.round(1 + r2 * 2),
    baseOpacity: 0.08 + r3 * 0.16,
    sparkly: r7 > 0.45,
    glintLength: 14 + r7 * 24,
  };
});

// Warm-gold palette for the light ivory theme
const EMBER_HOT = "255,213,160";
const EMBER_BODY = "224,140,60";
const BOKEH_HALO = "216,183,106";
const BOKEH_CORE = "255,243,214";

const LOOP_SECONDS = 26; // slow, calm cycle

export function Ambient() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawDot = (x: number, y: number, r: number, rgb: string, alpha: number) => {
      if (alpha <= 0.004 || r <= 0) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (t: number) => {
      const phase01 = (t / LOOP_SECONDS) % 1;
      const loopPhase = phase01 * Math.PI * 2;
      ctx.clearRect(0, 0, w, h);

      // Hearth glow — broad warm wash low-centre, gently breathing.
      const flicker =
        0.72 +
        0.14 * Math.sin(loopPhase * 3 + 1.3) +
        0.09 * Math.sin(loopPhase * 7 + 4.1) +
        0.05 * Math.sin(loopPhase * 13 + 2.2);
      const hg = ctx.createRadialGradient(
        w / 2,
        h * 0.62,
        0,
        w / 2,
        h * 0.62,
        Math.max(w, h) * 0.7
      );
      hg.addColorStop(0, `rgba(${BOKEH_HALO},${0.1 * flicker})`);
      hg.addColorStop(1, `rgba(${BOKEH_HALO},0)`);
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, w, h);

      // Embers — rise + sway + twinkle, fading near the wrap edges.
      ctx.globalCompositeOperation = "source-over";
      for (const e of EMBERS) {
        const climb = (phase01 * e.wraps + e.yOffset) % 1;
        const y = ((EMBER_TRAVEL_TOP + (1 - climb) * EMBER_TRAVEL_RANGE) / 100) * h;
        const x =
          ((e.baseXPct + e.swayAmpPct * Math.sin(loopPhase * e.swayCycles + e.swayPhase)) /
            100) *
          w;
        const twinkle = 0.55 + 0.45 * Math.sin(loopPhase * e.twinkleCycles + e.twinklePhase);
        const edgeFade = smooth(climb / 0.12) * (1 - smooth((climb - 0.88) / 0.12));
        const alpha = e.baseOpacity * twinkle * edgeFade;
        drawDot(x, y, e.size * 3.2, EMBER_BODY, alpha * 0.5);
        drawDot(x, y, e.size * 1.2, EMBER_HOT, alpha);
      }

      // Bokeh — soft halos with brief hot flares + the occasional glint.
      for (const p of BOKEH) {
        const drift = loopPhase + p.phase;
        const x = ((p.baseXPct + (p.driftXPct / 19.2) * Math.cos(drift)) / 100) * w;
        const y = ((p.baseYPct + (p.driftYPct / 10.8) * Math.sin(drift)) / 100) * h;
        const flarePhase = loopPhase * p.twinkleSpeed + p.twinklePhase;
        const glow = 0.5 + 0.5 * Math.sin(flarePhase);
        const flash = Math.max(0, Math.sin(flarePhase)) ** 5;

        drawDot(x, y, p.size * 2.6, BOKEH_HALO, p.baseOpacity * (0.4 + 0.6 * glow));
        drawDot(x, y, p.size * (0.9 + flash), BOKEH_CORE, 0.12 + flash * 0.6);

        if (p.sparkly && flash > 0.05) {
          const len = p.glintLength * (0.35 + flash * 0.65);
          const grad = (horizontal: boolean) => {
            const g = horizontal
              ? ctx.createLinearGradient(x - len, y, x + len, y)
              : ctx.createLinearGradient(x, y - len, x, y + len);
            g.addColorStop(0, `rgba(${BOKEH_CORE},0)`);
            g.addColorStop(0.5, `rgba(${BOKEH_CORE},${flash})`);
            g.addColorStop(1, `rgba(${BOKEH_CORE},0)`);
            return g;
          };
          ctx.strokeStyle = grad(true);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x - len, y);
          ctx.lineTo(x + len, y);
          ctx.stroke();
          ctx.strokeStyle = grad(false);
          ctx.beginPath();
          ctx.moveTo(x, y - len);
          ctx.lineTo(x, y + len);
          ctx.stroke();
        }
      }
    };

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      render((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduce) {
        raf = requestAnimationFrame(loop);
      }
    };

    if (reduce) {
      render(0); // single still frame
    } else {
      raf = requestAnimationFrame(loop);
      document.addEventListener("visibilitychange", onVis);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-vignette"
      aria-hidden="true"
    />
  );
}
