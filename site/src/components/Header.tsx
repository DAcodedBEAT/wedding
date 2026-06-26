import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Monogram } from "./Monogram";
import { Flourish } from "./Flourish";
import { SparkleBurst } from "./SparkleBurst";
import { Ambient } from "./Ambient";
import { stagger, fadeUp } from "../lib/motion";
import { wedding } from "../config/wedding";

const SESSION_KEY = "as-intro-seen";
const HOLD_MS = 3600; // grand-entrance hold before the curtain lifts
const REPLAY_MS = 26000; // matches Ambient's LOOP_SECONDS cadence
const HERO_ID = "hero-monogram"; // landing hero's big mark — see routes/index.tsx

function alreadySeen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode etc.) — just skip persistence
  }
}

/**
 * The brand mark: a one-time full-screen reveal (mark + names + date over
 * the same hearth-glow ambiance as the rest of the site) on the first load
 * of a session, then a small glass-pill mark fixed in a top header from
 * then on. On the landing page the small mark stays hidden until the big
 * hero mark (`#hero-monogram`) has scrolled out of view, so the two never
 * compete for attention; on every other page it shows as soon as the intro
 * is done, since there's no big mark to scroll past there.
 */
export function Header() {
  const reduce = useReducedMotion();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [introDone, setIntroDone] = useState(() => alreadySeen() || reduce);
  const [heroPassed, setHeroPassed] = useState(pathname !== "/");
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    if (introDone) return;
    const sparkleTimer = setTimeout(() => setSparkle(true), 1500);
    const doneTimer = setTimeout(() => {
      markSeen();
      setIntroDone(true);
    }, HOLD_MS);
    return () => {
      clearTimeout(sparkleTimer);
      clearTimeout(doneTimer);
    };
  }, [introDone]);

  useEffect(() => {
    if (pathname !== "/") {
      setHeroPassed(true);
      return;
    }
    setHeroPassed(false);
    const el = document.getElementById(HERO_ID);
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setHeroPassed(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  const showSmall = introDone && heroPassed;

  return (
    <>
      <AnimatePresence>
        {!introDone && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-50 overflow-hidden bg-ivory-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Ambient />
            <motion.div
              className="relative flex h-full flex-col items-center justify-center px-6 text-center"
              variants={stagger(1.6, 0.12)}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              >
                <Monogram
                  draw
                  delay={0.2}
                  className="h-44 w-44 drop-shadow-[0_8px_30px_rgba(60,45,80,0.3)] sm:h-56 sm:w-56"
                />
                {sparkle && <SparkleBurst onDone={() => setSparkle(false)} />}
              </motion.div>

              <motion.div variants={fadeUp} className="mt-6">
                <Flourish width={180} />
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-4 font-sans text-sm uppercase tracking-widest2 text-lilac-700"
              >
                {wedding.monogramNames}
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mt-1 font-sans text-xs uppercase tracking-widest text-gold-deep"
              >
                {wedding.date.display}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pt-safe">
        <motion.div
          initial={false}
          animate={{ opacity: showSmall ? 1 : 0, y: showSmall ? 0 : -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-2 ${showSmall ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <Link
            to="/"
            aria-label="Home"
            className="flex items-center justify-center rounded-full border border-gold/30 bg-ivory-50/80 p-2 shadow-card backdrop-blur-xl"
          >
            <Monogram
              draw
              delay={0}
              replayIntervalMs={showSmall ? REPLAY_MS : undefined}
              className="h-7 w-7"
            />
          </Link>
        </motion.div>
      </div>
    </>
  );
}
