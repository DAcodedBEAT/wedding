import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { GoldText } from "./GoldText";
import { Flourish } from "./Flourish";
import { fadeUp, stagger } from "../lib/motion";

type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  /** Wider column for content-heavy pages (booklet). */
  wide?: boolean;
};

/** Shared page chrome: padded column, animated header + flourish. */
export function PageShell({
  eyebrow,
  title,
  children,
  className = "",
  wide = false,
}: PageShellProps) {
  return (
    <div
      className={`relative z-10 mx-auto w-full px-5 pb-28 pt-14 ${wide ? "max-w-2xl" : "max-w-xl"} ${className}`}
    >
      <motion.header
        className="mb-8 text-center"
        variants={stagger(0, 0.12)}
        initial="hidden"
        animate="show"
      >
        {eyebrow && (
          <motion.p
            variants={fadeUp}
            className="mb-3 font-sans text-xs uppercase tracking-widest3 text-lilac-600"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.div variants={fadeUp}>
          <GoldText as="h1" className="text-4xl font-light sm:text-5xl">
            {title}
          </GoldText>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-5">
          <Flourish />
        </motion.div>
      </motion.header>
      {children}
    </div>
  );
}
