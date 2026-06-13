import { LottiePlayer } from "./LottiePlayer";
import ornament from "../lottie/ornament.json";

type FlourishProps = {
  className?: string;
  /** Rendered width in px (height follows the 850×300 art ratio). */
  width?: number;
};

// The ornament Lottie (shared with the LED-wall crest) — a gold flourish
// that draws itself on. Used as the divider everywhere instead of a plain
// SVG rule, to tie the site to the animated crest.
const ART_RATIO = 300 / 850;

export function Flourish({ className = "", width = 260 }: FlourishProps) {
  return (
    <div className={`mx-auto ${className}`} aria-hidden="true">
      <LottiePlayer
        data={ornament}
        style={{ width, height: width * ART_RATIO }}
        className="mx-auto"
      />
    </div>
  );
}
