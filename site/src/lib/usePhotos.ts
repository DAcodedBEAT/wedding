import { parsePhotoGrid, type PhotoData } from "./photos-parse";
import { photosSnapshot } from "../data/photos-snapshot";
import { useSheet, type SheetStatus } from "./sheets";

/**
 * The formal photo list. Reads the "Photos" tab of the couple's Google Sheet
 * (read-only) and falls back to the bundled build-time snapshot. See ./sheets.ts.
 */
const RANGE = (import.meta.env.VITE_SHEETS_PHOTOS_RANGE as string | undefined) ?? "Photos";

const isEmpty = (d: PhotoData) => d.sections.length === 0;

export function usePhotos(): { data: PhotoData; status: SheetStatus } {
  return useSheet(RANGE, parsePhotoGrid, photosSnapshot, isEmpty);
}
