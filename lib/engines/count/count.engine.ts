/**
 * Compteur engine — port of the source's `countVals`
 * (script_block.txt:618-646). Everything is computed locally, on every
 * keystroke; nothing is sent anywhere. Pure — no React, no Zustand.
 *
 * Returns raw numbers only — no formatted strings, no locale-specific
 * labels. Number formatting (`toLocaleString`) and unit labels (via
 * `useTranslations`) are the UI layer's job (`lib/store/selectors/count.ts`
 * and `components/studio/count/*`), since this module has no access to the
 * site's locale.
 */

import { wordCount } from "@/lib/text/segment-text";

/** Reading speeds the design quotes, in words per minute. */
const SILENT_WPM = 220;
const SPOKEN_WPM = 140;

export interface CountAnalysis {
  words: number;
  chars: number;
  charsNoSpace: number;
  sentences: number;
  paragraphs: number;
  /** Silent-reading duration, in whole seconds. */
  readingSeconds: number;
  /** Read-aloud duration, in whole seconds. */
  spokenSeconds: number;
}

export function analyseCount(src: string): CountAnalysis {
  const text = src ?? "";

  const words = wordCount(text);
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  // Trailing fragment without a final mark still counts as a sentence.
  const sentences =
    (text.match(/[^.!?]+[.!?]+/g) || []).length + (/[^.!?\s][^.!?]*$/.test(text.trim()) ? 1 : 0);
  const paragraphs = text.trim()
    ? text
        .trim()
        .split(/\n\s*\n/)
        .filter((x) => x.trim()).length
    : 0;

  return {
    words,
    chars,
    charsNoSpace,
    sentences,
    paragraphs,
    readingSeconds: Math.round((words / SILENT_WPM) * 60),
    spokenSeconds: Math.round((words / SPOKEN_WPM) * 60),
  };
}
