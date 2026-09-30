/**
 * Pure port of `vFindings()` and `vRuns()`. No React/Zustand/next-intl
 * imports — display text is exposed as stable keys + interpolation params
 * (`studio.verify`'s `findingTitle.<key>`/`findingWhy.<key>`/`actLabel.<key>`
 * messages), resolved by the selector/component layer.
 *
 * The original `vFindings()` returned entries with an `act` closure that
 * called `this.setState(...)`. Since engines must stay store-free, each
 * finding instead carries an `actionKind` ("humanize" | "copyRef") plus any
 * data the action needs (`sourceIdx`); the selector wires the actual
 * navigation to the store.
 *
 * `aiAnalyse()` (a local mock AI-detection score) was removed: it had no
 * callers — real AI-likelihood detection goes through `detectText()` (a
 * live `POST /v1/detect` call, see `lib/api/detect.ts`), not this module.
 *
 * The connector/generic-phrase detection below (`CONNECTORS`/
 * `GENERIC_PHRASES`) is French-specific, like Lisibilité's jargon list —
 * translating the *labels* shown once a finding is detected is in scope;
 * building an equivalent English detection ruleset is a separate,
 * out-of-scope project (see CLAUDE.md's fidelity rule discussion).
 */

import { splitSentencesKeepTrailing, wordCount } from "@/lib/text/segment-text";
import type { SimilarityResponse } from "@/lib/api/similarity";

/** Ported verbatim from the `steps` array local to `verifyVals()`/`simStart()`. Keys into `studio.verify`'s `simSteps.<key>`. */
export const SIM_STEP_KEYS = ["splitting", "querying", "comparing", "consolidating"] as const;

/** Ported verbatim from the `LVL` table local to `verifyVals()` (AI-likelihood severity ramp, colours only — the label is dead, superseded by `verify.verdict.level.*`). */
export const AI_LEVELS = [
  { color: "#1F8A54", bg: "rgba(31,138,84,.06)", border: "rgba(31,138,84,.22)" },
  { color: "#B4780F", bg: "#FFF9ED", border: "rgba(180,120,20,.22)" },
  { color: "#D4610F", bg: "rgba(212,97,15,.06)", border: "rgba(212,97,15,.24)" },
  { color: "#C0392B", bg: "rgba(192,57,43,.05)", border: "rgba(192,57,43,.22)" },
];

/** Ported verbatim from the `CATS` table local to `verifyVals()`. Category label lives in `studio.verify`'s `categories.<key>`. */
export const FINDING_CATS: Record<VerifyFindingKey, { color: string; tint: string }> = {
  rythme: { color: "#B4780F", tint: "rgba(180,120,20,.12)" },
  connecteur: { color: "#7A4FBF", tint: "rgba(122,79,191,.12)" },
  tournure: { color: "#C0392B", tint: "rgba(192,57,43,.11)" },
  source: { color: "#049FDE", tint: "rgba(4,159,222,.11)" },
};

export type VerifyFindingKey = "rythme" | "connecteur" | "tournure" | "source";
export type VerifyActionKind = "humanize" | "copyRef";

export interface VerifyFinding {
  id: string;
  key: VerifyFindingKey;
  sIdx: number[];
  phrase: string | null;
  /** Interpolation params for `studio.verify`'s `findingTitle.<key>`. */
  titleParams: Record<string, string | number>;
  quote: string;
  /** Only set for "source" findings — index into `studio.verify`'s `sources.<idx>`. */
  sourceIdx?: number;
  actionKind: VerifyActionKind;
}

const CONNECTORS = [
  "en outre", "de plus", "par ailleurs", "de surcroît", "en conclusion", "en définitive",
  "toutefois", "cependant", "néanmoins", "en effet", "premièrement", "deuxièmement",
];
const GENERIC_PHRASES = [
  "il est important de", "il est essentiel de", "joue un rôle", "force est de constater",
  "un large éventail", "dans le monde d'aujourd'hui", "il convient de noter",
  "constitue un élément", "permet non seulement", "à l'ère du", "riche et varié",
];

