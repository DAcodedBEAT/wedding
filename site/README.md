# Wedding Site — Arun & Shalet

A static, mobile-first wedding website built around the A&S monogram. Nav is
**Home · Ceremony · Reception · Zola**: an animated monogram landing with a
"When & Where" block, a Ceremony page (welcome, venue, a link to the
order-of-service PDF, and the formal photo list) and a Reception page (venue,
a searchable seating chart, the schedule, and a registry nudge), plus an
external Zola registry link. React + Vite + TypeScript + TailwindCSS + TanStack Router,
deployed to GitHub Pages. The seating chart + photo list read live from a
Google Sheet; everything else is static config/data.

## Before launch (outstanding)

- [x] **Zola registry URL** — set in `src/config/wedding.ts` (`REGISTRY_URL`,
      with `WEDDING_URL` for the Zola hub). Edit there to change it.
- [ ] **Google Sheet live data** — create the API key + share the sheet, set
      `.env.local` / CI secrets (see "Data-driven sections"). Until then the site
      ships the committed snapshots, which already hold the real seating + photo lists.
- [ ] **`Photos` tab** — add it to the seating spreadsheet in the documented
      layout (one shot per row, blank row between sections) so the photo list goes live.
- [ ] **Ceremony booklet PDF** — upload the printed booklet to Google Drive,
      share it "Anyone with the link → Viewer", and paste the link into
      `ceremony.booklet.pdfUrl` (`src/data/ceremony.ts`). The booklet section shows
      "Coming soon." until it's set.
- [ ] **Git + Pages** — the repo isn't initialized yet; see "Deploy".

## Develop

```bash
cd site
npm install
npm run dev        # http://localhost:5173/wedding-monogram/
```

Other scripts:

```bash
npm run build      # type-check + production build → site/dist
npm run preview    # serve the production build locally
npm run qr -- "https://<user>.github.io/wedding-monogram/"   # branded QR → public/wedding-qr.svg
npm run lint       # oxlint
npm run fmt        # oxfmt (write); use `npm run fmt:check` in CI
```

## Make it yours (porting to another couple)

Almost everything lives in two places — no need to touch components:

- **`src/config/wedding.ts`** — names, date, venue, registry URL, tagline,
  palette, navigation, feature flags. The single source of truth.
- **`src/data/`** — `ceremony.ts` (welcome, order-of-service PDF link, venue),
  `reception.ts` (intro, schedule, venue), and
  `seating-snapshot.ts` (the offline fallback for the seating chart — see
  below; normally generated from the live Google Sheet).

The monogram artwork is `src/lib/monogram-path.ts` (copied from
`../led-wall/src/paths.ts`) and `public/monogram.svg`. Swap those to change
the mark. Colours are defined once in `tailwind.config.ts` and mirrored in
the config `theme`.

To add a page: drop a file in `src/routes/` (auto-registered by the TanStack
Router plugin) and add an entry to `wedding.nav`.

## Data-driven sections (Google Sheet)

Two sections read live from the couple's **Google Sheet** at runtime (read-only
`values.get`), each from its own tab on the **same spreadsheet** (one file, one
API key — `src/lib/sheets.ts`):

- **Seating chart** — `src/lib/useSeating.ts`, tab `VITE_SHEETS_RANGE`
  (default `Sheet1`). Column-per-table; the `Table N` row is the header; a
  **blank cell separates family/couple groups**. Parser:
  `src/lib/seating-parse.ts`.
- **Photo list** — `src/lib/usePhotos.ts`, tab `VITE_SHEETS_PHOTOS_RANGE`
  (default `Photos`). Optional `Note` in A1 + text in B1, then one shot per row
  in column A with a **blank row between sections**. Parser:
  `src/lib/photos-parse.ts`.

If a live fetch is unconfigured or fails, each falls back to its bundled
snapshot (`src/data/seating-snapshot.ts`, `src/data/photos-snapshot.ts`), so a
section is **never empty at the reception**. Regenerate both snapshots from the
live sheet with:

```bash
npm run sheets:pull   # reads .env.local / .env, rewrites the *-snapshot.ts files
```

In CI, run `npm run sheets:pull` before `npm run build` with the key in a
secret (it no-ops without keys, and skips any missing tab, so it's safe to wire
up early).

### Setup

1. Keep **only guest-facing data** in the shared tabs (seating: name + table;
   photos: shot descriptions). Put meal choices, phone numbers, RSVP notes,
   etc. in a _separate private sheet_.
2. Share that sheet **"Anyone with the link → Viewer"** (read-only).
3. Create a Google **API key** restricted to **(a) the Sheets API only** and
   **(b) your Pages / custom-domain HTTP referrers**.
4. Copy `.env.example` → `.env.local` and set `VITE_SHEETS_API_KEY`
   (`VITE_SHEETS_ID` / `VITE_SHEETS_RANGE` default to the current sheet).

### Security note

On a static site the API key is **necessarily public** (it ships in the
bundle) and the sheet must be **link-readable** — so anyone can read the
shared tabs. That's why they must hold _only_ guest-facing data (seating:
name + table; photos: shot descriptions), stay view-only, and the key must be
**restricted to the Sheets API + your referrers** (read-only Sheets calls are
free, so the worst abuse is hitting a rate limit). No write path is exposed.

## Deploy (GitHub Pages)

1. This folder lives inside a git repo with a GitHub remote. Push to `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. `.github/workflows/deploy.yml` (at the repo root) builds `site/` and
   publishes it. `BASE_PATH` is derived automatically from the repo name, so
   a rename needs no edits.
4. For **live** seating/photos on the deployed site, add repo secrets
   `VITE_SHEETS_ID` and `VITE_SHEETS_API_KEY` (Settings → Secrets and variables
   → Actions). The workflow passes them to the build and runs `sheets:pull`
   first. Without them the deploy still works and ships the committed snapshots.

Live URL: `https://<user>.github.io/<repo>/`. Point the printed QR there
(`npm run qr -- <that-url>`).

### Hosting at a root path (custom domain / user-org page)

If you serve from `/` instead of a project subpath:

- Set `BASE_PATH=/` (the `.env` file, or override the workflow env).
- In `public/404.html`, set `pathSegmentsToKeep = 0`.

## How clean URLs work on Pages

GitHub Pages has no SPA fallback, so a refresh of `/wedding-monogram/seating`
would 404. `public/404.html` encodes the path into a query and redirects to
the base `index.html`, which decodes it back into history before the router
mounts (the `spa-github-pages` technique). Result: clean, shareable URLs with
no `#`. `src/routeTree.gen.ts` is committed because `npm run build`
type-checks before Vite regenerates it.
