/**
 * Reception content. The schedule is intentionally STATIC (it's finalized and
 * won't change) — only the seating chart + photo list are live from the Sheet.
 * A guest-facing distillation of the couple's "Order of Reception" run-of-show;
 * the fuller DJ/vendor cues live in that private doc.
 */

// `time` is optional — only the bookends (start/end) show a time; the moments
// in between read as a sequence without holding guests to exact minutes.
export type ScheduleItem = { time?: string; title: string; detail?: string };

export const reception = {
  intro:
    "Once we're married, the celebration moves to Westmount for lunch, dancing, and a whole lot of joy. Here's how the afternoon unfolds.",

  seatingChart: {
    // The printed seating chart PDF, hosted on Google Drive — shared as
    // "Anyone with the link" (Viewer) so guests can open it.
    pdfUrl: "https://drive.google.com/file/d/1WM99YV31tbIjVqM_R9fFbVtVsFzAB4_5/view?usp=share_link",
  },

  venue: {
    name: "The Westmount Country Club",
    // A plain address — directions links are derived from this (see lib/maps.ts).
    address: "728 Rifle Camp Road, Woodland Park, NJ 07424",
    time: "Welcome 11:45 AM · Reception 1:00 PM",
  },

  schedule: [
    { time: "11:45 AM", title: "Welcome & Cocktails", detail: "Arrive at Westmount" },
    { time: "1:00 PM", title: "Reception Begins", detail: "Find your seat in the ballroom" },
    { title: "Grand Entrance", detail: "The wedding party & the newlyweds" },
    { title: "Blessing & Lamp Lighting" },
    { title: "First Dance" },
    { title: "Speeches & Toasts", detail: "From our siblings and parents" },
    { title: "Family Dances", detail: "Father–daughter & mother–son" },
    { title: "Lunch" },
    { title: "Second Entrance & Cake Cutting" },
    { title: "Special Dances", detail: "A few surprises in store…" },
    { title: "Open Dance Floor", detail: "Let's celebrate" },
    { time: "4:30 PM", title: "Reception Ends" },
  ] as ScheduleItem[],
} as const;
