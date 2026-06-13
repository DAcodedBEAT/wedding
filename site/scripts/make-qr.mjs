// Generate a branded SVG QR code: gold-foil modules with the A&S monogram
// inset in the centre. High error-correction (H) keeps it scannable despite
// the centre cutout.
//
//   npm run qr -- "https://username.github.io/wedding-monogram/" [out.svg]
//
// Defaults to a placeholder URL; pass the real Pages URL as the first arg.
// Output defaults to public/wedding-qr.svg.
import QRCode from "qrcode";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const url =
  process.argv[2] || process.env.SITE_URL || "https://USERNAME.github.io/wedding-monogram/";
const outArg = process.argv[3] || "public/wedding-qr.svg";
const outPath = path.isAbsolute(outArg) ? outArg : path.join(root, outArg);

const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
const N = qr.modules.size;
const cells = qr.modules.data;

const quiet = 4; // quiet-zone modules
const scale = 16; // px per module
const total = (N + quiet * 2) * scale;

// Centre clear-zone for the monogram (~30% of the symbol).
const clear = Math.round(N * 0.3);
const c0 = Math.floor((N - clear) / 2);
const c1 = c0 + clear;

let rects = "";
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    if (!cells[r * N + c]) continue;
    if (r >= c0 && r < c1 && c >= c0 && c < c1) continue; // leave centre open
    const x = (c + quiet) * scale;
    const y = (r + quiet) * scale;
    rects += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" rx="${(scale * 0.18).toFixed(1)}"/>`;
  }
}

// Inline the monogram artwork (public/monogram-badge.svg) into the centre,
// sized to the clear-zone with an ivory rounded backing.
const mono = fs.readFileSync(path.join(root, "public/monogram-badge.svg"), "utf8");
const inner = mono.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const vb = (mono.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 100 100";

const padPx = clear * scale * 0.16;
const zoneX = (c0 + quiet) * scale;
const zoneY = (c0 + quiet) * scale;
const zonePx = clear * scale;
const monoX = zoneX + padPx;
const monoY = zoneY + padPx;
const monoSize = zonePx - padPx * 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
  <defs>
    <linearGradient id="qrfoil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9c7b3f"/>
      <stop offset="30%" stop-color="#cda86a"/>
      <stop offset="50%" stop-color="#f6e7c8"/>
      <stop offset="70%" stop-color="#cda86a"/>
      <stop offset="100%" stop-color="#8a6a35"/>
    </linearGradient>
  </defs>
  <rect width="${total}" height="${total}" rx="${total * 0.04}" fill="#f5f1ec"/>
  <g fill="url(#qrfoil)">${rects}</g>
  <rect x="${zoneX}" y="${zoneY}" width="${zonePx}" height="${zonePx}" rx="${zonePx * 0.18}" fill="#f5f1ec"/>
  <svg x="${monoX}" y="${monoY}" width="${monoSize}" height="${monoSize}" viewBox="${vb}">${inner}</svg>
</svg>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg);
console.log(
  `✓ QR for ${url}\n  → ${path.relative(root, outPath)} (${(svg.length / 1024).toFixed(1)} kB, ${N}×${N} modules, EC level H)`,
);
if (url.includes("USERNAME")) {
  console.log("  ⚠ Using a placeholder URL — pass your real Pages URL: npm run qr -- <url>");
}
