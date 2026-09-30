/**
 * Compteur view-model — port of the source's `countVals` presentation layer
 * (script_block.txt:618-646). The numbers themselves come from
 * `lib/engines/count/count.engine.ts`.
 *
 * Exposes raw numbers only (no formatted labels): a selector is a plain
 * function of `StudioState`, with no access to the site's locale, so
 * `toLocaleString`/`useTranslations` formatting happens in
 * `components/studio/count/*` instead.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

import { analyseCount } from "@/lib/engines/count/count.engine";

export interface CountView {
  cText: string;
  setCText: (value: string) => void;
  cClear: () => void;
  /** Hands this text to Lisibilité and runs the measure there. */
  cGoRead: () => void;

  cWords: number;
  cChars: number;
  cCharsNoSpace: number;
  cSentences: number;
  cParagraphs: number;
  cReadingSeconds: number;
  cSpokenSeconds: number;
}

function computeCountView(s: StudioState): CountView {
  const a = analyseCount(s.cText);
  return {
    cText: s.cText,
    setCText: (value) => useStudioStore.getState().setCText(value),
    cClear: () => useStudioStore.getState().cClear(),
    cGoRead: () => useStudioStore.getState().goReadWith(s.cText),

    cWords: a.words,
    cChars: a.chars,
    cCharsNoSpace: a.charsNoSpace,
    cSentences: a.sentences,
    cParagraphs: a.paragraphs,
    cReadingSeconds: a.readingSeconds,
    cSpokenSeconds: a.spokenSeconds,
  };
}

export const selectCountView = memoizeLast(computeCountView);
