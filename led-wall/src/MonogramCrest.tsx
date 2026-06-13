/**
 * Crest geometry — shared single source of truth
 *
 * The ornamental gold "crest" frame (rounded triple-line border + four
 * curling corner flourishes) and its layout metrics, factored out so
 * every crest composition draws the exact same emblem at the exact same
 * proportions. Imported by MonogramCrestLoop, MonogramCrestLottie and
 * MonogramNamesReveal.
 *
 * This file used to also export a one-shot `MonogramCrest` reveal
 * composition; that variant was retired, but its geometry lives on here
 * as the shared reference the looping crests are built from. Tweak a
 * constant here and every crest moves together.
 */

/**
 * Ornamental frame geometry — a rounded rectangle with a single
 * hand-drawn-style flourish curling out of each corner, like a pen
 * stroke that runs along the edges and loops into a small spiral. One
 * path is authored for the top-left corner; the other three corners
 * are the same path mirrored via transform, keeping the crest perfectly
 * symmetric without hand-tracing four separate ornaments.
 */
export const FRAME_VB_W = 760;
export const FRAME_VB_H = 1000;
const FRAME_MARGIN = 76;
export const FRAME_X = FRAME_MARGIN;
export const FRAME_Y = FRAME_MARGIN;
export const FRAME_W = FRAME_VB_W - FRAME_MARGIN * 2;
export const FRAME_H = FRAME_VB_H - FRAME_MARGIN * 2;
export const FRAME_RADIUS = 28;

export const CORNER_FLOURISH =
  "M92,0 C 56,0 30,0 16,12 " +
  "C 4,22 2,40 14,48 " +
  "C 26,56 40,50 38,36 " +
  "C 37,28 28,27 25,34 " +
  "L 0,92";

export const CORNER_TRANSFORMS = [
  `translate(${FRAME_X} ${FRAME_Y})`,
  `translate(${FRAME_X + FRAME_W} ${FRAME_Y}) scale(-1 1)`,
  `translate(${FRAME_X} ${FRAME_Y + FRAME_H}) scale(1 -1)`,
  `translate(${FRAME_X + FRAME_W} ${FRAME_Y + FRAME_H}) scale(-1 -1)`,
];

// Scales up the entire corner cluster — both spiralling scrolls — as
// one unit, so each corner reads as a substantial emblem at a glance
// rather than a fine detail you have to lean in to notice. Applied as a
// single group transform around the whole cluster, keeping every piece
// in the same proportion to each other as the original hand-drawn scale.
export const CORNER_CLUSTER_SCALE = 1.5;

// Counter-scroll — the same hand-drawn flourish, reflected across the
// corner's diagonal (x ↔ y, via this matrix). Because CORNER_FLOURISH
// isn't symmetric about that diagonal, the reflection isn't a stacked
// duplicate: it curls the *other* way, spiralling in from the border
// arm on the opposite side — two vines winding toward each other from
// the frame itself, the baroque "interlacing vines" a single curl can't
// give a corner alone, with neither needing a separate medallion to
// converge on. Drawn lighter/thinner so it reads as the secondary voice
// in the pair, not a competing twin.
export const CORNER_COUNTER_FLOURISH_TRANSFORM = "matrix(0,1,1,0,0,0)";

// A second, finer rounded border set inward from the main one — the
// classic double-line crest/badge frame. Exported so both crests draw
// it identically.
export const FRAME_INNER_INSET = 16;

// A third, hairline border nested inside that — layering the frame into
// a triple-line setting, like fine engraving on a locket, rather than
// the simpler double-line. Faintest of the three, so it reads as
// texture/depth rather than competing with the two bolder lines.
export const FRAME_INNER_INSET_2 = 27;

// The frame is always rendered at this fixed viewport-height fraction
// (see the `<svg style={{ height: ... }}>` in each crest) — so its
// rendered width, and thus the space available for the names/date row
// beneath it, can be derived purely from these geometry constants and
// expressed in the same `vh` units. That keeps the names block from
// ever drifting wider than the frame's inner edge, regardless of how
// the text content changes.
export const FRAME_HEIGHT_VH = 88;
export const FRAME_INNER_WIDTH_VH = FRAME_HEIGHT_VH * (FRAME_W / FRAME_VB_H);

// Length of the rule lines flanking the names — short enough that the
// whole names+date row sits with genuine, deliberate breathing room
// inside the gold border, rather than its rule-ends nearly touching it.
// (Shortening this is what actually creates that margin: the row is
// centred to match the centred frame, so trimming the rules pulls
// their tips inward, away from the border, on both sides at once.)
export const NAME_RULE_LENGTH = 22;

// Lifts the monogram and the names/date row up from dead-centre — the
// classic crest balance, with the emblem riding high in the shield and
// the motto settled beneath it, rather than splitting the frame evenly
// top and bottom. Both expressed as shared constants so the crests'
// compositions stay identical and move as one considered layout, not
// independently-eyeballed offsets.
export const MONOGRAM_Y_SHIFT_VH = -4;
export const NAMES_TOP_PERCENT = "64%";
