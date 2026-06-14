import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "../lib/motion";
import { tick } from "../lib/haptics";
import { mapLinks } from "../lib/maps";

export type Venue = {
  name: string;
  address: string;
  time: string;
};

const PinIcon = (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </svg>
);
const ClockIcon = (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

/** Glass card with a venue's name, time, address + directions. The primary
 *  button opens Google Maps (universal, app-routes on mobile); a small
 *  disclosure offers Apple Maps / Waze for guests who prefer them. */
export function VenueCard({ venue }: { venue: Venue }) {
  const [open, setOpen] = useState(false);
  const links = mapLinks(venue.address);

  return (
    <motion.div variants={fadeUp} className="glass-card px-6 py-6">
      <p className="text-center font-display text-2xl text-ink">{venue.name}</p>

      <div className="foil-rule mx-auto my-4 h-px w-20" />

      <ul className="space-y-3">
        <li className="flex items-start gap-3 text-left">
          <span className="mt-0.5 shrink-0 text-gold-deep">{ClockIcon}</span>
          <span className="font-sans text-base text-ink">{venue.time}</span>
        </li>
        <li className="flex items-start gap-3 text-left">
          <span className="mt-0.5 shrink-0 text-gold-deep">{PinIcon}</span>
          <span className="font-sans text-base text-ink">{venue.address}</span>
        </li>
      </ul>

      <div className="mt-5 flex flex-col items-center gap-2">
        <a
          href={links.google}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => tick()}
          className="btn-gold w-full justify-center text-sm"
        >
          Get directions
        </a>

        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            tick();
          }}
          aria-expanded={open}
          className="flex min-h-[44px] items-center gap-1 font-sans text-xs uppercase tracking-widest text-lilac-700 transition-colors hover:text-gold-deep"
        >
          Open in another app
          <svg
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full justify-center gap-2 overflow-hidden"
            >
              {[
                { href: links.apple, label: "Apple Maps" },
                { href: links.waze, label: "Waze" },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => tick()}
                  className="mt-1 rounded-full border border-gold/30 bg-ivory-50/70 px-4 py-2 font-sans text-xs text-gold-deep transition-colors hover:border-gold/55"
                >
                  {a.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
