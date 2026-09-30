/**
 * Port of `verifyVals()` (the Vérification tab).
 *
 * The finding popover is a single `position: fixed` card anchored to the run
 * that was clicked (`anchorXY`), not one popover per run — so its fields live
 * at the top level of the view-model, not on `VerifyRunVM`.
 *
 * A selector is a plain function of `StudioState`, with no access to the
 * site's locale — like the engines underneath it, this exposes stable keys
 * (never formatted text) for anything translatable;
 * `components/studio/verify/*` resolves them via
 * `useTranslations("studio.verify")`.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { DEFAULT_STUDIO_CONFIG, resolveSignedIn } from "@/lib/store/types";
import { anchorXY, VERIFY_POPOVER_HEIGHT } from "@/lib/hooks/use-anchor-xy";

import { splitSentencesKeepTrailing, wordCount } from "@/lib/text/segment-text";
import {
  AI_LEVELS,
  FINDING_CATS,
  vFindings,
  vRuns as buildVerifyRuns,
  type VerifyFinding,
  type VerifyFindingKey,
  type VerifyRun,
} from "@/lib/engines/verify/verify.engine";
import type { SimilaritySourceResponse } from "@/lib/api/similarity";
import { memoizeLast } from "./memoize-last";

export type SimilarityVerdictKey = "high" | "some" | "onePassage" | "none";

/** Per-source colour ramp — matches the finding highlight colours used elsewhere in Vérification. */
function sourceColor(pct: number): string {
  return pct >= 9 ? "#C0392B" : pct >= 5 ? "#B4780F" : "#8A857C";
}

function overallColor(score: number): string {
  return score >= 20 ? "#C0392B" : score >= 8 ? "#B4780F" : "#1F8A54";
}

function overallVerdictKey(score: number, hasSources: boolean): SimilarityVerdictKey {
  return score >= 20 ? "high" : score >= 8 ? "some" : hasSources ? "onePassage" : "none";
}

/** Maps `vdLevelIndex` (0-3) to the `verify.verdict.level.*`/`title.*` message keys. */
export const VERDICT_LEVEL_KEYS = ["low", "moderate", "high", "veryHigh"] as const;

export interface VerifyRunVM extends VerifyRun {
  click: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface LegendItem {
  key: VerifyFindingKey;
  swatch: string;
  line: string;
  count: number;
}

export interface ScaleTick {
  h: string;
  bg: string;
}

export interface ActiveSimSource {
  sourceIdx: number;
  title: string;
  host: string;
  pct: string;
  color: string;
  matchedExcerpt: string;
  border: string;
  cardBg: string;
  locate: () => void;
  copyRef: (title: string) => void;
}

export interface VerifyView {
  vDemo: (text: string) => void;
  vRuns: VerifyRunVM[];
  vFindCount: number;
  vLegend: LegendItem[];

  // ---- Anchored finding popover ------------------------------------------
  vPopOpen: boolean;
  vPopLeft: number;
  vPopTop: number;
  /** Also doubles as the key for `findingTitle.<key>`/`findingWhy.<key>`/`actLabel.<key>`. */
  vPopKey: VerifyFindingKey | null;
  vPopColor: string;
  vPopTint: string;
  vPopPos: string;
  vPopTitleParams: Record<string, string | number>;
  vPopHasSource: boolean;
  /** Only set when `vPopKey === "source"` — resolve via `sources.<idx>.title`. */
  vPopSourceIdx: number | null;
  vPopAct: (event: React.MouseEvent<HTMLElement>, refTitle?: string) => void;
  vPopDismiss: (event: React.MouseEvent<HTMLElement>) => void;
  vPopPrev: (event: React.MouseEvent<HTMLElement>) => void;
  vPopNext: (event: React.MouseEvent<HTMLElement>) => void;

  vText: string;
  setVText: (value: string) => void;
  vWords: number;
  vSentences: number;
  vHintWordsToGo: number;
  vHintColor: string;
  vClear: () => void;
  vRun: () => void;
  vSignedIn: boolean;
  vDone: boolean;
  /** "Texte humanisé il y a un instant" reminder, only while that analysis is still on screen. */
  vFromHuman: boolean;
  goHuman: () => void;
  vEmpty: boolean;
  vShowEditor: boolean;
  vShowMarked: boolean;
  vEdit: () => void;

