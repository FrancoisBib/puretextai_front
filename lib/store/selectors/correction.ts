/**
 * Correction-tab view-model — port of the Correction slice of the source's
 * `baseVals()` (script_block.txt:979-1164).
 *
 * The shell concerns the source kept in the same object (top nav, menus,
 * toast, extension panel, History/Profile content) now live in
 * `./shell.ts`; the per-plan word budget lives in `./plan.ts`.
 *
 * Nothing is flagged until the analysis has run: `liveFixes` is only consulted
 * once `state.analyzed` is true, which is what makes the "Lancer l'analyse"
 * step meaningful.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

import { CAT, type Fix } from "@/lib/engines/grammar/fixes.data";
import {
  buildCorrectionSegments,
  countFixesByFilter,
  liveFixes,
  queueFixes,
  FIX_FILTERS,
  type CorrectionSegment,
  type FixFilter,
} from "@/lib/engines/grammar/grammar.engine";
import { wordCount } from "@/lib/text/segment-text";

export interface FilterPill {
  label: FixFilter;
  count: number;
  pick: () => void;
  /** Category dot; "transparent" for the "Tout" pill, which uses a ring instead. */
  dot: string;
  dotRing: string;
  border: string;
  bg: string;
  color: string;
}

export interface CorrectionSegmentVM extends CorrectionSegment {
  apply: () => void;
  ignore: () => void;
  mute: () => void;
}

export interface CorrectionView {
  // ---- Document -------------------------------------------------------
  text: string;
  onText: (value: string) => void;
  onCaret: (caretPos: number) => void;
  clearText: () => void;
  wordCount: number;
  charCount: number;
  copyText: () => void;
  copied: boolean;

  // ---- Analysis run ----------------------------------------------------
  cBusy: boolean;
  analyzed: boolean;
  runAnalysis: () => void;
  /** Findings count for the status pill once analysed — translated at the component layer. */
  suggestionCount: number;
  statusDot: string;

  // ---- Flagged text ----------------------------------------------------
  segments: CorrectionSegmentVM[];
  closePop: () => void;
  popSheetOpen: boolean;

  // ---- Review queue -----------------------------------------------------
  filters: FilterPill[];
  pendingCount: number;
  doneCount: number;
  totalCount: number;
  progressPct: string;
  queueCount: number;
  activePos: number;
  hasActive: boolean;
  noActive: boolean;
  activeCat: string;
  activeCatColor: string;
  activeRule: string;
  activeFrom: string;
  activeTo: string;
  activeWhy: string;
  applyActive: () => void;
  ignoreActive: () => void;
  locate: () => void;
  prev: () => void;
  next: () => void;
  applyAll: () => void;
  ignoreAll: () => void;

  // ---- Sidebar empty state ------------------------------------------------
  emptyIcon: string;
  emptyIconBg: string;
  emptyIconColor: string;
  /** Which empty-state copy to show — translated at the component layer. */
  emptyState: "error" | "idle" | "clean" | "none";
  /** Backend error message for the "error" state (dynamic, not translated). */
  analyzeError: string | null;
  emptyRunCta: boolean;
  /** Offered once the document comes back clean: "Tester la lisibilité →". */
  emptyReadCta: boolean;
  cToRead: () => void;
}

