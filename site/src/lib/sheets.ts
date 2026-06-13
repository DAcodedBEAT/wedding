import { useEffect, useState } from "react";

/**
 * Shared Google Sheets plumbing for the data-driven sections (seating chart,
 * photo list). Both live on the SAME spreadsheet (`VITE_SHEETS_ID`) — just
 * different tabs — so the couple connects one file and one API key.
 *
 * Security: the API key is necessarily public on a static site. Restrict it to
 * the Sheets API + your Pages/custom-domain referrers, share the sheet
 * view-only, and keep only guest-facing data in the shared tabs (see README).
 */
const SHEET_ID = import.meta.env.VITE_SHEETS_ID as string | undefined;
const API_KEY = import.meta.env.VITE_SHEETS_API_KEY as string | undefined;

export function sheetsConfigured(): boolean {
  return Boolean(SHEET_ID && API_KEY);
}

export function sheetRowsUrl(range: string): string | null {
  if (!SHEET_ID || !API_KEY) return null;
  return (
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
    `${encodeURIComponent(range)}?key=${API_KEY}&majorDimension=ROWS`
  );
}

export async function fetchSheetRows(range: string): Promise<string[][]> {
  const url = sheetRowsUrl(range);
  if (!url) throw new Error("Sheets not configured");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API ${res.status}`);
  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

export type SheetStatus = "live" | "snapshot" | "loading";

/**
 * Generic "live tab with offline fallback" hook. Fetches + parses a tab; on any
 * failure (unconfigured, network/API error, empty parse) it keeps `fallback`,
 * so a section is never empty. `parse`/`fallback`/`isEmpty` must be stable
 * module-level references.
 */
export function useSheet<T>(
  range: string,
  parse: (rows: string[][]) => T,
  fallback: T,
  isEmpty: (value: T) => boolean
): { data: T; status: SheetStatus } {
  const configured = sheetsConfigured();
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<SheetStatus>(configured ? "loading" : "snapshot");

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    (async () => {
      try {
        const parsed = parse(await fetchSheetRows(range));
        if (cancelled) return;
        if (isEmpty(parsed)) throw new Error("empty parse");
        setData(parsed);
        setStatus("live");
      } catch {
        if (cancelled) return;
        setData(fallback);
        setStatus("snapshot");
      }
    })();

    return () => {
      cancelled = true;
    };
    // range is the only runtime-varying input; the rest are module constants.
  }, [range, configured]);

  return { data, status };
}
