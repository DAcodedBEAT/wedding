import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Fuse from "fuse.js";
import { SearchBox } from "./SearchBox";
import { GoldText } from "./GoldText";
import { useSeating } from "../lib/useSeating";
import {
  tableById,
  tableLabel,
  type Guest,
  type SeatingData,
  type Table,
} from "../lib/seating-parse";
import { fadeUp, stagger } from "../lib/motion";
import { tick } from "../lib/haptics";

type Pick = { table: number; guestName?: string };

/** A small one-shot burst of gold sparks — the "found your seat" moment. */
function Sparkle() {
  const dots = Array.from({ length: 8 }, (_, i) => i);
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {dots.map((i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-gold-spark"
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(angle) * 46, y: Math.sin(angle) * 46, scale: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

function TablePanel({
  data,
  table: id,
  guestName,
  className = "mt-6",
}: { data: SeatingData; className?: string } & Pick) {
  const table: Table | undefined = tableById(data, id);
  if (!table) return null;
  const label = tableLabel(data, id);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`glass-card overflow-hidden px-6 py-7 ${className}`}
    >
      <div className="relative text-center">
        {guestName && <Sparkle key={guestName} />}
        <p className="font-sans text-[11px] uppercase tracking-widest3 text-lilac-600">
          {guestName ? "You're seated at" : "Seated here"}
        </p>
        <GoldText as="p" className="mt-1 text-3xl font-medium">
          {label}
        </GoldText>
      </div>

      <div className="foil-rule mx-auto my-5 h-px w-24" />

      {/* One cluster per family / couple (a blank cell in the sheet). */}
      <motion.ul variants={stagger(0, 0.05)} initial="hidden" animate="show" className="space-y-2">
        {table.groups.map((group, gi) => {
          const isMyGroup = Boolean(guestName) && group.includes(guestName!);
          return (
            <motion.li
              key={gi}
              variants={fadeUp}
              className={`rounded-xl px-3 py-2 ring-1 ${
                isMyGroup ? "bg-lilac-100/60 ring-gold/40" : "bg-ivory-50/50 ring-gold/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
                {group.map((name, ni) => {
                  const isYou = name === guestName;
                  return (
                    <span key={name} className="inline-flex items-center">
                      {ni > 0 && <span className="mx-1 text-gold/40">·</span>}
                      <span
                        className={`font-sans text-sm ${
                          isYou ? "font-semibold text-lilac-900" : "text-ink/80"
                        }`}
                      >
                        {name}
                      </span>
                    </span>
                  );
                })}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="mt-6 space-y-2.5" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-xl border border-gold/15 bg-ivory-50/50"
        />
      ))}
    </div>
  );
}

/** Searchable seating chart — fuzzy name search + table browse, fed by the
 *  live Google Sheet (with a build-time snapshot fallback). */
export function SeatingFinder() {
  const { data, status } = useSeating();
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<Pick | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Bring the table panel into view on click — it shows who the guest is
  // seated with, which can otherwise sit below the fold on mobile.
  useEffect(() => {
    if (pick) {
      panelRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [pick, reduceMotion]);

  const fuse = useMemo(
    () =>
      new Fuse(data.guests, {
        keys: ["name"],
        threshold: 0.3,
        ignoreLocation: false,
        minMatchCharLength: 2,
      }),
    [data],
  );

  const MAX_RESULTS = 6;
  const trimmed = query.trim();
  const allResults: Guest[] = useMemo(
    () => (trimmed ? fuse.search(trimmed).map((r) => r.item) : []),
    [fuse, trimmed],
  );
  const results = allResults.slice(0, MAX_RESULTS);
  const moreCount = allResults.length - results.length;

  // Which panel to show: a still-valid explicit pick, else the top result.
  let panel: Pick | null = pick;
  if (trimmed) {
    const pickInResults = pick?.guestName && results.some((g) => g.name === pick.guestName);
    if (!pickInResults) {
      panel = results[0] ? { table: results[0].table, guestName: results[0].name } : null;
    }
  }

  if (status === "loading") {
    return (
      <div>
        <SearchBox
          value=""
          onChange={() => {}}
          placeholder="Loading the seating chart…"
          aria-label="Loading"
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div>
      <SearchBox
        value={query}
        onChange={(v) => {
          setQuery(v);
          if (!v) setPick(null);
        }}
        placeholder="Search your name…"
        aria-label="Search guests by name"
      />

      {/* Searching */}
      {trimmed && (
        <div className="mt-5">
          {results.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="glass-card px-6 py-8 text-center"
            >
              <p className="font-display text-xl italic text-lilac-800/90">
                Hmm, we can't find that name.
              </p>
              <p className="mt-2 font-sans text-sm text-lilac-600">
                Try a different spelling, or ask one of the hosts — we'll happily help.
              </p>
            </motion.div>
          ) : (
            <>
              {results.length > 1 && (
                <motion.ul
                  variants={stagger(0, 0.04)}
                  initial="hidden"
                  animate="show"
                  className="mb-1 space-y-1.5"
                >
                  {results.map((g) => {
                    const active = panel?.guestName === g.name;
                    const mates = g.group.filter((n) => n !== g.name);
                    return (
                      <motion.li key={g.name} variants={fadeUp}>
                        <button
                          type="button"
                          onClick={() => {
                            setPick({ table: g.table, guestName: g.name });
                            tick();
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                            active
                              ? "border-gold/60 bg-lilac-100/70"
                              : "border-gold/20 bg-ivory-50/60 hover:border-gold/40"
                          }`}
                        >
                          <span className="flex flex-col">
                            <span className="font-sans text-base text-ink">{g.name}</span>
                            {mates.length > 0 && (
                              <span className="mt-0.5 truncate font-sans text-xs text-lilac-600">
                                with {mates.join(", ")}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-sans text-xs uppercase tracking-wide text-gold-deep">
                            {tableLabel(data, g.table)}
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}

              {moreCount > 0 && (
                <p className="mb-1 text-center font-sans text-xs text-lilac-600">
                  +{moreCount} more match{moreCount === 1 ? "" : "es"} — type more of the name to
                  narrow it down
                </p>
              )}

              <div ref={panelRef}>
                <AnimatePresence mode="wait">
                  {panel && (
                    <TablePanel key={panel.guestName ?? panel.table} data={data} {...panel} />
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      )}

      {/* Browsing (no query) */}
      {!trimmed && (
        <div className="mt-6">
          <p className="mb-3 text-center font-sans text-xs uppercase tracking-widest text-lilac-600">
            or browse the tables
          </p>
          <motion.div
            variants={stagger(0, 0.05)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
          >
            {data.tables.map((t) => {
              const active = pick?.table === t.id && !pick.guestName;
              return (
                <Fragment key={t.id}>
                  <motion.button
                    variants={fadeUp}
                    type="button"
                    onClick={() => {
                      setPick(active ? null : { table: t.id });
                      tick();
                    }}
                    className={`rounded-xl border px-3 py-4 text-center transition-colors ${
                      active
                        ? "border-gold/60 bg-lilac-100/70"
                        : "border-gold/25 bg-ivory-50/60 hover:border-gold/45"
                    }`}
                  >
                    <span className="block font-display text-lg text-ink">{t.label}</span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-gold-deep">
                      {t.groups.reduce((n, g) => n + g.length, 0)} guests
                    </span>
                  </motion.button>

                  {/* Opens right under the clicked table's row, instead of
                      below the whole (possibly long) grid. */}
                  <AnimatePresence mode="wait">
                    {active && (
                      <TablePanel
                        key={`browse-${t.id}`}
                        data={data}
                        table={t.id}
                        className="col-span-full"
                      />
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
