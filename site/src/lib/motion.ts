import type { Variants } from "framer-motion";

/**
 * Shared framer-motion variants. Keep the vocabulary small so every page
 * feels part of the same set. All of these are transform/opacity only.
 */

/** Container that staggers its children in. */
export const stagger = (delay = 0, step = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren: delay, staggerChildren: step },
  },
});

/** A child that fades + rises. The default reveal across the site. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Gentle scale-in for the monogram / focal marks. */
export const bloom: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Page-level enter/exit used by the route transition. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], when: "beforeChildren" },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
};
