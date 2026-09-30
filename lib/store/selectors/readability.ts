/**
 * Lisibilité view-model — port of the source's `readVals` presentation layer
 * (script_block.txt:468-529). The measurements come from
 * `lib/engines/readability/readability.engine.ts`.
 *
 * Unlike the earlier version of this tab, a flagged sentence now opens an
 * inline popover anchored to the click, in addition to selecting the finding in
 * the sidebar queue — that is what the updated design encodes.
 *
 * A selector is a plain function of `StudioState`, with no access to the
 * site's locale — so, like the engine underneath it, this exposes stable
 * keys + interpolation params (never formatted text) for anything
 * translatable; `components/studio/readability/*` resolves them via
 * `useTranslations("studio.readability")`.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

import {
  analyseReadability,
  buildReadabilityRuns,
  type ReadabilityFindingKey,
  type ReadabilityLegendItem,
  type ReadabilitySignal,
} from "@/lib/engines/readability/readability.engine";
import type { ReadabilityLevelKey } from "@/lib/engines/readability/readability.data";
import { anchorXY, READ_POPOVER_HEIGHT } from "@/lib/hooks/use-anchor-xy";

export type { ReadabilityLegendItem, ReadabilitySignal };

export interface ReadabilityRunVM {
  text: string;
  bg: string;
  pad: string;
  ring: string;
  deco: "underline" | "none";
  decoColor: string;
  cursor: "pointer" | "text";
  click: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface ActiveReadabilityFinding {
  key: ReadabilityFindingKey;
  color: string;
  quote: string;
  whyParams: Record<string, string | number>;
  locate: () => void;
}

export interface ReadabilityView {
  // ---- Editor / marked-text panel ---------------------------------------
  rText: string;
  setRText: (value: string) => void;
  rClear: () => void;
  rWords: number;
  rSentences: number;
  rEditing: boolean;
  rMarked: boolean;
  rEdit: () => void;
  rBusy: boolean;
  rRun: () => void;
  rDemo: (text: string) => void;
  rDone: boolean;
  rEmpty: boolean;
  rRuns: ReadabilityRunVM[];
  rLegend: ReadabilityLegendItem[];

  // ---- Score banner -------------------------------------------------------
  rScore: number;
  rColor: string;
  rBg: string;
  rBorder: string;
  rLevelKey: ReadabilityLevelKey;
  rFindingsCount: number;
  rAsl: number;
  rGoCorrect: () => void;

  // ---- Signals and findings queue -----------------------------------------
  rSignals: ReadabilitySignal[];
  rQueueMulti: boolean;
  rQueueEmpty: boolean;
  rQueuePos: number;
  rQueueCount: number;
  rPrev: () => void;
  rNext: () => void;
  rActive: ActiveReadabilityFinding | null;

  // ---- Inline popover -------------------------------------------------------
  rPopOpen: boolean;
  rPopLeft: number;
  rPopTop: number;
  rPopKey: ReadabilityFindingKey | null;
  rPopColor: string;
  rPopTint: string;
  rPopPos: string;
  rPopWhyParams: Record<string, string | number>;
  rPopAct: (event: React.MouseEvent<HTMLElement>) => void;
  rPopPrev: (event: React.MouseEvent<HTMLElement>) => void;
  rPopNext: (event: React.MouseEvent<HTMLElement>) => void;
}

function computeReadabilityView(s: StudioState): ReadabilityView {
  const text = s.rText ?? "";
  const a = analyseReadability(text);
  const ran = s.rRan && !!text.trim();
  const editing = !s.rBusy && (!ran || s.rEditing);

  const findings = a.findings;
  const queueIdx = findings.length ? Math.min(s.rIdx, findings.length - 1) : 0;
  const active = findings[queueIdx] ?? null;
  const popIdx = s.rPop !== null && findings[s.rPop] ? s.rPop : null;
  const popFinding = popIdx !== null ? findings[popIdx] : null;

  const runs: ReadabilityRunVM[] = buildReadabilityRuns(a, findings.length ? queueIdx : null, popIdx).map(
    (r) => ({
      text: r.text,
      bg: r.bg,
      pad: r.pad,
      ring: r.ring,
      deco: r.deco,
      decoColor: r.decoColor,
      cursor: r.cursor,
      click:
        r.findingIdx === null
          ? () => {}
          : (event: React.MouseEvent<HTMLElement>) => {
              event.stopPropagation();
              useStudioStore
                .getState()
                .rPopToggle(r.findingIdx as number, anchorXY(event, READ_POPOVER_HEIGHT));
            },
    }),
  );

  return {
    rText: text,
    setRText: (value) => useStudioStore.getState().setRText(value),
    rClear: () => useStudioStore.getState().rClear(),
    rWords: a.words,
    rSentences: a.sentenceCount,
    rEditing: editing,
    rMarked: ran && !editing,
    rEdit: () => useStudioStore.getState().rEdit(),
    rBusy: s.rBusy,
    rRun: () => useStudioStore.getState().rRun(),
    rDemo: (text) => useStudioStore.getState().rDemo(text),
    rDone: ran,
    rEmpty: !ran,
    rRuns: ran ? runs : [],
    rLegend: a.legend,

    rScore: a.score,
    rColor: a.level.color,
    rBg: a.level.bg,
    rBorder: a.level.border,
    rLevelKey: a.level.key,
    rFindingsCount: findings.length,
    rAsl: a.asl,
    rGoCorrect: () => useStudioStore.getState().rGoCorrect(),

    rSignals: a.signals,
    rQueueMulti: findings.length > 1,
    rQueueEmpty: ran && findings.length === 0,
    rQueuePos: findings.length ? queueIdx + 1 : 0,
    rQueueCount: findings.length,
    rPrev: () => useStudioStore.getState().rPrev(),
    rNext: () => useStudioStore.getState().rNext(),
    rActive: active
      ? {
          key: active.key,
          color: active.color,
          quote: active.quote,
          whyParams: active.whyParams,
          locate: () => useStudioStore.getState().rSelect(queueIdx),
        }
      : null,

    rPopOpen: s.tab === "read" && !!popFinding && !!s.rPopXY,
    rPopLeft: s.rPopXY?.x ?? 0,
    rPopTop: s.rPopXY?.y ?? 0,
    rPopKey: popFinding ? popFinding.key : null,
    rPopColor: popFinding ? popFinding.color : "",
    rPopTint: popFinding ? popFinding.bg : "",
    rPopPos: popFinding && popIdx !== null ? `${popIdx + 1} / ${findings.length}` : "",
    rPopWhyParams: popFinding ? popFinding.whyParams : {},
    rPopAct: (event) => {
      event.stopPropagation();
      useStudioStore.getState().rGoCorrect();
    },
    rPopPrev: (event) => {
      event.stopPropagation();
      useStudioStore.getState().rPopJump(-1);
    },
    rPopNext: (event) => {
      event.stopPropagation();
      useStudioStore.getState().rPopJump(1);
    },
  };
}

export const selectReadabilityView = memoizeLast(computeReadabilityView);