function computeCorrectionView(s: StudioState): CorrectionView {
  // Before the analysis has run there are no findings at all — this mirrors the
  // source's `live()`, which short-circuits on `!analyzed`.
  const live = s.analyzed ? liveFixes(s.text, s.handled, s.muted, s.flags) : [];
  const queue = queueFixes(live, s.filter);
  const active = live.find((f) => f.id === s.activeId) || queue[0] || null;

  // "Relevant" = not muted, and either already handled or still present in the
  // text. That is the denominator of the review progress bar.
  const relevant = s.flags.filter(
    (f) => !s.muted.includes(f.rule) && (s.handled[f.id] || s.text.indexOf(f.from) !== -1),
  );
  const total = relevant.length;
  const done = relevant.filter((f) => s.handled[f.id]).length;

  const segments = buildCorrectionSegments(s.text, live, s.activeId, s.popOpen, s.flipUp, s.flipRight).map(
    (seg): CorrectionSegmentVM => ({
      ...seg,
      apply: () => (seg.fix ? useStudioStore.getState().apply(seg.fix) : undefined),
      ignore: () => (seg.fix ? useStudioStore.getState().ignore(seg.fix) : undefined),
      mute: () => (seg.fix ? useStudioStore.getState().mute(seg.fix) : undefined),
    }),
  );

  const counts = countFixesByFilter(live);
  const filters: FilterPill[] = FIX_FILTERS.map((label) => {
    const on = s.filter === label;
    return {
      label,
      count: counts[label],
      pick: () => useStudioStore.getState().setFilter(label),
      dot: label === "Tout" ? "transparent" : CAT[label],
      dotRing:
        label === "Tout"
          ? `inset 0 0 0 1.5px ${on ? "rgba(255,255,255,.55)" : "rgba(20,18,15,.22)"}`
          : "none",
      border: on ? "#14120F" : "rgba(20,18,15,.12)",
      bg: on ? "#14120F" : "transparent",
      color: on ? "#FFFFFF" : "#55514A",
    };
  });

  const clean = s.analyzed && live.length === 0 && done > 0;

  return {
    text: s.text,
    onText: (value) => useStudioStore.getState().setText(value),
    onCaret: (caretPos) => useStudioStore.getState().onCaret(caretPos),
    clearText: () => useStudioStore.getState().clearText(),
    wordCount: wordCount(s.text),
    charCount: s.text.length,
    copyText: () => useStudioStore.getState().copyText(),
    copied: s.copied,

    cBusy: s.analyzing,
    analyzed: s.analyzed,
    runAnalysis: () => useStudioStore.getState().runAnalysis(),
    suggestionCount: live.length,
    statusDot: s.analyzing ? "#C08A1E" : !s.analyzed ? "#C4BEB4" : live.length ? "#C08A1E" : "#049FDE",

    segments,
    closePop: () => useStudioStore.getState().closePop(),
    popSheetOpen: s.tab === "correct" && s.popOpen,

    filters,
    pendingCount: live.length,
    doneCount: done,
    totalCount: total,
    progressPct: !s.analyzed ? "0%" : `${Math.round((done / Math.max(total, 1)) * 100)}%`,
    queueCount: queue.length,
    activePos: active ? queue.findIndex((f) => f.id === active.id) + 1 : 0,
    hasActive: !!active && !s.analyzing,
    noActive: !active && !s.analyzing,
    activeCat: active ? active.cat : "",
    activeCatColor: active ? CAT[active.cat] : "#049FDE",
    activeRule: active ? active.rule : "",
    activeFrom: active ? active.from : "",
    activeTo: active ? active.to : "",
    activeWhy: active ? active.why : "",
    applyActive: () => {
      if (active) useStudioStore.getState().apply(active as Fix);
    },
    ignoreActive: () => {
      if (active) useStudioStore.getState().ignore(active as Fix);
    },
    locate: () => (active ? useStudioStore.getState().locateActive() : undefined),
    prev: () => useStudioStore.getState().prevFix(),
    next: () => useStudioStore.getState().nextFix(),
    applyAll: () => useStudioStore.getState().applyAll(),
    ignoreAll: () => useStudioStore.getState().ignoreAll(),

    emptyIcon: s.analyzed ? "✓" : "•",
    emptyIconBg: s.analyzed ? "rgba(4,159,222,.11)" : "rgba(20,18,15,.06)",
    emptyIconColor: s.analyzed ? "#049FDE" : "#A8A29A",
    emptyState: !s.analyzed ? (s.analyzeError ? "error" : "idle") : clean ? "clean" : "none",
    analyzeError: s.analyzeError,
    emptyRunCta: !s.analyzed,
    emptyReadCta: s.analyzed && live.length === 0 && !!s.text.trim(),
    cToRead: () => useStudioStore.getState().goReadWith(s.text),
  };
}

export const selectCorrectionView = memoizeLast(computeCorrectionView);
