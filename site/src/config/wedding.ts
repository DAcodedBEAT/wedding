/**
 * ★ SINGLE SOURCE OF TRUTH ★
 *
 * Everything a *different couple* would change to reuse this site lives
 * here (plus the two files in ../data/ for the seating list and booklet
 * copy). No couple-specific strings should be hard-coded in components or
 * routes — read them from `wedding` instead.
 *
 * Colours mirror tailwind.config.ts so runtime code and utility classes
 * stay in sync.
 */

export type NavItem = {
  label: string;
  /** Router path, e.g. "/ceremony". "/" is the landing page. Omit for an
   *  external link (use `href` instead). */
  to?: string;
  /** External URL (e.g. the Zola registry). Rendered as a real <a>. */
  href?: string;
  /** Short line shown on nav cards / menus. */
  blurb?: string;
  /** If set, the item is hidden when `wedding.features[feature]` is false. */
  feature?: "ceremony" | "reception" | "registry";
};

export type WeddingConfig = typeof wedding;

// The couple's Zola wedding hub + the registry page on it. The "Zola" nav tab
// points at the hub (full details); the registry has its own CTA on the landing.
const WEDDING_URL = "https://www.zola.com/wedding/shaletandarun2026";
const REGISTRY_URL = `${WEDDING_URL}/registry`;

export const wedding = {
  /** Used for the <title>, meta, and conversational copy. */
  couple: {
    name1: "Arun",
    name2: "Shalet",
    /** Ampersand-joined display name. */
    full: "Arun & Shalet",
    initials: "A & S",
  },

  /** Must match the monogram artwork (monogram-as-named.svg). */
  monogramNames: "ARUN & SHALET",

  date: {
    /** Spaced display form, matches the print card. */
    display: "JUNE 27 . 2026",
    /** Plain English. */
    long: "Saturday, June 27th, 2026",
    iso: "2026-06-27",
  },

  venue: {
    name: "The Westmount Country Club",
    city: "Woodland Park, NJ",
    /** Google Maps link for the "directions" affordance. */
    mapUrl: "https://www.google.com/maps/search/?api=1&query=The+Westmount+Country+Club%2C+728+Rifle+Camp+Road%2C+Woodland+Park%2C+NJ+07424",
  },

  /** Zola registry — the landing's "Registry" button (+ its accessible label). */
  registryUrl: REGISTRY_URL,
  registryLabel: "View our registry on Zola",

  /** Single-line welcome shown under the monogram on the landing page. */
  tagline: "Together with our families, we can't wait to celebrate with you.",

  /**
   * Palette — mirrors tailwind.config.ts. The foil gradient stops match
   * monogram-as-gold.svg.
   */
  theme: {
    ivory: "#f5f1ec",
    lilac: "#b9a3d6",
    gold: "#cda86a",
    ink: "#1a1a1a",
    foil: ["#9c7b3f", "#cda86a", "#f6e7c8", "#cda86a", "#8a6a35"],
  },

  /**
   * Navigation + which routes exist. The landing page links into these;
   * the bottom nav shows the non-home items. Add a route file in
   * src/routes/ and a line here to grow the site.
   */
  nav: [
    { label: "Home", to: "/", blurb: "Welcome" },
    { label: "Ceremony", to: "/ceremony", blurb: "The vows, the booklet & photos", feature: "ceremony" },
    { label: "Reception", to: "/reception", blurb: "Seating, schedule & venue", feature: "reception" },
    { label: "Zola", href: WEDDING_URL, blurb: "Our wedding page & details", feature: "registry" },
  ] as NavItem[],

  /** Feature flags — hide a section without deleting its route/data. Honored by
   *  `visibleNav` (below), which `Nav` + the landing read; the landing's
   *  Registry button is gated on `features.registry` too. */
  features: {
    ceremony: true,
    reception: true,
    registry: true,
  },
} as const;

/** Nav items whose feature flag is on (or that carry no flag). The bottom nav
 *  and the landing read this, so flipping a `features` flag hides the section. */
export const visibleNav: NavItem[] = wedding.nav.filter(
  (item) => !item.feature || wedding.features[item.feature]
);
