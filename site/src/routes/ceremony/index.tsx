import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "../../components/PageShell";
import { Section, SectionNav, type SectionDef } from "../../components/Section";
import { LinkCard } from "../../components/LinkCard";
import { VenueCard } from "../../components/VenueCard";
import { PhotoList } from "../../components/PhotoList";
import { fadeUp } from "../../lib/motion";
import { requireFeature } from "../../lib/feature-guard";
import { ceremony } from "../../data/ceremony";

export const Route = createFileRoute("/ceremony/")({
  beforeLoad: requireFeature("ceremony"),
  component: CeremonyIndex,
});

const SECTIONS: SectionDef[] = [
  { id: "welcome", label: "Welcome" },
  { id: "venue", label: "Venue" },
  { id: "booklet", label: "Booklet" },
  { id: "photos", label: "Photos" },
];

const BookIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.5C10.5 5.3 8.4 5 6 5.2 5 5.3 4 6 4 7v11c0 .8.8 1.2 2 1 2-.3 4-.2 6 1 2-1.2 4-1.3 6-1 1.2.2 2-.2 2-1V7c0-1-1-1.7-2-1.8-2.4-.2-4.5.1-6 1.3Z" />
    <path d="M12 6.5V19" />
  </svg>
);

function CeremonyIndex() {
  return (
    <PageShell eyebrow="Where it all begins" title={ceremony.welcome.title}>
      <SectionNav items={SECTIONS} />

      <div className="space-y-2">
        <Section id="welcome" title="Welcome">
          <div className="space-y-4">
            {ceremony.welcome.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-center font-display text-lg italic leading-relaxed text-lilac-800/90"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </Section>

        <Section id="venue" title="The Venue">
          <VenueCard venue={ceremony.venue} />
        </Section>

        <Section id="booklet" title="Order of Service">
          <motion.p
            variants={fadeUp}
            className="mb-4 text-center font-sans text-sm text-lilac-700"
          >
            View the printed order of service.
          </motion.p>
          {ceremony.booklet.pdfUrl ? (
            <LinkCard
              to={ceremony.booklet.pdfUrl}
              title="Open the Booklet"
              blurb="The order of service, as a PDF"
              icon={BookIcon}
              external
            />
          ) : (
            <motion.p
              variants={fadeUp}
              className="text-center font-display italic text-lilac-700/80"
            >
              Coming soon.
            </motion.p>
          )}
        </Section>

        <Section id="photos" title="Photo List">
          <PhotoList />
        </Section>
      </div>
    </PageShell>
  );
}
