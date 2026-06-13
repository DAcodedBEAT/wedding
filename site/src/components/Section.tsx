import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";
import { tick } from "../lib/haptics";

export type SectionDef = { id: string; label: string };

/** Sticky pill row that jumps between the anchored sections of a page. */
export function SectionNav({ items }: { items: SectionDef[] }) {
  return (
    <div className="sticky top-3 z-20 mb-9 flex justify-center">
      <div className="flex gap-0.5 rounded-full border border-gold/30 bg-ivory-50/85 px-1.5 py-1 shadow-card backdrop-blur-xl">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={() => tick()}
            className="rounded-full px-3 py-1.5 font-sans text-[11px] uppercase tracking-widest text-lilac-700 transition-colors hover:text-gold-deep"
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** An anchored sub-section with a small centred heading. Reveals on scroll. */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      variants={stagger(0, 0.08)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      className="scroll-mt-20 pt-10 first:pt-0"
    >
      <motion.div variants={fadeUp} className="mb-5 text-center">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <div className="foil-rule mx-auto mt-3 h-px w-16" />
      </motion.div>
      {children}
    </motion.section>
  );
}
