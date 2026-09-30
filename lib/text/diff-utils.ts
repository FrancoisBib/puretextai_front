/**
 * Shared before/after formatting helpers used by the humanize, verify,
 * citation, and readability engines.
 */

/** Truncates `text` to `max` characters, appending `ellipsis` if cut. */
export function truncate(text: string, max: number, ellipsis = "…"): string {
  return text.length > max ? text.slice(0, max - ellipsis.length) + ellipsis : text;
}

/** Appends a trailing period unless the string already ends in . ? or ! */
export function dotTerminate(value: string): string {
  return value && !/[.?!]$/.test(value) ? `${value}.` : value;
}

/** Joins non-empty strings with a separator, dropping any falsy entries. */
export function joinNonEmpty(parts: Array<string | undefined | null | false>, sep = " "): string {
  return parts.filter((p): p is string => Boolean(p)).join(sep);
}
