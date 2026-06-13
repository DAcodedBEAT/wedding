# Wedding Monogram (A & S — June 27, 2026)

This repo holds the artwork and animations for Arun & Shalet's wedding
monogram: static SVG cards plus Remotion video compositions for an LED
wall display.

## Layout

- `monogram-as-*.svg` — static print/card variants (light, dark, named,
  gold). These are the deliverables; keep them in sync when the mark
  itself changes.
- `led-wall/` — Remotion project that animates the monogram for the
  reception's LED wall (see `led-wall/src/Root.tsx` for the list of
  compositions and their purpose/timing).
- `site/` — the guest-facing wedding website (Vite + React + TS +
  TailwindCSS + TanStack Router), deployed to GitHub Pages and reached via
  a branded QR on the printed booklet. Pages: animated monogram landing,
  digital booklet, searchable seating chart, registry link. See
  `site/README.md`. Has its own host-Node toolchain (`cd site && npm …`) —
  unrelated to the led-wall container.
- `unused/` — earlier explorations and rejected directions. Don't build
  on these; they're kept for reference only.
- `trace-input.pbm` — source bitmap that was traced (via Potrace) into
  the monogram path data now living in `led-wall/src/paths.ts`.
- `preview.html` — standalone browser preview of the static SVG cards.
- `scratch/` and `led-wall/out/scratch/` — throwaway preview/verification
  renders (crops, zooms, stills, loop-seam check frames). Always safe to
  `rm -rf` the contents entirely; nothing in here is a deliverable or
  referenced by source. `led-wall/out/` itself (outside `scratch/`) holds
  full renders — treat those as regenerable build output too, but they're
  the "current result" rather than scratch.

## Static SVG conventions

