import { useEffect, useRef } from "react";
// The "light" build omits lottie-web's expression engine, which uses direct
// eval() — that breaks under Vite 8's Rolldown bundler and blanked the app.
// Our ornaments are plain shape animations, so the light SVG player is all
// we need.
import lottie from "lottie-web/build/player/lottie_light";
import type { AnimationItem } from "lottie-web";

type LottiePlayerProps = {
  /** Parsed Lottie JSON (imported from ../lottie/*.json). */
  data: object;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  /** Play once when scrolled into view (default) vs. immediately on mount. */
  playOnView?: boolean;
};

/**
 * Thin wrapper around lottie-web (framework-agnostic — avoids React-version
 * peer issues). Plays once and holds on the last frame. Under
 * prefers-reduced-motion it jumps straight to the final frame, so the
 * ornament still shows, fully drawn, without animating.
 */
export function LottiePlayer({
  data,
  className,
  style,
  loop = false,
  playOnView = true,
}: LottiePlayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim: AnimationItem = lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop,
      autoplay: false,
      animationData: data,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });

    const start = () => {
      if (reduce) anim.goToAndStop(Math.max(anim.totalFrames - 1, 0), true);
      else anim.play();
    };

    let io: IntersectionObserver | null = null;
    if (playOnView && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              start();
              io?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.4 }
      );
      io.observe(el);
    } else {
      start();
    }

    return () => {
      io?.disconnect();
      anim.destroy();
    };
  }, [data, loop, playOnView]);

  return <div ref={ref} className={className} style={style} aria-hidden="true" />;
}
