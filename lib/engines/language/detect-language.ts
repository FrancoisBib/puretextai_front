/**
 * Pure port of `detectLang()`.
 */

import { STOPWORDS, type LangCode } from "./languages.data";

export interface LangDetection {
  code: LangCode;
  /** True once at least 4 stopword hits were found for `code`. */
  sure: boolean;
}

export function detectLang(src: string): LangDetection {
  const s = " " + String(src).toLowerCase().replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ") + " ";
  let best: LangCode = "FR";
  let score = 0;
  (Object.keys(STOPWORDS) as LangCode[]).forEach((k) => {
    let n = 0;
    STOPWORDS[k].forEach((w) => {
      n += s.split(w).length - 1;
    });
    if (n > score) {
      score = n;
      best = k;
    }
  });
  return { code: best, sure: score >= 4 };
}
