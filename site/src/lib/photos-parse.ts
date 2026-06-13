/**
 * Parser for the "Photos" tab of the couple's Google Sheet — the formal
 * (after-ceremony) group-photo shot list.
 *
 * Tab layout (mirrors the seating "blank cell = separator" convention):
 *   - OPTIONAL note row: cell A1 = "Note" (any case), B1 = the note text
 *     (e.g. "Aim to finish by 11:00 — …")
 *   - then column A holds one shot per row (e.g. "B&G w/ Groom's Parents"),
 *     with a BLANK ROW separating logical sections (immediate family / bridal
 *     party / extended family / church).
 *
 * Pure and dependency-free, so the same parser runs in the browser (live
 * fetch) and in the build-time snapshot script.
 */
export type PhotoData = {
  note: string;
  /** Each section is an ordered list of shot descriptions. */
  sections: string[][];
};

const clean = (s: unknown): string => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");

export function parsePhotoGrid(rows: string[][]): PhotoData {
  const grid = rows.map((r) => (Array.isArray(r) ? r.map(clean) : []));

  let note = "";
  let start = 0;
  if (grid.length && /^note\b/i.test(grid[0][0] ?? "")) {
    note = clean(grid[0][1]) || (grid[0][0] ?? "").replace(/^note:?\s*/i, "");
    start = 1;
  }

  // Column A, blank row = section break.
  const colA = grid.slice(start).map((r) => clean(r[0] ?? ""));
  while (colA.length && !colA[colA.length - 1]) colA.pop();

  const sections: string[][] = [];
  let cur: string[] = [];
  for (const shot of colA) {
    if (shot) cur.push(shot);
    else if (cur.length) {
      sections.push(cur);
      cur = [];
    }
  }
  if (cur.length) sections.push(cur);

  return { note, sections: sections.filter((s) => s.length > 0) };
}
