/**
 * Port of the Humanisation-tab slice of `renderVals()`.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { DEFAULT_STUDIO_CONFIG, resolveTone } from "@/lib/store/types";

import { INTENSITIES, TONES, TONE_GROUPS } from "@/lib/engines/humanize/rewrites.data";
import { changedEntries, effectiveHumanizedText, type ChangedEntry } from "@/lib/engines/humanize/humanize.engine";
import { detectLang } from "@/lib/engines/language/detect-language";
import { FLAGS, LANGS } from "@/lib/engines/language/languages.data";
import { isIntensityLocked, isToneLocked } from "@/lib/engines/plan/plan.engine";
import { resolvePlan } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

/** Maps `s.intensity`/`IntensityOption.index` (0/1/2) to the `humanize.intensity.<key>` message keys. */
export const INTENSITY_KEYS = ["light", "balanced", "maximum"] as const;

export interface ToneMenuItem {
  label: string;
  desc: string;
  weight: 600 | 500;
  bg: string;
  check: "✓" | "";
  /** Studio-only on the free plan — the caller sends these to /tarifs instead. */
  locked: boolean;
  pick: () => void;
}

export interface ToneGroupVM {
  name: string;
  items: ToneMenuItem[];
}

export interface IntensityOption {
  /** 0/1/2 — translated at the component layer via `humanize.intensity.<key>`. */
  index: 0 | 1 | 2;
  active: boolean;
  color: string;
  /** Studio-only on the free plan — the caller sends these to /tarifs instead. */
  locked: boolean;
  pick: () => void;
}

export interface HumanSentenceVM {
  text: string;
  open: boolean;
  color: string;
  bg: string;
  ring: string;
  cursor: "pointer" | "text";
  /** Reverted to the original (true) or showing the proposed rewrite (false) — panel/action/state copy is translated at the component layer from this. */
  reverted: boolean;
  panelTag: string;
  /** null when there's no original to show ("this sentence didn't exist") — translated at the component layer. */
  panelText: string | null;
  why: string;
  actionBg: string;
  actionBorder: string;
  actionColor: string;
  enter: () => void;
  leave: () => void;
  toggle: () => void;
  close: () => void;
  toggleKeep: () => void;
}

export interface DiffRow {
  n: number;
  tag: string;
  reverted: boolean;
  bar: string;
  before: string | null;
  after: string | null;
  why: string;
}

export interface HumanizeView {
  tone: string;
  toneLower: string;
  toneMenu: boolean;
  toggleToneMenu: () => void;
  toneGroups: ToneGroupVM[];
  /** 0/1/2 — translated at the component layer via `humanize.intensity.<key>`. */
  intensityIndex: 0 | 1 | 2;
  intensityOptions: IntensityOption[];
  /** Whether tone/intensity changes recompute a result already shown (translated `tuneHint`/`tuneHintShort` at the component layer). */
  hasResult: boolean;
  tuneSheetOpen: boolean;
  openTuneSheet: () => void;
  closeTuneSheet: () => void;
  runHumanize: () => void;
  busy: boolean;
  /** null when a result already exists — the CTA reads "re-run" instead of "run". */
  hasOutput: boolean;

  isSourceView: boolean;
  isResultView: boolean;
  isDiffView: boolean;
  viewSource: () => void;
  viewResult: () => void;
  viewDiff: () => void;
  humanEmpty: boolean;
  showResultView: boolean;
  showDiffView: boolean;

  sentences: HumanSentenceVM[];
  diffs: DiffRow[];
  noDiffs: boolean;

  copyHuman: () => void;
  clearHuman: () => void;

  kept: number;
  rwListLength: number;
  keptPct: string;
  /** "Et maintenant ?" → run Vérification on the humanised text. */
  humCanVerify: boolean;
  humVerify: () => void;

  transShow: boolean;
  transFrom: string;
  transTo: string;
  transFlag: string;
  transDismiss: () => void;
  transRun: (translatedText: string) => void;

