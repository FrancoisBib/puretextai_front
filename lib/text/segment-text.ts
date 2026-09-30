/**
 * Shared sentence/word splitting utilities used by several engines
 * (grammar, verify, readability). Ported from the regexes used
 * throughout the original DCLogic component (`vFindings`, `aiAnalyse`,
 * `simAnalyse`, `verifyVals`).
 */

/** Matches a sentence *including* its trailing punctuation and whitespace. */
const SENTENCE_KEEP_TRAILING = /[^.!?…]+[.!?…]*\s*/g;

/**
 * Splits text into sentences, keeping trailing punctuation/whitespace
 * attached to each chunk. Used wherever the original code needs to
 * reconstruct the exact source text from its sentence pieces (e.g.
 * `vFindings`, `verifyVals`, correction-run building).
 */
export function splitSentencesKeepTrailing(text: string): string[] {
  return text.match(SENTENCE_KEEP_TRAILING) || [];
}

/**
 * Splits text into trimmed sentences with punctuation stripped. Used by
 * `aiAnalyse`/`simAnalyse`-style statistics where only the words matter.
 */
export function splitSentencesTrimmed(text: string): string[] {
  return text
    .split(/[.!?…]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Word count of a string (0 for blank/whitespace-only strings). */
export function wordCount(str: string): number {
  const t = str.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** The words of a string (empty array for blank/whitespace-only strings). */
export function wordsOf(str: string): string[] {
  const t = str.trim();
  return t ? t.split(/\s+/) : [];
}

/** Lowercases a word and strips everything but letters/apostrophes/hyphens. */
export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}'-]/gu, "");
}

/**
 * Clamps a computed sub-score into the [min, max] band the original
 * component used everywhere (`Math.max(3, Math.min(97, Math.round(v)))`
 * in `aiAnalyse`). Readability re-uses the exact same bounds.
 */
export function clampScore(value: number, min = 3, max = 97): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Counts how many times each phrase in `phrases` occurs in `paddedLowerText`
 * (a lowercased string padded with leading/trailing spaces, as produced by
 * `" " + txt.toLowerCase() + " "`), mirroring `aiAnalyse`'s `count` helper.
 */
export function countOccurrences(paddedLowerText: string, phrases: string[]): number {
  return phrases.reduce((total, phrase) => total + (paddedLowerText.split(phrase).length - 1), 0);
}

/** Normalizes a raw occurrence count to "per 100 words", per `aiAnalyse`'s `per100`. */
export function per100Words(count: number, totalWords: number): number {
  return totalWords ? (count / totalWords) * 100 : 0;
}
