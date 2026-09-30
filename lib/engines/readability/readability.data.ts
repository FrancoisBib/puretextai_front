/**
 * Data tables for the Lisibilité module, ported from the source's `readVals`
 * (script_block.txt:385-529). Every threshold and colour here is the
 * design's — see CLAUDE.md's fidelity rule. Display strings (category
 * labels, level names) live in the `readability.json` message namespace
 * instead of here, keyed by the stable identifiers below — this module has
 * no access to the site's locale.
 */

export type ReadabilityFindingKey = "longue" | "passive" | "jargon";

export interface ReadabilityCat {
  color: string;
  bg: string;
}

export const READ_FINDING_CATS: Record<ReadabilityFindingKey, ReadabilityCat> = {
  longue: { color: "#B4780F", bg: "rgba(180,120,20,.11)" },
  passive: { color: "#7A4FBF", bg: "rgba(122,79,191,.11)" },
  jargon: { color: "#C0392B", bg: "rgba(192,57,43,.1)" },
};

/** Legend order in the text-panel footer. */
export const READ_FINDING_ORDER: ReadabilityFindingKey[] = ["longue", "passive", "jargon"];

/** Abstract terms that force the reader to decode. French-only — the detection heuristic isn't localized (see CLAUDE.md). */
export const JARGON = [
  "paradigme",
  "synergie",
  "optimisation",
  "problématique",
  "méthodologie",
  "écosystème",
  "implémentation",
  "opérationnel",
  "impérativement",
  "préalablement",
  "structurel",
  "prérequis",
];

/** A sentence at or above this word count is flagged as too long. */
export const LONG_SENTENCE_WORDS = 26;

/** A word of this many syllables or more counts as complex. */
export const COMPLEX_WORD_SYLLABLES = 4;

/** Below this word count the score is not yet stable — the panel says so. */
export const STABLE_INDEX_WORDS = 120;

export type ReadabilityLevelKey = "veryEasy" | "comfortable" | "demanding" | "difficult";

/** Reading-comfort band the composite score falls into. */
export interface ReadabilityLevel {
  key: ReadabilityLevelKey;
  color: string;
  bg: string;
  border: string;
}

/** Bands are checked top-down on the 0-100 score: >= 70, >= 55, >= 40, else. */
export const READABILITY_LEVELS: Array<{ min: number; level: ReadabilityLevel }> = [
  { min: 70, level: { key: "veryEasy", color: "#1F8A54", bg: "rgba(31,138,84,.05)", border: "rgba(31,138,84,.2)" } },
  {
    min: 55,
    level: { key: "comfortable", color: "#1F8A54", bg: "rgba(31,138,84,.05)", border: "rgba(31,138,84,.18)" },
  },
  {
    min: 40,
    level: { key: "demanding", color: "#B4780F", bg: "rgba(180,120,20,.06)", border: "rgba(180,120,20,.2)" },
  },
  {
    min: -Infinity,
    level: { key: "difficult", color: "#C0392B", bg: "rgba(192,57,43,.05)", border: "rgba(192,57,43,.22)" },
  },
];