  hasActiveRw: boolean;
  noActiveRw: boolean;
  rwPos: number;
  rwTotal: number;
  rwTag: string;
  /** null when there's no original to show. */
  rwBefore: string | null;
  rwAfter: string;
  rwWhy: string;
  rwReverted: boolean;
  rwActionBg: string;
  rwActionBorder: string;
  rwActionColor: string;
  rwToggle: () => void;
  rwLocate: () => void;
  rwPrev: () => void;
  rwNext: () => void;
}

function computeHumanizeView(s: StudioState): HumanizeView {
  const tone = resolveTone(s, DEFAULT_STUDIO_CONFIG);
  const plan = resolvePlan(s, DEFAULT_STUDIO_CONFIG);
  const toneLower = tone.toLowerCase();

  const hout = s.humanOut || [];
  const changed = hout.filter((x) => x.changed);
  const hoverIdx = s.hoverIdx !== null && hout[s.hoverIdx] && hout[s.hoverIdx].changed ? s.hoverIdx : null;

  const revertedCount = changed.filter((x) => s.reverted[hout.indexOf(x)]).length;
  const kept = changed.length - revertedCount;

  const rwList: ChangedEntry[] = changedEntries(hout);
  const rwIdx = Math.min(s.rwIdx, Math.max(rwList.length - 1, 0));
  const activeRw = rwList[rwIdx] || null;
  const rwReverted = activeRw ? !!s.reverted[activeRw.i] : false;

  const detected = detectLang(s.text);

  return {
    tone,
    toneLower,
    toneMenu: s.toneMenu,
    toggleToneMenu: () => useStudioStore.getState().toggleToneMenu(),
    toneGroups: TONE_GROUPS.map((g) => ({
      name: g,
      items: TONES.filter((x) => x.group === g).map((x) => {
        const locked = isToneLocked(x.group, plan);
        return {
          label: x.label,
          desc: x.desc,
          weight: (x.label === tone ? 600 : 500) as 600 | 500,
          bg: x.label === tone ? "rgba(4,159,222,.08)" : "transparent",
          check: (x.label === tone ? "✓" : "") as "✓" | "",
          locked,
          pick: () => {
            if (locked) return;
            useStudioStore.getState().setTone(x.label);
          },
        };
      }),
    })),
    intensityIndex: s.intensity as 0 | 1 | 2,
    intensityOptions: INTENSITIES.map((_it, i) => {
      const locked = isIntensityLocked(i, plan);
      return {
        index: i as 0 | 1 | 2,
        active: i === s.intensity,
        color: i === s.intensity ? "#14120F" : "#8A857C",
        locked,
        pick: () => {
          if (locked) return;
          useStudioStore.getState().setIntensity(i);
        },
      };
    }),
    hasResult: !!s.humanOut,
    tuneSheetOpen: s.tuneSheet,
    openTuneSheet: () => useStudioStore.getState().openTuneSheet(),
    closeTuneSheet: () => useStudioStore.getState().closeTuneSheet(),
    runHumanize: () => useStudioStore.getState().runHumanize(),
    busy: s.busy,
    hasOutput: !!s.humanOut,

    isSourceView: s.view === "source",
    isResultView: s.view === "result",
    isDiffView: s.view === "diff",
    viewSource: () => useStudioStore.getState().setView("source"),
    viewResult: () => useStudioStore.getState().setView("result"),
    viewDiff: () => useStudioStore.getState().setView("diff"),
    humanEmpty: !s.humanOut && !s.busy && s.view !== "source",
    showResultView: !!s.humanOut && !s.busy && s.view === "result",
    showDiffView: !!s.humanOut && !s.busy && s.view === "diff",

    sentences: hout.map((x, i) => {
      const rev = !!s.reverted[i];
      const open = x.changed && s.openIdx === i;
      return {
        text: (rev ? x.before || "" : x.text) + " ",
        open,
        color: rev ? "#8A857C" : "#14120F",
        bg: !x.changed
          ? "transparent"
          : rev
            ? "rgba(20,18,15,.05)"
            : open
              ? "rgba(4,159,222,.22)"
              : i === hoverIdx
                ? "rgba(4,159,222,.18)"
                : "rgba(4,159,222,.09)",
        ring: x.changed && (i === hoverIdx || open) ? "0 0 0 1px rgba(4,159,222,.4)" : "none",
        cursor: x.changed ? "pointer" : "text",
        reverted: rev,
        panelTag: x.tag || "",
        panelText: rev ? x.text : x.before || null,
        why: x.why || "",
        actionBg: rev ? "#049FDE" : "transparent",
        actionBorder: rev ? "#049FDE" : "rgba(20,18,15,.14)",
        actionColor: rev ? "#FFFFFF" : "#14120F",
        enter: () => x.changed && useStudioStore.getState().hoverSentence(i),
        leave: () => x.changed && useStudioStore.getState().hoverSentence(null),
        toggle: () => x.changed && useStudioStore.getState().toggleSentence(i),
        close: () => useStudioStore.getState().closeSentence(),
        toggleKeep: () => useStudioStore.getState().toggleRevertSentence(i),
      };
    }),

    diffs: rwList.map((r, n) => ({
      n: n + 1,
      tag: r.x.tag || "",
      reverted: !!s.reverted[r.i],
      bar: s.reverted[r.i] ? "rgba(20,18,15,.16)" : "#049FDE",
      before: r.x.before || null,
      after: s.reverted[r.i] ? null : r.x.text,
      why: r.x.why || "",
    })),
    noDiffs: rwList.length === 0,

    copyHuman: () => useStudioStore.getState().copyHuman(),
    clearHuman: () => useStudioStore.getState().clearHuman(),

    kept,
    rwListLength: rwList.length,
    keptPct: Math.round((kept / Math.max(rwList.length, 1)) * 100) + "%",
    // `humanOut` is `[]` while the stream is still running: only offer the
    // hand-off once the result is complete.
    humCanVerify: !!s.humanOut?.length && !s.busy,
    humVerify: () => useStudioStore.getState().humVerify(),

    transShow: (() => {
      if (s.transHidden || s.transDone) return false;
      return detected.sure && detected.code !== s.lang;
    })(),
    transFrom: (LANGS.find((l) => l.code === detected.code) || LANGS[1]).name,
    transTo: (LANGS.find((l) => l.code === s.lang) || LANGS[0]).name,
    transFlag: FLAGS[detected.code] || FLAGS.EN,
    transDismiss: () => useStudioStore.getState().transDismiss(),
    transRun: (translatedText) => useStudioStore.getState().transRun(translatedText),

    hasActiveRw: !!activeRw,
    noActiveRw: !activeRw,
    rwPos: activeRw ? rwIdx + 1 : 0,
    rwTotal: rwList.length,
    rwTag: activeRw ? activeRw.x.tag || "" : "",
    rwBefore: activeRw ? activeRw.x.before || null : null,
    rwAfter: activeRw ? activeRw.x.text : "",
    rwWhy: activeRw ? activeRw.x.why || "" : "",
    rwReverted,
    rwActionBg: rwReverted ? "#049FDE" : "transparent",
    rwActionBorder: rwReverted ? "#049FDE" : "rgba(20,18,15,.14)",
    rwActionColor: rwReverted ? "#FFFFFF" : "#14120F",
    rwToggle: () => useStudioStore.getState().rwToggle(),
    rwLocate: () => useStudioStore.getState().rwLocate(),
    rwPrev: () => useStudioStore.getState().rwPrev(),
    rwNext: () => useStudioStore.getState().rwNext(),
  };
}

export const selectHumanizeView = memoizeLast(computeHumanizeView);

// Re-exported for callers that only need the plain effective text (e.g. a
// preview outside this view model).
export { effectiveHumanizedText };
