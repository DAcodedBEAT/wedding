import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Monogram } from "../components/Monogram";
import { Flourish } from "../components/Flourish";
import { GoldText } from "../components/GoldText";
import { VenueCard } from "../components/VenueCard";
import { fadeUp, stagger } from "../lib/motion";
import { wedding, visibleNav } from "../config/wedding";
import { ceremony } from "../data/ceremony";
import { reception } from "../data/reception";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  // Non-home (visible) nav items become the "enter the experience" links.
  const links = visibleNav.filter((n) => n.to !== "/");
  const isExternal = (item: (typeof links)[number]) => Boolean(item.href);

  return (
    <>
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-28 pt-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-6 font-sans text-xs uppercase tracking-widest3 text-lilac-700"
        >
          The Wedding Of
        </motion.p>

        {/* The mark draws itself on in gold, with a soft breathing glow
          behind it (echoes the LED-wall MonogramAnimation's ambient glow). */}
        <div className="monogram-glow">
          <Monogram
            draw
            delay={0.3}
            className="h-44 w-44 drop-shadow-[0_8px_24px_rgba(60,45,80,0.25)] sm:h-56 sm:w-56"
          />
        </div>

        <motion.div
          className="mt-7 flex flex-col items-center"
          variants={stagger(1.2, 0.12)}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={fadeUp}
            className="font-sans text-2xl font-light uppercase tracking-widest2 text-ink sm:text-3xl"
          >
            {wedding.monogramNames}
          </motion.h1>

          <motion.div variants={fadeUp} className="my-1">
            <Flourish width={200} />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="font-sans text-sm uppercase tracking-widest2 text-lilac-700 sm:text-base"
          >
            {wedding.date.display}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xs font-display text-lg italic leading-relaxed text-lilac-800/90"
          >
            {wedding.tagline}
          </motion.p>

          {/* Enter the experience */}
          <motion.nav
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            {links.map((item) =>
              isExternal(item) ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-sm"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.to} to={item.to} className="btn-gold text-sm">
                  {item.label}
                </Link>
              ),
            )}
            {/* Registry sits alongside the Zola hub link so both are one tap away. */}
            {wedding.features.registry && (
              <a
                href={wedding.registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={wedding.registryLabel}
                className="btn-gold text-sm"
              >
                Registry
              </a>
            )}
          </motion.nav>
        </motion.div>

        {/* gentle shimmer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1.5 }}
          className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2"
        >
          <span className="block h-8 w-px bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 animate-floaty" />
        </motion.div>
      </section>

      {/* When & where — the two location cards */}
      <section className="relative z-10 mx-auto w-full max-w-xl px-6 pb-28">
        <motion.div
          variants={stagger(0, 0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-12% 0px" }}
          className="text-center"
        >
          <motion.div variants={fadeUp}>
            <GoldText as="h2" className="text-3xl font-light sm:text-4xl">
              When &amp; Where
            </GoldText>
          </motion.div>
          <motion.div variants={fadeUp} className="mb-8 mt-4">
            <Flourish width={160} />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mb-2.5 font-sans text-xs uppercase tracking-widest text-gold-deep"
          >
            The Ceremony · 9:00 AM
          </motion.p>
          <VenueCard venue={ceremony.venue} />

          <motion.p
            variants={fadeUp}
            className="mb-2.5 mt-7 font-sans text-xs uppercase tracking-widest text-gold-deep"
          >
            The Reception · 1:00 PM
          </motion.p>
          <VenueCard venue={reception.venue} />
        </motion.div>
      </section>
    </>
  );
}
