import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "../../components/PageShell";
import { Section, SectionNav, type SectionDef } from "../../components/Section";
import { SeatingFinder } from "../../components/SeatingFinder";
import { VenueCard } from "../../components/VenueCard";
import { LinkCard } from "../../components/LinkCard";
import { GoldText } from "../../components/GoldText";
import { fadeUp, stagger } from "../../lib/motion";
import { requireFeature } from "../../lib/feature-guard";
import { reception } from "../../data/reception";
import { wedding } from "../../config/wedding";

export const Route = createFileRoute("/reception/")({
  beforeLoad: requireFeature("reception"),
  component: ReceptionIndex,
});

const SECTIONS: SectionDef[] = [
  { id: "venue", label: "Venue" },
  { id: "seating", label: "Seating" },
  { id: "schedule", label: "Schedule" },
  ...(wedding.features.registry ? [{ id: "gift", label: "Gift" }] : []),
];

const GiftIcon = (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 9v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9" />
    <rect x="3" y="6" width="18" height="3" rx="0.6" />
    <path d="M12 6v13.5" />
    <path d="M12 6S11 3 9.2 3 7 5.6 9 6h3ZM12 6s1-3 2.8-3 2.2 2.6.2 3h-3Z" />
  </svg>
);

function ReceptionIndex() {
  return (
    <PageShell eyebrow="Let's celebrate" title="The Reception">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-7 text-center font-display text-lg italic leading-relaxed text-lilac-800/90"
      >
        {reception.intro}
      </motion.p>

      <SectionNav items={SECTIONS} />

      <div className="space-y-2">
        <Section id="venue" title="Venue & Timing">
          <VenueCard venue={reception.venue} />
        </Section>

        <Section id="seating" title="Find Your Seat">
          <motion.div variants={fadeUp}>
            <SeatingFinder />
          </motion.div>
        </Section>

        <Section id="schedule" title="Schedule">
          <motion.ol
            variants={stagger(0, 0.09)}
            className="relative ml-2 space-y-7 border-l border-gold/25 pl-7"
          >
            {reception.schedule.map((item) => (
              <motion.li key={`${item.time}-${item.title}`} variants={fadeUp} className="relative">
                <span className="absolute -left-[34px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-gold/50 bg-ivory-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                {item.time && (
                  <GoldText as="p" className="text-sm font-medium uppercase tracking-widest">
                    {item.time}
                  </GoldText>
                )}
                <p className="mt-0.5 font-display text-xl text-ink">{item.title}</p>
                {item.detail && <p className="font-sans text-sm text-lilac-700">{item.detail}</p>}
              </motion.li>
            ))}
          </motion.ol>
        </Section>

        {wedding.features.registry && (
          <Section id="gift" title="Forgot to give a gift?">
            <motion.p
              variants={fadeUp}
              className="mb-4 text-center font-sans text-sm text-lilac-700"
            >
              No worries — our registry is only a tap away.
            </motion.p>
            <LinkCard
              to={wedding.registryUrl}
              title="Our Registry on Zola"
              blurb="Gifts & contributions"
              icon={GiftIcon}
              external
            />
          </Section>
        )}
      </div>
    </PageShell>
  );
}
