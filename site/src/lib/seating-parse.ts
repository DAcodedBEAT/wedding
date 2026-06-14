/**
 * Parser for the couple's "seating chart" Google Sheet.
 *
 * Real-world layout (from the live sheet):
 *   - one or more PREAMBLE rows above the header (e.g. "Total Count, 267, …",
 *     "kid count (<=12 y/o), …") — skipped automatically
 *   - a HEADER row whose cells read "Table 1", "Table 2", … (one column per
 *     table; a non-numbered header like "nb" is kept as its own column)
 *   - DATA rows: guest names down each column, with a BLANK cell separating
 *     family/couple groups
 *   - trailing TOTAL/count rows at the bottom — skipped automatically
 *
 * The same grid (a `string[][]` of rows) comes from two places — the live
 * Sheets API call and the build-time snapshot script — so this parser is the
 * single source of truth for both. It is pure and dependency-free.
 */

/** A family / couple / solo: names that sit together with no blank between. */
export type Group = string[];
export type Table = { id: number; label: string; groups: Group[] };
/** A guest, with the full family/couple cluster they're seated with
 *  (including themselves) — drives the "you're seated with…" UI. */
export type Guest = { name: string; table: number; group: Group };
export type SeatingData = {
  tables: Table[];
  guests: Guest[];
  /** Table ids in display order. */
  tableIds: number[];
};

const TABLE_RE = /^\s*table\s*0*(\d+)/i;
const SUMMARY_RE = /total|count|guest|vendor|bab(y|ies)|child|kid|adult|couple/i;

const clean = (s: unknown): string => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");
const isNumeric = (s: string): boolean => /^\d+\s*\??$/.test(s);

/** Index of the header row — the first row with ≥2 "Table N" cells. */
function findHeaderRow(rows: string[][]): number {
  let best = -1;
  let bestCount = 1;
  for (let r = 0; r < rows.length; r++) {
    const count = rows[r].filter((c) => TABLE_RE.test(clean(c))).length;
    if (count > bestCount) {
      best = r;
      bestCount = count;
    }
  }
  return best;
}

/** A row counts as a footer/summary once names have started: mostly numbers,
 *  or a label like "Total Guests:". */
function isSummaryRow(cells: string[], tableCols: number[]): boolean {
  const first = clean(cells[0]);
  if (first && SUMMARY_RE.test(first) && !TABLE_RE.test(first)) return true;
  const vals = tableCols.map((c) => clean(cells[c])).filter(Boolean);
  if (vals.length === 0) return false;
  const numeric = vals.filter(isNumeric).length;
  return numeric / vals.length >= 0.5;
}

export function parseSeatingGrid(rows: string[][]): SeatingData {
  const grid = rows.map((r) => (Array.isArray(r) ? r.map(clean) : []));
  const h = findHeaderRow(grid);
  if (h < 0) return { tables: [], guests: [], tableIds: [] };

  const header = grid[h];
  // Columns that name a table (skip blank header cells).
  const tableCols: number[] = [];
  header.forEach((cell, c) => {
    if (cell) tableCols.push(c);
  });

  // Collect each column's cells until the first summary/footer row.
  const colCells: Record<number, string[]> = {};
  tableCols.forEach((c) => (colCells[c] = []));
  for (let r = h + 1; r < grid.length; r++) {
    if (isSummaryRow(grid[r], tableCols)) break;
    tableCols.forEach((c) => colCells[c].push(grid[r][c] ?? ""));
  }

  const tables: Table[] = tableCols.map((c, i) => {
    const label = header[c];
    const m = label.match(TABLE_RE);
    // Numbered tables sort by number; un-numbered (e.g. "nb") sort last, stably.
    const id = m ? Number(m[1]) : 1000 + i;

    // Trim trailing blanks, then split on blank-cell runs into groups.
    const cells = [...colCells[c]];
    while (cells.length && !cells[cells.length - 1]) cells.pop();
    const groups: Group[] = [];
    let cur: Group = [];
    for (const name of cells) {
      if (name) {
        cur.push(name);
      } else if (cur.length) {
        groups.push(cur);
        cur = [];
      }
    }
    if (cur.length) groups.push(cur);

    return { id, label, groups };
  });

  // Drop empty tables, sort by id.
  const filled = tables.filter((t) => t.groups.length > 0).sort((a, b) => a.id - b.id);

  const guests: Guest[] = [];
  for (const t of filled) {
    for (const g of t.groups) for (const name of g) guests.push({ name, table: t.id, group: g });
  }

  return { tables: filled, guests, tableIds: filled.map((t) => t.id) };
}

// ---- small lookups shared by the UI -----------------------------------------

export function tableById(data: SeatingData, id: number): Table | undefined {
  return data.tables.find((t) => t.id === id);
}

export function tableLabel(data: SeatingData, id: number): string {
  return tableById(data, id)?.label ?? `Table ${id}`;
}

/** Leading honorific (Mr./Mrs./Ms./Dr./Capt./Fr./Rev./Mx.…) — stripped so the
 *  A–Z roster sorts by the actual name rather than clustering under "M". */
const HONORIFIC_RE = /^(mr|mrs|ms|miss|mx|dr|fr|rev|sr|capt|col|maj|lt|sgt|prof)\.?\s+/i;

/** A guest's name with any leading honorific removed (for sorting/display). */
export function nameSortKey(name: string): string {
  return name.replace(HONORIFIC_RE, "").trim().toLocaleLowerCase();
}

/** All guests sorted alphabetically, honorific-insensitive — drives the
 *  "Everyone A–Z" roster view. */
export function sortGuestsByName(guests: Guest[]): Guest[] {
  return [...guests].sort((a, b) => nameSortKey(a.name).localeCompare(nameSortKey(b.name)));
}