  /** 0-3, index into `verify.verdict.level.*` — null score means still analysing. */
  vdLevelIndex: 0 | 1 | 2 | 3;
  vdColor: string;
  vdBg: string;
  vdBorder: string;
  vdScale: ScaleTick[];
  vdScore: number | null;
  vdFindCount: number;
  vdRhythmCount: number;
  vdPhrasingCount: number;
  vdAction: () => void;

  simLoading: boolean;
  simDone: boolean;
  simIdle: boolean;
  /** A `common.errors.<code>` key, or null. */
  simError: string | null;
  /** Key into `simStatus.<key>`. */
  simStatusKey: "loading" | "done" | "idle";
  simRun: () => void;
  simScore: number;
  simColor: string;
  /** Key into `simVerdict.<key>`/`simVerdictSub.<key>`. */
  simVerdictKey: SimilarityVerdictKey | null;
  simEmpty: boolean;
  simHasMulti: boolean;
  simSrcPos: number;
  simSrcCount: number;
  simSrcPrev: () => void;
  simSrcNext: () => void;
  simActive: ActiveSimSource | null;
  /** Full source list of the current result — `FindingPopover` resolves a clicked finding's source by index into this. */
  simSources: SimilaritySourceResponse[];
}

function computeVerifyView(s: StudioState): VerifyView {
  const txt = s.vText || "";
  const words = wordCount(txt);
  const score = s.detectResult ? s.detectResult.score : null;
  const sentences = splitSentencesKeepTrailing(txt);
  const sents = sentences.filter((x) => x.trim().split(/\s+/).length > 2).length;
  const ran = !!s.vRan && words > 0;
  const phase = s.simPhase || "idle";
  const sim = ran && phase === "done" ? s.simResult : null;

  const dismissed = s.fdDismissed || [];
  const all: VerifyFinding[] = ran
    ? vFindings(txt, sim)
        .filter((f) => !dismissed.includes(f.id))
        .sort((x, y) => (x.sIdx[0] === undefined ? 99 : x.sIdx[0]) - (y.sIdx[0] === undefined ? 99 : y.sIdx[0]))
    : [];
  const active = s.vPop && all.some((f) => f.id === s.vPop) ? s.vPop : null;
  const aIdx = all.findIndex((f) => f.id === active);
  const cur = aIdx === -1 ? null : all[aIdx];

  const lvlIdx = score === null ? 0 : score < 25 ? 0 : score < 45 ? 1 : score < 70 ? 2 : 3;
  const LVL = AI_LEVELS[lvlIdx];
  const nRythme = all.filter((f) => f.key === "rythme").length;
  const nPhrase = all.filter((f) => f.key === "connecteur" || f.key === "tournure").length;
  const srcIdx = sim && sim.sources.length ? Math.min(s.simSrcIdx || 0, sim.sources.length - 1) : 0;

  const runs = ran ? buildVerifyRuns(sentences, all, active) : [];

  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  const vRunsVM: VerifyRunVM[] = runs.map((r) => ({
    ...r,
    click: (event) => {
      event.stopPropagation();
      if (r.findingId) {
        useStudioStore.getState().vPopToggle(r.findingId, anchorXY(event, VERIFY_POPOVER_HEIGHT));
      }
    },
  }));

  const simActiveSource: SimilaritySourceResponse | null = sim && sim.sources[srcIdx] ? sim.sources[srcIdx] : null;

  return {
    vDemo: (text) => useStudioStore.getState().vDemo(text),
    vRuns: vRunsVM,
    vFindCount: all.length,
    vLegend: (["rythme", "connecteur", "tournure", "source"] as VerifyFindingKey[]).map((key) => ({
      key,
      swatch:
        key === "rythme"
          ? "transparent"
          : key === "connecteur"
            ? "rgba(122,79,191,.16)"
            : key === "tournure"
              ? "rgba(192,57,43,.14)"
              : "rgba(4,159,222,.14)",
      line: key === "rythme" ? "rgba(180,120,20,.6)" : "transparent",
      count: all.filter((f) => f.key === key).length,
    })),

    vPopOpen: s.tab === "verify" && !!cur && !!s.popXY,
    vPopLeft: s.popXY?.x ?? 0,
    vPopTop: s.popXY?.y ?? 0,
    vPopKey: cur ? cur.key : null,
    vPopColor: cur ? FINDING_CATS[cur.key].color : "",
    vPopTint: cur ? FINDING_CATS[cur.key].tint : "",
    vPopPos: cur ? `${aIdx + 1} / ${all.length}` : "",
    vPopTitleParams: cur ? cur.titleParams : {},
    vPopHasSource: !!(cur && cur.key === "source"),
    vPopSourceIdx: cur && cur.sourceIdx !== undefined ? cur.sourceIdx : null,
    vPopAct: (event, refTitle) => {
      stop(event);
      if (cur) useStudioStore.getState().applyFindingAction(cur, refTitle);
    },
    vPopDismiss: (event) => {
      stop(event);
      useStudioStore.getState().vPopDismiss();
    },
    vPopPrev: (event) => {
      stop(event);
      useStudioStore.getState().vPopJump(-1);
    },
    vPopNext: (event) => {
      stop(event);
      useStudioStore.getState().vPopJump(1);
    },

    vText: txt,
    setVText: (value) => useStudioStore.getState().setVText(value),
    vWords: words,
    vSentences: sents,
    vHintWordsToGo: words === 0 ? 0 : Math.max(0, 120 - words),
    vHintColor: words < 120 ? "#B4780F" : "#1F8A54",
    vClear: () => useStudioStore.getState().vClear(),
    vRun: () => useStudioStore.getState().vRun(),
    vSignedIn: resolveSignedIn(s, DEFAULT_STUDIO_CONFIG),
    vDone: ran,
    vFromHuman: !!s.vFromHuman && ran,
    goHuman: () => useStudioStore.getState().goHuman(),
    vEmpty: !ran,
    vShowEditor: !ran || !!s.vEditing,
    vShowMarked: ran && !s.vEditing,
    vEdit: () => useStudioStore.getState().vEdit(),

    vdLevelIndex: lvlIdx as 0 | 1 | 2 | 3,
    vdColor: LVL.color,
    vdBg: LVL.bg,
    vdBorder: LVL.border,
    vdScale: [0, 1, 2, 3].map((i) => ({ h: 12 + i * 5 + "px", bg: i <= lvlIdx ? LVL.color : "rgba(20,18,15,.13)" })),
    vdScore: score,
    vdFindCount: all.length,
    vdRhythmCount: nRythme,
    vdPhrasingCount: nPhrase,
    vdAction: () => useStudioStore.getState().vdGoto(lvlIdx === 0 ? "correct" : "human"),

    simLoading: phase === "loading",
    simDone: phase === "done",
    simIdle: phase === "idle" && ran,
    simError: s.simError,
    simStatusKey: phase === "loading" ? "loading" : phase === "done" ? "done" : "idle",
    simRun: () => useStudioStore.getState().simStart(),
    simScore: sim ? sim.score : 0,
    simColor: sim ? overallColor(sim.score) : "#8A857C",
    simVerdictKey: sim ? overallVerdictKey(sim.score, sim.sources.length > 0) : null,
    simEmpty: !!sim && sim.sources.length === 0,
    simHasMulti: !!sim && sim.sources.length > 1,
    simSrcPos: sim && sim.sources.length ? srcIdx + 1 : 0,
    simSrcCount: sim ? sim.sources.length : 0,
    simSrcPrev: () => useStudioStore.getState().simSrcPrev(),
    simSrcNext: () => useStudioStore.getState().simSrcNext(),
    simActive: simActiveSource
      ? {
          sourceIdx: srcIdx,
          title: simActiveSource.title,
          host: simActiveSource.host,
          pct: Math.round(simActiveSource.similarityPercent) + " %",
          color: sourceColor(simActiveSource.similarityPercent),
          matchedExcerpt: simActiveSource.matchedExcerpt,
          border: simActiveSource.similarityPercent >= 9 ? "rgba(192,57,43,.25)" : "rgba(20,18,15,.09)",
          cardBg: simActiveSource.similarityPercent >= 9 ? "rgba(192,57,43,.03)" : "#FFFFFF",
          locate: () => useStudioStore.getState().locateSource(srcIdx),
          copyRef: (title) => useStudioStore.getState().copySourceRef(title),
        }
      : null,
    simSources: sim ? sim.sources : [],
  };
}

export const selectVerifyView = memoizeLast(computeVerifyView);