- All variants share the same monogram path and `POTRACE_TRANSFORM`
  (`translate(0,2400) scale(0.1,-0.1)`) — see `led-wall/src/paths.ts`
  for why (Potrace's coordinate space) and the two viewBox options
  (bounding-box-centred vs. crossing-point-centred).
- The Google Fonts `@import` in `<style>` needs its `&` escaped as
  `&amp;` — it's inline in an XML document, and an unescaped `&` corrupts
  the whole file's parsing (this broke `monogram-as-named.svg` once).
- Keep elements in their own groups (monogram mark, names, date) rather
  than flattening — `monogram-as-named.svg` is the layout reference the
  Remotion compositions are built from, and group separation makes it
  easier to port/animate pieces individually.
- Gold/foil variants should reuse the established palette from
  `led-wall/src/MonogramCrestLottie.tsx` (`LETTER`/`GOLD`/`SPARK_GOLD`:
  `#e8c992` / `#cda86a` / `#d8b76a`) for visual consistency across print
  and video.

## Rendering / previewing SVGs

No SVG tooling (Inkscape, cairosvg, browsers) is installed locally —
**use Docker** for any rendering or pixel-level verification:

```bash
# Render an SVG to PNG
mkdir -p scratch
docker run --rm -v "$PWD":/data minidocks/inkscape inkscape \
  /data/monogram-as-named.svg --export-type=png \
  --export-filename=/data/scratch/preview.png --export-width=800

# Crop/zoom a PNG for closer inspection
docker run --rm -v "$PWD":/data dpokidov/imagemagick \
  /data/scratch/preview.png -crop WxH+X+Y -resize 300% /data/scratch/zoom.png
```

Write previews/zooms into `scratch/` (as above) so cleanup is just
`rm -rf scratch/*` — they're scratch artifacts, not deliverables.

## Remotion (`led-wall/`)

Node/npm aren't installed on the host — there's a long-running
`remotion-studio` container (`node:20-bookworm-slim`) with this
directory bind-mounted at `/app`. **Run everything through it**, never
directly on the host:

```bash
# Type-check after any source change
docker exec remotion-studio sh -c "cd /app && npx tsc --noEmit -p tsconfig.json"

# Render a single frame to PNG for visual verification
docker exec remotion-studio sh -c "cd /app && mkdir -p out/scratch && npx remotion still <CompositionId> out/scratch/check.png --frame=N"
# (note: `still`, not `render --frame` — the latter errors with
# "did you mean --frames?")

# Full renders (land in led-wall/out/ — treat as build output, not source)
docker exec remotion-studio sh -c "cd /app && npx remotion render MonogramAnimation out/monogram.mp4"
```

`npm start` (Remotion Studio, for interactive scrubbing) also runs the
same way if needed, but for verifying changes, rendering targeted
stills with `still` + cropping/zooming is the faster loop — see below.

- `durationInFrames` for each `<Composition>` in `Root.tsx` must match
  the `TIMINGS.totalFrames` constant in that composition's source file —
  a mismatch produces a visible loop seam or a truncated render.
- The LED-wall loops (`MonogramAnimation`, `MonogramCrestLoop`,
  `MonogramCrestLoopLottieV2`, `MonogramEmbers`, `MonogramNamesReveal`)
  must be seamless (frame 0 ≈ last frame) since they run for hours
  unattended; the one-shot `MonogramCrestLottie` is a single reveal and
  is free to have a full entrance/exit.
- Shared geometry/strings (frame dimensions, corner ornaments, colors,
  `NAMES`/`DATE`) are exported as `export const` from one module and
  imported by the others — keep this single-source-of-truth pattern
  rather than duplicating constants when compositions need to match.
  `MonogramCrest.tsx` is the crest-frame geometry module (no composition
  of its own anymore): it exports the frame dimensions and corner-
  flourish constants that the crest compositions are built from.

### The lead crest: `MonogramCrestLoopLottieV2`

This candlelit Lottie crest loop is the current chosen LED-wall piece —
the plain one-shot `MonogramCrest` composition and `MonogramSeal` were
retired (see the geometry-module note above). It composes the shared
`MonogramCrestLottieView` (also used by the one-shot `MonogramCrestLottie`)
over `MonogramEmbers`' flickering hearth glow + drifting embers. Its
loop-specific look is set by props the V2 wrapper passes to the view,
with defaults that preserve the one-shot's appearance — tune these in
`MonogramCrestLoopLottieV2.tsx`, not by editing the shared view:

- `textScale` — names/date type size (V2: `1.18`)
- `monogramShiftVh` — AS mark vertical position, negative = up (V2: `-8`)
- `namesTopPercent` — names/date row position (V2: `"67%"`)
- `topBranchSpreadVh` — extra outward spread of the top branch/leaf
  ornaments, left further left + right further right (V2: `4`)
- `background="transparent"` — composite the crest over the hearth glow
- `loopDurationInFrames` — the loop's real length (V2: `900`)

Must-haves / gotchas learned tuning this loop — keep these true:

- **Everything frame-dependent in a loop must return to its frame-0 value
  at the end.** Drive it with `loopPhase` (`= frame/totalFrames · 2π`)
  sinusoids, or an envelope that starts and ends at 0. A clamped one-shot
  `interpolate` ramp (e.g. an entrance glow) ends pinned at 1 and pops at
  the seam — the mark glow rides `loopPhase` for exactly this reason.
- **Particle fields need the wrapper's real duration.** `AmbientBokeh`
  and `EmberField` are only seamless when fed the composition's
  `durationInFrames`. The view's own `TIMINGS.totalFrames` is the
  480-frame one-shot length, so the loop must pass `loopDurationInFrames`
  (900); otherwise the bokeh runs on a 480-frame clock and desyncs from
  the embers at the seam.
- **Size text/layout in `vh`, not `px`.** The frame and mark are
  vh-based, so they scale identically in the Studio preview and the
  headless render; absolute-px text only matches at the true 1080-tall
  render and looks oversized in the smaller preview viewport. Use the
  `pxToVh(px)` helper (derived from `useVideoConfig().height`).
- **When `background="transparent"`, cover/"mask" rects must use the
  `background` prop, not a hard-coded black** — an opaque fill punches
  visible dark squares through the hearth glow.
- **SVG gradient defs are document-scoped.** `frame-loop-shimmer` must be
  defined in the same `<svg>` that references it; the Lottie view defines
  its own (separate from `MonogramCrestLoop`'s).
- **Mark and border shimmer share `frameSweep` in loop mode** so the gold
  highlight crosses the monogram and the frame as one travelling light.
  The triple "fine engraving" border is a local `BORDER_LINES` spec
  (even spacing, crisp pixel-snapped widths, a screened shimmer twin per
  rule, a breathing glow) — kept local so the other crests' shared insets
  stay untouched.

### Alpha (transparent-background) exports

`MonogramCrestLoopLottieV2Alpha` (in `Root.tsx`) is the V2 loop with its
opaque warm-black fill dropped — the hand-off asset for the photo/video
team to overlay on their own footage. It keeps the hearth glow and embers
(both composite onto the alpha at partial opacity); ask if a
glow/embers-free, crest-only variant is wanted instead. Alpha survives in
PNG and ProRes, never in JPEG/H.264 — keep `--image-format=png` for
sequences. Outputs land in `led-wall/out/` (regenerable build output).

```bash
# Single frame → PNG with alpha
docker exec remotion-studio sh -c "cd /app && npx remotion still \
  MonogramCrestLoopLottieV2Alpha out/crest-alpha.png --frame=450"

# Whole 900-frame loop → folder of PNG frames, each with alpha
docker exec remotion-studio sh -c "cd /app && npx remotion render \
  MonogramCrestLoopLottieV2Alpha out/crest-alpha-seq --sequence --image-format=png"

# (Optional) one transparent video file instead of a frame folder —
# ProRes 4444 .mov carries alpha and imports into most NLEs
docker exec remotion-studio sh -c "cd /app && npx remotion render \
  MonogramCrestLoopLottieV2Alpha out/crest-alpha.mov --codec=prores --prores-profile=4444"
```

### Visual verification workflow

The container has no image tools (no ImageMagick/Inkscape/PIL). To
inspect fine details (corner ornaments, padding, glow alignment) in a
rendered still:

```bash
# One-time per session: install sharp into the container (don't persist it)
docker exec remotion-studio sh -c "cd /app && npm install --no-save sharp"

# Crop/zoom with an inline script
docker exec remotion-studio sh -c "cd /app && node -e \"
const sharp = require('sharp');
(async () => {
  await sharp('out/scratch/check.png')
    .extract({ left: X, top: Y, width: W, height: H })
    .resize(W*2, H*2)
    .toFile('out/scratch/zoom.png');
})();
\""

# Pull it out to view
mkdir -p scratch
docker cp remotion-studio:/app/out/scratch/zoom.png ./scratch/zoom.png
```

Then use the Read tool on the local copy to actually look at it. Loop-seam
checks (comparing frame 0 to the last frame) follow the same pattern —
render both stills into `out/scratch/` with descriptive names (e.g.
`loop-000.png`, `loop-899.png`).

**Always clean up afterwards** — both the local copies and the
container's scratch files, and remove the temporarily-installed sharp:

```bash
rm -rf ./scratch
docker exec remotion-studio sh -c "cd /app && rm -rf out/scratch && rm -rf node_modules/sharp"
```

For static SVGs (not Remotion compositions), the `minidocks/inkscape` /
`dpokidov/imagemagick` one-off containers from the section above are
the right tool instead.

## Website (`site/`)

Host Node (nvm, v24) is available — run `cd site && npm install`, `npm run
dev`, `npm run build` directly (the led-wall container is unrelated). Key
conventions, learned building it:

- **Portability is the point.** All couple-specific content lives in
  `src/config/wedding.ts` (names/date/venue/registry/nav/theme/flags) plus
  `src/data/` (`ceremony.ts` = welcome + order-of-service PDF link + venue;
  `reception.ts` = intro + static schedule + venue; `seating-snapshot.ts`
  + `photos-snapshot.ts` = offline fallbacks for the live-Sheet sections). No
  couple strings hard-coded in components — read from config/data so the site
  re-skins for another couple by editing those files only.
- **Information architecture.** Nav = **Home · Ceremony · Reception · Zola**
  (Zola = external registry link via `href`). Ceremony and Reception are each
  ONE scrollable page with a sticky in-page jump-nav of anchored `<Section>`s
  (`components/Section.tsx`) — Ceremony: welcome / venue / booklet / photos;
  Reception: venue / seating / schedule. The ceremony booklet section is just
  a link to the order-of-service PDF (hosted on Google Drive,
  `ceremony.booklet.pdfUrl` — share it as "Anyone with the link"/Viewer).
  The landing has the monogram hero + a "When & Where" block with both
  `VenueCard`s. Add a page = drop a file in `src/routes/` + a `wedding.nav`
  entry. `VenueCard` derives Google/Apple/Waze directions from a plain address
  (`lib/maps.ts`); store the address, never a vendor URL.
- **Two sections are live from a Google Sheet** (`lib/sheets.ts` — one
  spreadsheet, one API key, a generic `useSheet` hook): the **seating chart**
  (`useSeating.ts`, `seating-parse.ts` — column-per-table, `Table N` header,
  blank cell = family/couple group) and the **photo list** (`usePhotos.ts`,
  `photos-parse.ts` — `Photos` tab, one shot per row, blank row = section).
  Both fall back to their committed `*-snapshot.ts` if unconfigured/offline, so
  a section is never empty. `npm run sheets:pull` regenerates both snapshots
  (Node ≥22, runs the TS parsers via `--experimental-strip-types`); the deploy
  workflow runs it best-effort before build. Env: `VITE_SHEETS_ID` +
  `VITE_SHEETS_API_KEY` (+ optional `VITE_SHEETS_RANGE`/`VITE_SHEETS_PHOTOS_RANGE`)
  in `.env.local` / CI secrets — key is public, so restrict it to the Sheets API
  + referrers and keep only guest-facing data in the shared tabs. The reception
  **schedule is deliberately static** (finalized; do NOT live-pull it). Full
  setup + security checklist in `site/README.md`.
- **No `<StrictMode>`** in `main.tsx` — its dev double-mount made framer-motion
  replay every entrance ("animates in twice"). Leave it out.
- **`BASE_PATH` is the one deploy knob.** Feeds Vite `base` → exposed as
  `import.meta.env.BASE_URL` → router `basepath`. Defaults to
  `/wedding-monogram/` (`.env`); the GH Actions workflow derives it from the
  repo name automatically. Root deploy (custom domain/user page) = set it to
  `/` AND `pathSegmentsToKeep = 0` in `public/404.html`.
- **Clean URLs on Pages** rely on `public/404.html` + the restore snippet in
  `index.html` (spa-github-pages). Don't switch to hash routing.
- **`src/routeTree.gen.ts` is committed** (not ignored): `npm run build`
  type-checks before Vite's TanStack plugin regenerates it, so it must exist
  on a clean checkout. The plugin rewrites it on dev/build.
- **Monogram is reused, not duplicated mindfully.** `src/lib/monogram-path.ts`
  is a copy of `led-wall/src/paths.ts`; `public/monogram.svg` (favicon) and
  `npm run qr` (branded QR) are generated from it. Palette mirrors
  `tailwind.config.ts` ↔ the gold-foil stops from `monogram-as-gold.svg`.
- **Visual verification:** `npm run preview` (binds `--host`) + the cached
  `zenika/alpine-chrome` Docker image to screenshot routes at a mobile
  viewport (`--window-size=390,844 --virtual-time-budget=6000` to let
  entrance animations settle). Write shots to `scratch/`, `rm -rf` after.
  Caveat learned: each `docker run` is a cold container, so a capture can
  intermittently render blank (the SPA hadn't mounted) — especially for deep
  routes or very tall `--window-size` heights. A blank
  is almost always this race, not a code bug; do a throwaway warm-up run first,
  re-shoot, and trust `tsc`/`vite build` + the live dev server over a one-off
  blank. Don't rabbit-hole debugging a blank screenshot.
- **Motion is gated.** Everything degrades under `prefers-reduced-motion`
  (CSS base layer + framer-motion `useReducedMotion`); keep it that way.
