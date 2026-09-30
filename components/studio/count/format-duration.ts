/** "45 s" under a minute, "2 min 05" above it (localized via `studio.count`'s `duration.*` keys). */
export function formatCountDuration(
  seconds: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (seconds < 60) return t("duration.short", { s: seconds });
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return t("duration.long", { m, s });
}
