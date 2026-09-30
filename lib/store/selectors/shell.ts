/**
 * Shell view-model: everything that sits around the active module — top nav,
 * the mobile module sheet and column switch, language menu, account menu,
 * toast/undo, the extension panel, and the History/Profile demo content.
 *
 * The source assembled all of this inside `renderVals()` alongside the
 * Correction fields; here it is its own selector because the mobile chrome
 * needs the finding counts of *every* module, not just the active one.
 *
 * Handlers are resolved by calling `useStudioStore.getState()` imperatively, so
 * this stays a plain function of `StudioState` — no hooks.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { MobileTab, StudioState, StudioTab } from "@/lib/store/types";
import { DEFAULT_STUDIO_CONFIG, resolveExtOpen, resolvePlan, resolveSignedIn } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

import { liveFixes } from "@/lib/engines/grammar/grammar.engine";
import { changedEntries } from "@/lib/engines/humanize/humanize.engine";
import { vFindings } from "@/lib/engines/verify/verify.engine";
import { analyseReadability } from "@/lib/engines/readability/readability.engine";
import { FLAGS, LANGS, SITE_LOCALES, type LangCode } from "@/lib/engines/language/languages.data";
import { wordCount } from "@/lib/text/segment-text";

export interface LangMenuItem {
  flag: string;
  name: string;
  code: LangCode;
  weight: 600 | 500;
  check: "✓" | "";
  pick: () => void;
  /** Site interface locale to switch to when picked ("fr"/"en"/"es"/"de"/"it"/"pt"/"nl"), or null when
   * this correction language has no matching UI translation yet — picking it
   * only changes the text-processing language, the site UI stays as-is. */
  siteLocale: "fr" | "en" | "es" | "de" | "it" | "pt" | "nl" | null;
}

export interface ModuleItem {
  key: StudioTab;
  /** "" when the module has nothing to report. */
  count: string;
  bg: string;
  ink: string;
  pick: () => void;
}

export interface ShellView {
  // ---- Tab flags and navigation ---------------------------------------
  tab: StudioTab;
  isCorrect: boolean;
  isHuman: boolean;
  isVerify: boolean;
  isRead: boolean;
  isCount: boolean;
  isHistory: boolean;
  isProfile: boolean;
  goCorrect: () => void;
  goHuman: () => void;
  goVerify: () => void;
  goRead: () => void;
  goCount: () => void;
  goHistory: () => void;
  goProfile: () => void;

  // ---- Mobile chrome ----------------------------------------------------
  /** Active module's key, translated at the component layer (`nav.<key>`). */
  moduleTabKey: StudioTab;
  modules: ModuleItem[];
  modSheetOpen: boolean;
  openModSheet: () => void;
  closeModSheet: () => void;
  mTab: MobileTab;
  mTabIsText: boolean;
  mTabIsRes: boolean;
  setMTabText: () => void;
  setMTabRes: () => void;
  /** Findings count of the active module, badged on the "Résultats" tab. */
  mResBadge: string;
  mResHasBadge: boolean;

  // ---- Account ----------------------------------------------------------
  signedIn: boolean;
  signedOut: boolean;
  userEmail: string;
  userInitial: string;
  planFree: boolean;
  planPaid: boolean;
  avatarOpen: boolean;
  avatarRing: string;
  toggleAvatar: () => void;
  closeAvatar: () => void;
  histBg: string;
  profBg: string;
  histCount: number;
  noop: () => void;
  logout: () => void;

  // ---- Language menu ----------------------------------------------------
  langOpen: boolean;
  langFlag: string;
  langName: string;
  langCode: LangCode;
  toggleLang: () => void;
  langs: LangMenuItem[];

  // ---- Toast / undo -----------------------------------------------------
  toastOpen: boolean;
  toastKey: string;
  toastParams: Record<string, string | number> | undefined;
  undo: () => void;

  // ---- Extension panel --------------------------------------------------
  extOpen: boolean;
  toggleExt: () => void;
  extCorrect: (out: string, label: string, meta: string) => void;
  extHumanize: (out: string, label: string, meta: string) => void;
  extTone: (out: string, label: string, meta: string) => void;
  extHasOut: boolean;
  extOut: string;
  extLabel: string;
  extMeta: string;
  extCopy: () => void;
  extCopied: boolean;
  extReplace: () => void;
}

/**
 * The 5 pickable modules in the mobile sheet, in display order. Labels/notes
 * are no longer baked in here — `ModuleSheet`/`ModuleSelector` translate them
 * from `key` via the `nav` message namespace (`nav.<key>` / `nav.notes.<key>`).
 */
const MODULE_KEYS: StudioTab[] = ["correct", "human", "verify", "read", "count"];

