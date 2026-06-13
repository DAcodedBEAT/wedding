/** A tiny haptic tick on supporting devices (mobile). No-op elsewhere. */
export function tick(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* ignore */
    }
  }
}
