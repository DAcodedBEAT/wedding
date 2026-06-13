import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeUp } from "../lib/motion";
import { tick } from "../lib/haptics";

type LinkCardProps = {
  to: string;
  title: string;
  blurb?: string;
  icon?: ReactNode;
  /** External link (renders an <a> + opens in a new tab). */
  external?: boolean;
};

const inner = (title: string, blurb?: string, icon?: ReactNode) => (
  <>
    {icon && (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-ivory-50/70 text-gold-deep">
        {icon}
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block font-display text-xl text-ink">{title}</span>
      {blurb && <span className="block font-sans text-sm text-lilac-700">{blurb}</span>}
    </span>
    <svg className="h-5 w-5 shrink-0 text-gold-deep/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  </>
);

/** A glass card that navigates somewhere — the section-page building block. */
export function LinkCard({ to, title, blurb, icon, external }: LinkCardProps) {
  const className =
    "glass-card flex items-center gap-4 px-5 py-4 transition-transform active:scale-[0.98]";

  return (
    <motion.div variants={fadeUp}>
      {external ? (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => tick()}
          className={className}
        >
          {inner(title, blurb, icon)}
        </a>
      ) : (
        <Link to={to} onClick={() => tick()} className={className}>
          {inner(title, blurb, icon)}
        </Link>
      )}
    </motion.div>
  );
}
