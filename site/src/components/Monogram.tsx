import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PATH_AS, POTRACE_TRANSFORM, VIEWBOX } from "../lib/monogram-path";

type MonogramProps = {
  className?: string;
  /** Animate in (bloom + a single light sweep). */
  draw?: boolean;
  /** Delay (s) before the entrance starts. */
  delay?: number;
  /** Solid colour instead of the foil gradient (e.g. a watermark). */
  solid?: string;
  /** Thin outline for legibility on light backgrounds. */
  border?: boolean;
  title?: string;
};

const BORDER = "#6f5326"; // deep bronze — lifts the foil off the ivory

/**
 * The A&S monogram mark (path shared with the LED-wall project via
 * src/lib/monogram-path.ts). Foil-gradient fill with an optional bronze
 * outline; entrance is a smooth scale/opacity bloom plus one gold light
 * sweep across the mark — no stroke-draw, so nothing jitters.
 */
export function Monogram({
  className,
  draw = false,
  delay = 0,
  solid,
  border = true,
  title,
}: MonogramProps) {
  const id = useId().replace(/:/g, "");
  const gradId = `foil-${id}`;
  const sheenId = `sheen-${id}`;
  const maskId = `mask-${id}`;
  const reduce = useReducedMotion();
  const fill = solid ?? `url(#${gradId})`;
  const animate = draw && !reduce;

  // viewBox bounds for sizing the sweep rect + mask region.
  const [vx, vy, vw, vh] = VIEWBOX.split(" ").map(Number);

  return (
    <svg
      viewBox={VIEWBOX}
      className={className}
      role="img"
      aria-label={title ?? "Arun and Shalet monogram"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9c7b3f" />
          <stop offset="30%" stopColor="#cda86a" />
          <stop offset="50%" stopColor="#f6e7c8" />
          <stop offset="70%" stopColor="#cda86a" />
          <stop offset="100%" stopColor="#8a6a35" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff6e6" stopOpacity="0" />
          <stop offset="50%" stopColor="#fffaf0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff6e6" stopOpacity="0" />
        </linearGradient>
        {animate && (
          <mask id={maskId} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            <g transform={POTRACE_TRANSFORM}>
              <path d={PATH_AS} fill="#fff" />
            </g>
          </mask>
        )}
      </defs>

      <motion.g
        initial={animate ? { opacity: 0, scale: 0.94 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
        style={{ transformOrigin: "center" }}
      >
        <g transform={POTRACE_TRANSFORM}>
          <path
            d={PATH_AS}
            fill={fill}
            stroke={border ? BORDER : "none"}
            strokeWidth={border ? 1 : 0}
            strokeOpacity={0.55}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </g>

        {/* one-time gold light sweep, clipped to the mark */}
        {animate && (
          <g mask={`url(#${maskId})`}>
            <motion.rect
              y={vy}
              height={vh}
              width={vw * 0.6}
              fill={`url(#${sheenId})`}
              initial={{ x: vx - vw }}
              animate={{ x: vx + vw }}
              transition={{ duration: 1.3, ease: "easeInOut", delay: delay + 0.9 }}
            />
          </g>
        )}
      </motion.g>
    </svg>
  );
}
