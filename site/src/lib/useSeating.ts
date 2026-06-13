import { parseSeatingGrid, type SeatingData } from "./seating-parse";
import { seatingSnapshot } from "../data/seating-snapshot";
import { useSheet, type SheetStatus } from "./sheets";

/**
 * The seating chart's data. Reads the seating tab of the couple's Google Sheet
 * (read-only) and falls back to the bundled build-time snapshot. See ./sheets.ts.
 */
const RANGE = (import.meta.env.VITE_SHEETS_RANGE as string | undefined) ?? "Sheet1";

const isEmpty = (d: SeatingData) => d.guests.length === 0;

export type SeatingStatus = SheetStatus;

export function useSeating(): { data: SeatingData; status: SeatingStatus } {
  return useSheet(RANGE, parseSeatingGrid, seatingSnapshot, isEmpty);
}
