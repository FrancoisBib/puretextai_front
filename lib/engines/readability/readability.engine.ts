/**
 * Lisibilité engine — port of the source's `readVals` (script_block.txt:385-529).
 *
 * The score is a Flesch-style reading-ease index adapted to French
 * (Kandel-Moles): `207 − 1.015·ASL − 73·ASW`, clamped to 0-100, where ASL is the
 * average sentence length in words and ASW the average syllables per word.
 *
 * Exactly one finding per sentence, by priority: too long, then jargon, then
 * passive voice. Pure — no React, no Zustand, no next-intl: every field
 * below is either a number or a stable key + interpolation params, resolved
 * to display text by the selector/component layer, which does have access
 * to the site's locale.
 */

import {
  COMPLEX_WORD_SYLLABLES,
  JARGON,
  LONG_SENTENCE_WORDS,
  READABILITY_LEVELS,
  READ_FINDING_CATS,
  READ_FINDING_ORDER,
  type ReadabilityFindingKey,
  type ReadabilityLevel,
} from "./readability.data";

export type { ReadabilityFindingKey, ReadabilityLevel };

/** Longest quote shown in the sidebar before it is elided. */
const QUOTE_MAX = 165;

export interface ReadabilitySentence {
  /** Index in the sentence list — the anchor the runs and findings share. */
  i: number;
  /** Sentence with its original trailing whitespace, used to rebuild the text. */
  raw: string;
  /** Trimmed sentence, used for quoting. */
  body: string;
  /** Word count. */
  n: number;
  syls: number;
  complex: number;
  passive: boolean;
  jarg: string[];
}

export interface ReadabilityFinding {
  key: ReadabilityFindingKey;
  color: string;
  bg: string;
  sentenceIdx: number;
  quote: string;
  /** Interpolation params for `readability.findingWhy.<key>` ({n} for "longue", {terms} for "jargon", none for "passive"). */
  whyParams: Record<string, string | number>;
}

export type ReadabilitySignalKey = "sentenceLength" | "complexWords" | "passiveVoice" | "jargon";

export interface ReadabilitySignal {
  key: ReadabilitySignalKey;
  /** Interpolation params for `readability.signals.<key>.metric`. */
  metricParams: Record<string, string | number>;
  /** 0-100, already clamped to the design's 4% floor. */
  pct: number;
  color: string;
  /** Which of 3 `readability.signals.<key>.note.<n>` variants: 0 = worst, 2 = best. */
  noteLevel: 0 | 1 | 2;
}

export interface ReadabilityLegendItem {
  key: ReadabilityFindingKey;
  swatch: string;
  line: string;
  count: number;
}

export interface ReadabilityAnalysis {
  sentences: ReadabilitySentence[];
  words: number;
  sentenceCount: number;
  /** Average sentence length in words. */
  asl: number;
  score: number;
  level: ReadabilityLevel;
  signals: ReadabilitySignal[];
  findings: ReadabilityFinding[];
  legend: ReadabilityLegendItem[];
}

export interface ReadabilityRun {
  /** Sentence index this run renders. */
  sentenceIdx: number;
  text: string;
  bg: string;
  pad: string;
  ring: string;
  deco: "underline" | "none";
  decoColor: string;
  cursor: "pointer" | "text";
  /** Index into `analysis.findings`, or null when the sentence is unflagged. */
  findingIdx: number | null;
}

const PASSIVE_RE = /\b(est|sont|a été|ont été|était|étaient|sera|seront|étant)\s+\S*(é|és|ée|ées|ie|ies)\b/i;

/** Rough French syllable count: vowel groups, with `qu`/`gu` digraphs collapsed. */
function syllables(word: string): number {
  const groups = word
    .toLowerCase()
    .replace(/[^a-zàâäéèêëîïôöùûüÿç]/g, "")
    .replace(/(?:qu|gu)([aeiouy])/g, "$1")
    .match(/[aeiouyàâäéèêëîïôöùûüÿ]+/g);
  return groups ? Math.max(1, groups.length) : 1;
}

function splitReadabilitySentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]*\s*/g) || (text.trim() ? [text] : []);
}

/** Signal bar length: clamped to 4-100 so an empty signal still reads as a bar. */
function bar(value: number): number {
  return Math.max(4, Math.min(100, Math.round(value)));
}

/** Signal colour ramp, shared by all four bars. */
function col(value: number): string {
  return value >= 60 ? "#C0392B" : value >= 32 ? "#B4780F" : "#1F8A54";
}

function levelFor(score: number): ReadabilityLevel {
  return (READABILITY_LEVELS.find((b) => score >= b.min) ?? READABILITY_LEVELS[READABILITY_LEVELS.length - 1]).level;
}

function quoteOf(body: string): string {
  return body.length > QUOTE_MAX ? `${body.slice(0, QUOTE_MAX).trim()}…` : body;
}

