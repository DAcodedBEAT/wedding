/**
 * Build-time snapshot of the formal photo list — the OFFLINE FALLBACK.
 *
 * `usePhotos()` shows the live "Photos" tab of the seating Google Sheet when
 * configured; if that fetch fails (or no API key is set) it falls back here.
 *
 * ⚠️ Generated: `npm run sheets:pull` overwrites this file from the live sheet
 * (see scripts/pull-sheets.ts). The data below was transcribed from the
 * couple's "Formal Photograph List" Google Doc — edit the sheet, not this file.
 */
import type { PhotoData } from "../lib/photos-parse";

export const photosSnapshot: PhotoData = {
  note: "",
  sections: [
    [
      "B&G",
      "B&G w/ Both Achens",
      "B&G w/ Groom's Parents",
      "B&G w/ Groom's Parents & Ann Mary, JP, Joshua, Ayva",
      "B&G w/ Ann Mary, JP, Joshua, Ayva",
      "B&G w/ Ann Mary, JP, Joshua, Ayva + Sundeep, Mishna, Adam, Asher",
      "B&G w/ Bride's Sundeep, Mishna, Adam, Asher",
      "B&G w/ Bride's Parents & Sundeep, Mishna, Adam, Asher",
      "B&G w/ Bride's Parents",
      "B&G w/ Bride's Parents + Groom's Parents",
      "B&G w/ Both Parents + Both Siblings (Ann Mary, JP, Joshua, Ayva + Sundeep, Mishna, Adam, Asher)",
    ],
    [
      "B&G w/ Bridal Party: Rhea, Amanda, Aarti, Greg, Pravin, Brian",
      "B&G w/ Joy Myalil & Family, Molly Zachariah",
      "B&G w/ Jose Paul & Family",
      "B&G w/ Jaison Joseph & Family",
      "B&G w/ John Oommen & Family",
      "B&G w/ All Bride's Houston Family",
    ],
    [
      "B&G w/ Joy Appachen, Shantammamma, James Achachen & Family, Joice Chechy & Family",
      "B&G w/ Mercy Ammachi, Premod Achachen & Family, Premachechi & Family, Pradeep Achachen & Family",
      "B&G w/ Sandychechi & Family",
      "B&G w/ Aniyan Appachen, Anil Achachen & Family, Ajay Achachen & Family",
      "B&G w/ Jubin Achachen & Family",
      "B&G w/ Balan Uncle, Lali Aunty, Libin Achachen & Family, Vibin Achachen",
      "B&G w/ Sheelammamma, Suraj Achachen & Family, Divya Chechy & Family",
      "B&G w/ Raju Uncle & Glady Aunty, Roby Achachen & Family, Reena Chechy & Family",
      "B&G w/ Groom's Father's Side",
      "B&G w/ Papa, Velyamy, Joel, Ruth, Alisha, Aaron, Ruben, Christine",
      "B&G w/ Alexchayan Uncle, Thankamma Aunty, Sam Achachen & Family, Shaun Achachen & Family",
      "B&G w/ Groom's Mom's Side",
      "B&G w/ Church",
      "B&G w/ Old Church (TX)",
    ],
  ],
};
