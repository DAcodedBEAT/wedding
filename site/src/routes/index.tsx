import { useState, useEffect } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Monogram } from "../components/Monogram";
import { Flourish } from "../components/Flourish";
import { GoldText } from "../components/GoldText";
import { VenueCard } from "../components/VenueCard";
import { SparkleBurst } from "../components/SparkleBurst";
import { fadeUp, stagger } from "../lib/motion";
import { wedding, visibleNav } from "../config/wedding";
import { ceremony } from "../data/ceremony";
import { reception } from "../data/reception";
import { getWeddingPhase, getCountdown, CEREMONY_START } from "../lib/wedding-phase";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const phase = getWeddingPhase();
    if (phase === "ceremony-default")  throw redirect({ to: "/ceremony" });
    if (phase === "reception-default") throw redirect({ to: "/reception" });
  },
  component: Landing,
});

function Landing() {
  // Non-home (visible) nav items become the "enter the experience" links.
  const links = visibleNav.filter((n) => n.to !== "/");
  const isExternal = (item: (typeof links)[number]) => Boolean(item.href);

  // A little easter egg: tapping the monogram throws a burst of gold
  // sparkle. Each tap adds an id; each burst removes itself when done so
  // rapid taps can overlap.
  const [sparkles, setSparkles] = useState<number[]>([]);
  const addSparkle = () => setSparkles((s) => [...s, Date.now() + Math.random()]);
  const removeSparkle = (id: number) => setSparkles((s) => s.filter((x) => x !== id));

  // Countdown — ticks every minute. `beforeLoad` already redirected
  // ceremony-default and reception-default, so only 'pre' and 'post' land here.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const phase = getWeddingPhase(now);
  const countdown = phase === "pre" ? getCountdown(CEREMONY_START, now) : null;
  const tagline =
    phase === "post"
      ? "Thank you for celebrating this day with us."
      : wedding.tagline;

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
          behind it (echoes the LED-wall MonogramAnimation's ambient glow).
          It's also a tiny easter egg — a tap throws a burst of sparkle. */}
        <motion.button
          id="hero-monogram"
          type="button"
          onClick={addSparkle}
          whileTap={{ scale: 0.97 }}
          aria-label="A little sparkle for the monogram"
          className="monogram-glow relative inline-flex appearance-none rounded-full border-0 bg-transparent p-0 outline-none transition-[filter] duration-300 focus-visible:drop-shadow-[0_0_22px_rgba(216,183,106,0.65)]"
        >
          <Monogram
            draw
            delay={0.3}
            className="h-44 w-44 drop-shadow-[0_8px_24px_rgba(60,45,80,0.25)] sm:h-56 sm:w-56"
          />
          {sparkles.map((id) => (
            <SparkleBurst key={id} onDone={() => removeSparkle(id)} />
          ))}
        </motion.button>

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

          {countdown && (
            <motion.div
              variants={fadeUp}
              aria-live="polite"
              aria-atomic="true"
              className="mt-5 flex items-end justify-center gap-4"
            >
              {countdown.days > 0 && (
                <>
                  <CountdownUnit value={countdown.days} label="days" />
                  <span className="mb-3 text-gold/40">·</span>
                </>
              )}
              <CountdownUnit value={countdown.hours} label={countdown.days > 0 ? "hrs" : "hours"} />
              <span className="mb-3 text-gold/40">·</span>
              <CountdownUnit value={countdown.minutes} label="min" />
            </motion.div>
          )}

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xs font-display text-lg italic leading-relaxed text-lilac-800/90"
          >
            {tagline}
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

      {/* When & where — hidden after the reception ends */}
      {phase !== "post" && (
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
      )}
    </>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="font-display text-3xl font-light tabular-nums text-gold-deep sm:text-4xl">
        {value}
      </span>
      <span className="font-sans text-[10px] uppercase tracking-widest text-lilac-600">
        {label}
      </span>
    </span>
  );
}