/** Ported 1:1 from `vFindings()`, minus the `act` closures (see file header). */
export function vFindings(txt: string, sim: SimilarityResponse | null): VerifyFinding[] {
  const sentences = splitSentencesKeepTrailing(txt);
  const wc = (x: string) => wordCount(x);
  const real = sentences.map((t, i) => ({ i, t, n: wc(t) })).filter((x) => x.n > 4);
  const mean = real.length ? real.reduce((a, b) => a + b.n, 0) / real.length : 0;
  const tol = Math.max(1.6, mean * 0.12);
  const mono = real.filter((x) => Math.abs(x.n - mean) <= tol);
  const out: VerifyFinding[] = [];

  if (mono.length >= 4) {
    out.push({
      id: "rythme",
      key: "rythme",
      sIdx: mono.map((x) => x.i),
      phrase: null,
      titleParams: { n: mono.length },
      quote: mono[0].t.trim(),
      actionKind: "humanize",
    });
  }

  sentences.forEach((t, i) => {
    const low = t.toLowerCase();
    CONNECTORS.forEach((c) => {
      let from = 0;
      let pos: number;
      while ((pos = low.indexOf(c, from)) !== -1) {
        out.push({
          id: "c" + i + "-" + c + "-" + pos,
          key: "connecteur",
          sIdx: [i],
          phrase: t.substr(pos, c.length),
          titleParams: { term: t.substr(pos, c.length) },
          quote: t.trim(),
          actionKind: "humanize",
        });
        from = pos + c.length;
      }
    });
    GENERIC_PHRASES.forEach((g) => {
      const pos = low.indexOf(g);
      if (pos !== -1) {
        out.push({
          id: "g" + i + "-" + g,
          key: "tournure",
          sIdx: [i],
          phrase: t.substr(pos, g.length),
          titleParams: { term: t.substr(pos, g.length) },
          quote: t.trim(),
          actionKind: "humanize",
        });
      }
    });
  });

  if (sim) {
    sim.sources.forEach((src, k) => {
      const head = src.matchedExcerpt.slice(0, 40);
      const idx = sentences.findIndex((t) => t.indexOf(head) !== -1);
      out.push({
        id: "s" + k,
        key: "source",
        sIdx: idx === -1 ? [] : [idx],
        phrase: null,
        titleParams: { pct: Math.round(src.similarityPercent) },
        quote: "« " + src.matchedExcerpt + " »",
        sourceIdx: k,
        actionKind: "copyRef",
      });
    });
  }

  return out;
}

export interface VerifyRun {
  text: string;
  /** The finding id this run belongs to, or "" for plain text. */
  anchor: string;
  cursor: "pointer" | "auto";
  pad: string;
  bg: string;
  color: string;
  weight: "600" | "400";
  deco: "underline" | "none";
  decoColor: string;
  findingId: string | null;
  /** True for the single run each active finding anchors its popover to. */
  isPop: boolean;
}

const TINT: Record<"connecteur" | "tournure" | "source", string> = {
  connecteur: "122,79,191",
  tournure: "192,57,43",
  source: "4,159,222",
};

interface RunStyle {
  fill?: string;
  dotted?: boolean;
}

/** Ported 1:1 from `vRuns()`. */
export function vRuns(sentences: string[], all: VerifyFinding[], active: string | null): VerifyRun[] {
  const runs: VerifyRun[] = [];

  const seg = (text: string, f: VerifyFinding | undefined | null, style: RunStyle) => {
    if (!text) return;
    const on = !!(f && f.id === active);
    runs.push({
      text,
      anchor: f ? f.id : "",
      cursor: f ? "pointer" : "auto",
      pad: style.fill ? "1.5px 2px" : "0",
      bg: style.fill ? "rgba(" + style.fill + "," + (on ? ".27" : ".13") + ")" : "transparent",
      color: on && style.fill ? "rgb(" + style.fill + ")" : "inherit",
      weight: on ? "600" : "400",
      deco: style.dotted ? "underline" : "none",
      decoColor: style.dotted ? (on ? "#B4780F" : "rgba(180,120,20,.55)") : "transparent",
      findingId: f ? f.id : null,
      isPop: false,
    });
  };

  sentences.forEach((t, i) => {
    const phrases = all.filter((f) => f.phrase && f.sIdx.includes(i));
    const sentLevel =
      all.find((f) => !f.phrase && f.sIdx.includes(i) && f.key === "source") ||
      all.find((f) => !f.phrase && f.sIdx.includes(i));
    const baseStyle: RunStyle = sentLevel ? (sentLevel.key === "source" ? { fill: TINT.source } : { dotted: true }) : {};
    const low = t.toLowerCase();
    const hits: Array<{ start: number; end: number; m: VerifyFinding }> = [];
    phrases.forEach((m) => {
      const p = low.indexOf((m.phrase as string).toLowerCase());
      if (p !== -1 && !hits.some((h) => p < h.end && p + (m.phrase as string).length > h.start)) {
        hits.push({ start: p, end: p + (m.phrase as string).length, m });
      }
    });
    hits.sort((a, b) => a.start - b.start);
    let cur = 0;
    hits.forEach((h) => {
      seg(t.slice(cur, h.start), sentLevel, baseStyle);
      seg(t.slice(h.start, h.end), h.m, { fill: TINT[h.m.key as "connecteur" | "tournure" | "source"] });
      cur = h.end;
    });
    seg(t.slice(cur), sentLevel, baseStyle);
  });

  let popDone = false;
  return runs.map((r) => {
    const isPop = !popDone && r.findingId !== null && r.findingId === active;
    if (isPop) popDone = true;
    return { ...r, isPop };
  });
}
