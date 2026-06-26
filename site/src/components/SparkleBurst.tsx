import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPARK_GOLD = "#d8b76a";
const SPARK_CORE = "#fff3d6";
const PARTICLE_COUNT = 12;
const DURATION = 0.9;

type Particle = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  glintLength: number;
  delay: number;
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + (Math.random() * 24 - 12),
    distance: 46 + Math.random() * 58,
    size: 3 + Math.random() * 5,
    glintLength: Math.random() > 0.5 ? 12 + Math.random() * 16 : 0,
    delay: Math.random() * 0.08,
  }));
}

/**
 * A one-shot burst of gold sparkle particles radiating from the center of
 * its container, echoing the four-point "glint cross" look from the
 * LED-wall AmbientBokeh. Mounted on tap, removed via onDone once the
 * animation finishes.
 */
export function SparkleBurst({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => makeParticles(), []);

  useEffect(() => {
    const t = setTimeout(onDone, (DURATION + 0.1) * 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2"
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x, y, scale: [0, 1, 0.4], opacity: [0, 1, 0] }}
            transition={{ duration: DURATION, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="rounded-full"
              style={{
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                background: `radial-gradient(circle, ${SPARK_CORE} 0%, ${SPARK_GOLD} 55%, transparent 75%)`,
              }}
            />
            {/* four-point glint cross, on ~half the particles */}
            {p.glintLength > 0 && (
              <>
                <div
                  className="absolute"
                  style={{
                    width: p.glintLength,
                    height: 1.5,
                    left: -p.glintLength / 2,
                    top: -0.75,
                    background: `linear-gradient(90deg, transparent, ${SPARK_CORE}, transparent)`,
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    width: 1.5,
                    height: p.glintLength,
                    left: -0.75,
                    top: -p.glintLength / 2,
                    background: `linear-gradient(180deg, transparent, ${SPARK_CORE}, transparent)`,
                  }}
                />
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
