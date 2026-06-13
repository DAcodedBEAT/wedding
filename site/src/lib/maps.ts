/**
 * Directions links derived from a single plain-text address — so the data
 * only ever stores the address, never a vendor-specific URL. Google is the
 * universal default (works in any browser, deep-links the Google Maps app
 * on mobile); Apple/Waze are offered as "open in your app" alternatives.
 * A raw address also lets the host OS route it to whatever maps app the
 * guest has registered as their default.
 */
export type MapLinks = {
  google: string;
  apple: string;
  waze: string;
};

export function mapLinks(address: string): MapLinks {
  const q = encodeURIComponent(address);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    apple: `https://maps.apple.com/?q=${q}`,
    waze: `https://waze.com/ul?q=${q}`,
  };
}
