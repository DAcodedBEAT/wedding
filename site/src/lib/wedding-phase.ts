// All boundaries in UTC; the wedding is in EDT (UTC-4, June 2026).

// 7:00 AM EDT = 11:00 UTC → redirect to /ceremony (2 h before 9 AM)
const CEREMONY_REDIRECT = new Date('2026-06-27T11:00:00Z');
// 9:40 AM EDT = 13:40 UTC → redirect to /reception (40 min after 9 AM)
const RECEPTION_REDIRECT = new Date('2026-06-27T13:40:00Z');
// 4:30 PM EDT = 20:30 UTC → back to landing, post phase
const RECEPTION_END = new Date('2026-06-27T20:30:00Z');

/** Ceremony start (9:00 AM EDT) — the countdown target. */
export const CEREMONY_START = new Date('2026-06-27T13:00:00Z');

export type WeddingPhase = 'pre' | 'ceremony-default' | 'reception-default' | 'post';

export function getWeddingPhase(now = new Date()): WeddingPhase {
  if (now < CEREMONY_REDIRECT)  return 'pre';
  if (now < RECEPTION_REDIRECT) return 'ceremony-default';
  if (now < RECEPTION_END)      return 'reception-default';
  return 'post';
}

export function getCountdown(target: Date, now = new Date()) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
  };
}
