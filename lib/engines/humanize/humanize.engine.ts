/**
 * Pure port of the Humanisation module's `humanize()` method. No
 * React/Zustand imports; the store/selector layer is responsible for
 * deriving view state (reverted sentences, hover/open index, plain text,
 * AI-probability-after, etc.) from this raw list.
 */

export interface HumanizedSentence {
  text: string;
  changed: boolean;
  /** The original sentence, present for changed entries (empty string for an appended tail sentence). */
  before?: string;
  tag?: string;
  why?: string;
}

export interface ChangedEntry {
  x: HumanizedSentence;
  /** Index of this sentence within the full `humanOut` array. */
  i: number;
}

/** The subset of `humanOut` that was actually rewritten, paired with its original index. */
export function changedEntries(humanOut: HumanizedSentence[]): ChangedEntry[] {
  const changed = humanOut.filter((x) => x.changed);
  return changed.map((x) => ({ x, i: humanOut.indexOf(x) }));
}

/**
 * Joins the "effective" text of every sentence (reverted ones use their
 * original `before`, others use the rewritten `text`), ported from the
 * `eff`/`plain` computation in `renderVals()`.
 */
export function effectiveHumanizedText(humanOut: HumanizedSentence[], reverted: Record<number, boolean>): string {
  const eff = humanOut.map((x, i) => (reverted[i] ? x.before || "" : x.text));
  return eff.filter(Boolean).join(" ");
}