function findingFor(s: ReadabilitySentence): ReadabilityFinding | null {
  let key: ReadabilityFindingKey;
  let whyParams: Record<string, string | number>;

  if (s.n >= LONG_SENTENCE_WORDS) {
    key = "longue";
    whyParams = { n: s.n };
  } else if (s.jarg.length) {
    key = "jargon";
    whyParams = { terms: s.jarg.join(" », « ") };
  } else if (s.passive) {
    key = "passive";
    whyParams = {};
  } else {
    return null;
  }

  const cat = READ_FINDING_CATS[key];
  return { key, color: cat.color, bg: cat.bg, sentenceIdx: s.i, quote: quoteOf(s.body), whyParams };
}

export function analyseReadability(src: string): ReadabilityAnalysis {
  const text = src ?? "";

  const sentences: ReadabilitySentence[] = splitReadabilitySentences(text)
    .map((raw, i) => {
      const body = raw.trim();
      const ws = body.split(/\s+/).filter(Boolean);
      return {
        i,
        raw,
        body,
        n: ws.length,
        syls: ws.reduce((a, w) => a + syllables(w), 0),
        complex: ws.filter((w) => syllables(w) >= COMPLEX_WORD_SYLLABLES).length,
        passive: PASSIVE_RE.test(body),
        jarg: JARGON.filter((j) => body.toLowerCase().includes(j)),
      };
    })
    .filter((x) => x.n > 0);

  const words = sentences.reduce((a, x) => a + x.n, 0);
  const syls = sentences.reduce((a, x) => a + x.syls, 0);
  const complex = sentences.reduce((a, x) => a + x.complex, 0);
  const nPassive = sentences.filter((x) => x.passive).length;
  const nJargon = sentences.reduce((a, x) => a + x.jarg.length, 0);

  const asl = sentences.length ? words / sentences.length : 0;
  const asw = words ? syls / words : 0;
  const score = Math.max(0, Math.min(100, Math.round(207 - 1.015 * asl - 73 * asw)));

  const pctComplex = words ? Math.round((complex / words) * 100) : 0;
  const pctPassive = sentences.length ? Math.round((nPassive / sentences.length) * 100) : 0;

  const lAsl = asl <= 15 ? 12 : Math.min(100, (asl - 15) * 5);
  const lComplex = Math.min(100, pctComplex * 5);
  const lPassive = Math.min(100, pctPassive * 2.2);
  const lJargon = Math.min(100, nJargon * 18);

  const findings = sentences.map(findingFor).filter((f): f is ReadabilityFinding => f !== null);

  const signals: ReadabilitySignal[] = [
    {
      key: "sentenceLength",
      metricParams: { asl: asl.toFixed(0) },
      pct: bar(lAsl),
      color: col(lAsl),
      noteLevel: asl >= 25 ? 0 : asl >= 20 ? 1 : 2,
    },
    {
      key: "complexWords",
      metricParams: { pct: pctComplex },
      pct: bar(lComplex),
      color: col(lComplex),
      noteLevel: pctComplex >= 18 ? 0 : pctComplex >= 10 ? 1 : 2,
    },
    {
      key: "passiveVoice",
      metricParams: { n: nPassive },
      pct: bar(lPassive),
      color: col(lPassive),
      noteLevel: pctPassive >= 30 ? 0 : nPassive ? 1 : 2,
    },
    {
      key: "jargon",
      metricParams: { n: nJargon },
      pct: bar(lJargon),
      color: col(lJargon),
      noteLevel: nJargon >= 4 ? 0 : nJargon ? 1 : 2,
    },
  ];

  const legend: ReadabilityLegendItem[] = READ_FINDING_ORDER.map((key) => ({
    key,
    swatch: READ_FINDING_CATS[key].bg,
    line: READ_FINDING_CATS[key].color,
    count: findings.filter((f) => f.key === key).length,
  })).filter((l) => l.count > 0);

  return {
    sentences,
    words,
    sentenceCount: sentences.length,
    asl,
    score,
    level: levelFor(score),
    signals,
    findings,
    legend,
  };
}

/**
 * One run per sentence. `selectedIdx` is the sidebar queue's current finding,
 * `openIdx` the one whose inline popover is open — either state tints the run.
 */
export function buildReadabilityRuns(
  analysis: ReadabilityAnalysis,
  selectedIdx: number | null,
  openIdx: number | null,
): ReadabilityRun[] {
  const selectedSentence =
    selectedIdx !== null && analysis.findings[selectedIdx] ? analysis.findings[selectedIdx].sentenceIdx : -1;

  return analysis.sentences.map((s) => {
    const findingIdx = analysis.findings.findIndex((f) => f.sentenceIdx === s.i);
    const finding = findingIdx === -1 ? null : analysis.findings[findingIdx];
    const lit = !!finding && (s.i === selectedSentence || findingIdx === openIdx);

    return {
      sentenceIdx: s.i,
      text: s.raw,
      bg: lit && finding ? finding.bg : "transparent",
      pad: finding ? "2px 1px" : "0",
      ring: lit && finding ? `0 0 0 1px ${finding.color}` : "none",
      deco: finding ? "underline" : "none",
      decoColor: finding ? finding.color : "transparent",
      cursor: finding ? "pointer" : "text",
      findingIdx: finding ? findingIdx : null,
    } satisfies ReadabilityRun;
  });
}
