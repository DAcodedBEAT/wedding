import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { visibleNav, type NavItem } from "../config/wedding";
import { tick } from "../lib/haptics";

type IconProps = { active: boolean };

function svgProps(active: boolean) {
  return {
    className: `h-[22px] w-[22px] transition-colors duration-300 ${active ? "text-gold" : "text-lilac-600"}`,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

/** Line icons keyed by the nav item (route path, or label for externals). */
function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  const p = svgProps(active);
  const key = item.to ?? item.label;
  switch (key) {
    case "/":
      return (
        <svg {...p}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9h14v-9" />
        </svg>
      );
    case "/ceremony": // a church
      return (
        <svg {...p}>
          <path d="M12 2v4M10 4h4" />
          <path d="M12 6 8 9v2l-4 2.5V21h16v-7.5L16 11V9l-4-3Z" />
          <path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3" />
        </svg>
      );
    case "/reception": // music notes (dancing / celebration)
      return (
        <svg {...p}>
          <path d="M9 17V5l10-2v9" />
          <circle cx="6.5" cy="17" r="2.5" />
          <circle cx="16.5" cy="14" r="2.5" />
        </svg>
      );
    default: // external (Zola) — a gift
      return (
        <svg {...p}>
          <path d="M20 9v9.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9" />
          <rect x="3" y="6" width="18" height="3" rx="0.6" />
          <path d="M12 6v13.5" />
          <path d="M12 6S11 3 9.2 3 7 5.6 9 6h3ZM12 6s1-3 2.8-3 2.2 2.6.2 3h-3Z" />
        </svg>
      );
  }
}

function ItemInner({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <>
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-full bg-lilac-100/80 ring-1 ring-gold/30"
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
        />
      )}
      <span className="relative">
        <NavIcon item={item} active={active} />
      </span>
      <span
        className={`relative font-sans text-[10px] uppercase tracking-widest transition-colors duration-300 ${
          active ? "text-lilac-900" : "text-lilac-600"
        }`}
      >
        {item.label}
      </span>
    </>
  );
}

/** Fixed bottom nav with a sliding gold indicator (shared layout). External
 *  items (e.g. Zola) render as a real <a> and never take the active state. */
export function Nav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-safe">
      <div className="mx-auto mb-2 flex max-w-md items-stretch justify-around rounded-full border border-gold/30 bg-ivory-50/80 px-2 py-1.5 shadow-card backdrop-blur-xl">
        {visibleNav.map((item) => {
          const cls =
            "relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2";

          if (item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => tick()}
                className={cls}
              >
                <ItemInner item={item} active={false} />
              </a>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => tick()}
              className={cls}
            >
              {({ isActive }) => <ItemInner item={item} active={isActive} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
