/**
 * Ceremony content (placeholder). The ceremony section reads from here for:
 *  - `welcome`  — a short greeting shown on the ceremony landing
 *  - `booklet`  — a link to the order of service PDF, hosted on Google Drive
 *  - `venue`    — name/address/time
 *
 * The after-ceremony photo list is NOT here — it's data-driven from the
 * "Photos" tab of the seating Google Sheet (see lib/photos-parse.ts +
 * data/photos-snapshot.ts).
 */

export const ceremony = {
  welcome: {
    title: "The Ceremony",
    paragraphs: [
      "We can't wait to say our vows in front of the people we love most. Here you'll find the order of service, the photo plan, and everything you need for the ceremony itself.",
    ],
  },

  venue: {
    name: "Assumption Roman Catholic Church",
    // A plain address — directions links are derived from this (see lib/maps.ts).
    address: "143 1st St, Wood-Ridge, NJ 07075",
    time: "9:00 AM — please be seated by 8:50",
  },

  booklet: {
    // The printed order of service PDF, hosted on Google Drive — shared as
    // "Anyone with the link" (Viewer) so guests can open it.
    pdfUrl: "https://drive.google.com/file/d/1kv9yxOepfuBRll0HwJWSAm-O4WApjf4d/view?usp=share_link",
  },
} as const;