/** Live findings per module — the module sheet lists all five at once. */
function moduleCounts(s: StudioState): Record<StudioTab, number> {
  const correct = s.analyzed ? liveFixes(s.text, s.handled, s.muted, s.flags).length : 0;
  const human = changedEntries(s.humanOut || []).length;

  const vTxt = s.vText || "";
  const vRan = s.vRan && wordCount(vTxt) > 0;
  const sim = vRan && s.simPhase === "done" ? s.simResult : null;
  const verify = vRan ? vFindings(vTxt, sim).filter((f) => !s.fdDismissed.includes(f.id)).length : 0;

  const read = s.rRan && s.rText.trim() ? analyseReadability(s.rText).findings.length : 0;

  return { correct, human, verify, read, count: 0, history: 0, profile: 0 };
}

function computeShellView(s: StudioState): ShellView {
  const extOpenResolved = resolveExtOpen(s, DEFAULT_STUDIO_CONFIG);
  const signedIn = resolveSignedIn(s, DEFAULT_STUDIO_CONFIG);
  const free = resolvePlan(s, DEFAULT_STUDIO_CONFIG) !== "studio";
  const counts = moduleCounts(s);
  const activeCount = counts[s.tab] ?? 0;

  return {
    tab: s.tab,
    isCorrect: s.tab === "correct",
    isHuman: s.tab === "human",
    isVerify: s.tab === "verify",
    isRead: s.tab === "read",
    isCount: s.tab === "count",
    isHistory: s.tab === "history",
    isProfile: s.tab === "profile",
    goCorrect: () => useStudioStore.getState().goCorrect(),
    goHuman: () => useStudioStore.getState().goHuman(),
    goVerify: () => useStudioStore.getState().goVerify(),
    goRead: () => useStudioStore.getState().goRead(),
    goCount: () => useStudioStore.getState().goCount(),
    goHistory: () => useStudioStore.getState().goHistory(),
    goProfile: () => useStudioStore.getState().goProfile(),

    moduleTabKey: s.tab,
    modules: MODULE_KEYS.map((key) => ({
      key,
      count: counts[key] ? String(counts[key]) : "",
      bg: key === s.tab ? "rgba(4,159,222,.1)" : "transparent",
      ink: key === s.tab ? "#049FDE" : "#14120F",
      pick: () => useStudioStore.getState().pickModule(key),
    })),
    modSheetOpen: s.modSheet,
    openModSheet: () => useStudioStore.getState().openModSheet(),
    closeModSheet: () => useStudioStore.getState().closeModSheet(),
    mTab: s.mTab,
    mTabIsText: s.mTab !== "res",
    mTabIsRes: s.mTab === "res",
    setMTabText: () => useStudioStore.getState().setMTab("text"),
    setMTabRes: () => useStudioStore.getState().setMTab("res"),
    mResBadge: activeCount ? String(activeCount) : "",
    mResHasBadge: !!activeCount,

    signedIn,
    signedOut: !signedIn,
    userEmail: s.userEmail,
    userInitial: s.userEmail.charAt(0).toUpperCase(),
    planFree: free,
    planPaid: !free,
    avatarOpen: !!s.avatarOpen,
    avatarRing: s.avatarOpen ? "3px" : "0px",
    toggleAvatar: () => useStudioStore.getState().toggleAvatar(),
    closeAvatar: () => useStudioStore.getState().closeAvatar(),
    histBg: s.tab === "history" ? "rgba(4,159,222,.08)" : "none",
    profBg: s.tab === "profile" ? "rgba(4,159,222,.08)" : "none",
    histCount: 4,
    noop: () => {},
    logout: () => {
      void useStudioStore.getState().logout();
    },

    langOpen: s.langOpen,
    langFlag: FLAGS[s.lang] || FLAGS.FR,
    langName: (LANGS.find((l) => l.code === s.lang) || LANGS[0]).name,
    langCode: s.lang,
    toggleLang: () => useStudioStore.getState().toggleLang(),
    langs: LANGS.map((l) => ({
      flag: FLAGS[l.code],
      name: l.name,
      code: l.code,
      weight: l.code === s.lang ? 600 : 500,
      check: l.code === s.lang ? "✓" : "",
      pick: () => useStudioStore.getState().pickLang(l.code),
      siteLocale: SITE_LOCALES[l.code] ?? null,
    })),

    toastOpen: !!s.toastKey,
    toastKey: s.toastKey,
    toastParams: s.toastParams,
    undo: () => useStudioStore.getState().undo(),

    extOpen: extOpenResolved,
    toggleExt: () => useStudioStore.getState().toggleExt(),
    extCorrect: (out, label, meta) => useStudioStore.getState().extCorrect(out, label, meta),
    extHumanize: (out, label, meta) => useStudioStore.getState().extHumanize(out, label, meta),
    extTone: (out, label, meta) => useStudioStore.getState().extTone(out, label, meta),
    extHasOut: !!s.extOut,
    extOut: s.extOut,
    extLabel: s.extLabel,
    extMeta: s.extMeta,
    extCopy: () => useStudioStore.getState().extCopy(),
    extCopied: s.extCopied,
    extReplace: () => useStudioStore.getState().extReplace(),
  };
}

export const selectShellView = memoizeLast(computeShellView);
