import { motion } from "framer-motion";
import { usePhotos } from "../lib/usePhotos";
import { fadeUp, stagger } from "../lib/motion";

/** Render a shot like "B&G w/ Groom's Parents" with a gold "B&G" lead-in. */
function Shot({ text }: { text: string }) {
  const m = text.match(/^B\s*&\s*G\b\s*(?:w\/\s*)?(.*)$/i);
  if (!m) return <span className="text-ink/85">{text}</span>;
  const rest = m[1].trim();
  return (
    <span className="text-ink/85">
      <span className="font-display text-gold-deep">B&amp;G</span>
      {rest && <span className="text-lilac-500"> with </span>}
      {rest}
    </span>
  );
}

/** The formal (after-ceremony) group-photo list, fed by the Photos sheet tab
 *  with a build-time snapshot fallback. Numbered continuously across sections. */
export function PhotoList() {
  const { data, status } = usePhotos();

  if (status === "loading") {
    return (
      <div className="space-y-2.5" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl border border-gold/15 bg-ivory-50/50"
          />
        ))}
      </div>
    );
  }

  let n = 0;
  return (
    <div>
      {data.note && (
        <motion.p
          variants={fadeUp}
          className="mb-6 text-center font-display text-lg italic leading-relaxed text-lilac-800/90"
        >
          {data.note}
        </motion.p>
      )}

      <div className="space-y-6">
        {data.sections.map((shots, si) => (
          <div key={si}>
            {si > 0 && <div className="foil-rule mx-auto mb-5 h-px w-12" />}
            <motion.ol
              variants={stagger(0, 0.05)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              className="space-y-2.5"
            >
              {shots.map((shot) => {
                n += 1;
                const num = n;
                return (
                  <motion.li
                    key={`${num}-${shot}`}
                    variants={fadeUp}
                    className="glass-card flex items-center gap-4 px-5 py-3.5"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/30 bg-ivory-50/70 font-display text-base text-gold-deep">
                      {num}
                    </span>
                    <span className="min-w-0 flex-1 font-sans text-[15px] leading-snug">
                      <Shot text={shot} />
                    </span>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        ))}
      </div>
    </div>
  );
}
