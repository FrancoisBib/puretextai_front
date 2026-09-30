"use client";

/**
 * The single Zustand store for the Studio. This is the ONLY file in
 * `lib/` allowed to import `zustand` — everything under `lib/engines`,
 * `lib/text` and `lib/utils` stays framework/store-free.
 *
 * Actions are direct ports of the original DCLogic component's methods.
 * Where the source relied on DOM measurement (`setHost`/`place()` for
 * popover placement) or on component instance fields (`this._sim`,
 * `this._host`, `this._toast`, …) for timers, those instance fields are
 * modeled as module-scoped variables (this store is a singleton, so that
 * is equivalent) and DOM measurement is left to the UI layer, which is
 * expected to call `setFlip`/pass a `flip` argument after measuring the
 * popover host — see `onCaret`, `locateActive`, `prevFix`, `nextFix`.
 */

import { create } from "zustand";

import {
  DEFAULT_STUDIO_CONFIG,
  resolveExtOpen,
  resolveSignedIn,
  resolveTone,
  type AuthOutcome,
  type MobileTab,
  type PlanId,
  type StudioState,
  type StudioTab,
} from "./types";

import { SEED, type Fix } from "@/lib/engines/grammar/fixes.data";
import {
  advanceFix,
  applyAllFixes,
  findFixAtCaret,
  liveFixes,
  queueFixes,
  snapshotOf,
  type FixFilter,
} from "@/lib/engines/grammar/grammar.engine";

import { changedEntries, effectiveHumanizedText } from "@/lib/engines/humanize/humanize.engine";
import type { HumanizedSentence } from "@/lib/engines/humanize/humanize.engine";

import { vFindings, type VerifyFinding } from "@/lib/engines/verify/verify.engine";
import type { CorrectFlagResponse } from "@/lib/api/correct";
import { checkSimilarity } from "@/lib/api/similarity";

import { analyseReadability } from "@/lib/engines/readability/readability.engine";

import { ANONYMOUS_RUNS } from "@/lib/engines/plan/plan.engine";

import { wordCount } from "@/lib/text/segment-text";

import type { AnchorXY } from "@/lib/hooks/use-anchor-xy";

import type { LangCode } from "@/lib/engines/language/languages.data";

import * as authApi from "@/lib/api/auth";
import { broadcastAccessTokenToExtension } from "@/lib/extension-bridge";
import { correctText } from "@/lib/api/correct";
import { detectText } from "@/lib/api/detect";
import { streamHumanize } from "@/lib/api/humanize";
import { getMe } from "@/lib/api/me";
import { getHistory } from "@/lib/api/history";
import { ApiError, apiErrorCode, knownErrorCode } from "@/lib/api/client";

/* ------------------------------------------------------------------ */
/* Module-scoped instance fields (ported from `this._sim`, `this._host`,
   `this._toast`, `this._h`, `this._t2`, `this["_c"+key]`).             */
/* ------------------------------------------------------------------ */

let readTimer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const copyTimers: Partial<Record<"copied" | "extCopied", ReturnType<typeof setTimeout>>> = {};

export interface FlipFlags {
  flipUp: boolean;
  flipRight: boolean;
}

const NO_FLIP: FlipFlags = { flipUp: false, flipRight: false };


export interface StudioActions {
  // ---- Navigation --------------------------------------------------
  goCorrect: () => void;
  goHuman: () => void;
  goVerify: () => void;
  goRead: () => void;
  goCount: () => void;
  goHistory: () => void;
  goProfile: () => void;
  /** Module-sheet pick: switches tab, closes the sheet and resets the mobile column. */
  pickModule: (tab: StudioTab) => void;
  toggleLang: () => void;
  pickLang: (code: LangCode) => void;
  toggleAvatar: () => void;
  closeAvatar: () => void;

  // ---- Mobile chrome ------------------------------------------------
  setMTab: (tab: MobileTab) => void;
  openModSheet: () => void;
  closeModSheet: () => void;
  openTuneSheet: () => void;
  closeTuneSheet: () => void;

  // ---- Account and plan ---------------------------------------------
  setPlan: (plan: PlanId) => void;
  openGate: (mode?: StudioState["gateMode"]) => void;
  closeGate: () => void;
  gateSwitch: () => void;
  /**
   * Real signup/login against the backend — throws on failure, sets `authError` either way.
   * Resolves `"otp"` when the email still needs its 6-digit code (always after signup).
   */
  signup: (email: string, password: string) => Promise<AuthOutcome>;
  login: (email: string, password: string) => Promise<AuthOutcome>;
  /** Confirms `pendingEmail` with the emailed code and opens the session. Throws on failure. */
  verifyEmailCode: (code: string) => Promise<void>;
  resendEmailCode: () => Promise<void>;
  /** Leaves the OTP step back to the signup form (wrong email typed). */
  leaveOtp: () => void;
  logout: () => Promise<void>;
  /** Silent session restore from the refresh cookie, called once at app boot. */
  refreshSession: () => Promise<void>;

  // ---- Shared document ----------------------------------------------
  setText: (text: string) => void;
  clearText: () => void;
  copyText: () => void;

  // ---- Correction ----------------------------------------------------
  runAnalysis: () => Promise<void>;
  setFilter: (filter: FixFilter) => void;
  apply: (fix: Fix) => void;
  ignore: (fix: Fix) => void;
  mute: (fix: Fix) => void;
  applyAll: () => void;
  ignoreAll: () => void;
  undo: () => void;
  onCaret: (caretPos: number, flip?: FlipFlags) => void;
  locateActive: (flip?: FlipFlags) => void;
  prevFix: (flip?: FlipFlags) => void;
  nextFix: (flip?: FlipFlags) => void;
  closePop: () => void;

  // ---- Humanisation ----------------------------------------------------
  setTone: (label: string) => void;
  toggleToneMenu: () => void;
  setIntensity: (idx: number) => void;
  runHumanize: () => Promise<void>;
  setView: (view: StudioState["view"]) => void;
  hoverSentence: (idx: number | null) => void;
  toggleSentence: (idx: number) => void;
  closeSentence: () => void;
  toggleRevertSentence: (idx: number) => void;
  copyHuman: () => void;
  clearHuman: () => void;
  rwPrev: () => void;
  rwNext: () => void;
  rwToggle: () => void;
  rwLocate: () => void;
  transDismiss: () => void;
  transRun: (translatedText: string) => Promise<void>;

  // ---- Vérification ----------------------------------------------------
  setVText: (text: string) => void;
  vClear: () => void;
  vRun: () => Promise<void>;
  vDemo: (text: string) => Promise<void>;
  /** Humanisation's "Lancer la vérification": switches to Vérification on the humanised text and runs it. */
  humVerify: () => Promise<void>;
  vEdit: () => void;
  simStart: () => Promise<void>;
  simSrcPrev: () => void;
  simSrcNext: () => void;
  locateSource: (srcIdx: number) => void;
  vPopToggle: (id: string, xy: AnchorXY) => void;
  vPopJump: (dir: 1 | -1) => void;
  vPopDismiss: () => void;
  vPopClose: () => void;
  applyFindingAction: (finding: VerifyFinding, refTitle?: string) => void;
  /** Ported from the `vdAction` closure — switches tab without touching menu state. */
  vdGoto: (tab: "correct" | "human") => void;
  /** Ported from the `simActive.cite` closure — toasts the copied reference. */
  copySourceRef: (title: string) => void;

  // ---- Lisibilité ----------------------------------------------------
  setRText: (text: string) => void;
  rClear: () => void;
  rRun: () => void;
  rDemo: (text: string) => void;
  rEdit: () => void;
  /** Selects a finding in the sidebar queue without opening its popover. */
  rSelect: (idx: number) => void;
  rPopToggle: (idx: number, xy: AnchorXY) => void;
  rPopJump: (dir: 1 | -1) => void;
  rPopClose: () => void;
  rPrev: () => void;
  rNext: () => void;
  rGoCorrect: () => void;
  /** Hands a text to Lisibilité and runs the measure on it. */
  goReadWith: (text: string) => void;

  // ---- Compteur ------------------------------------------------------
  setCText: (text: string) => void;
  cClear: () => void;

  // ---- Profil / Historique ---------------------------------------------
  loadProfile: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;

  // ---- Extension panel --------------------------------------------
  toggleExt: () => void;
  extCorrect: (out: string, label: string, meta: string) => void;
  extHumanize: (out: string, label: string, meta: string) => void;
  extTone: (out: string, label: string, meta: string) => void;
  extCopy: () => void;
  extReplace: () => void;
}

export type StudioStore = StudioState & StudioActions;

const initialState: StudioState = {
  tab: "correct",
  lang: "FR",
  langOpen: false,
  avatarOpen: false,
  mTab: "text",
  modSheet: false,
  tuneSheet: false,

  signedIn: null,
  plan: null,
  userEmail: "",
  accessToken: null,
  authLoading: false,
  authError: null,
  cUsed: 0,
  hUsed: 0,
  vUsed: 0,
  gateOpen: false,
  gateMode: "signup",
  pendingEmail: "",

  text: SEED,

  analyzed: false,
  analyzing: false,
  analyzeError: null,
  flags: [],
  handled: {},
  muted: [],
  filter: "Tout",
  activeId: 1,
  popOpen: false,
  flipUp: false,
  flipRight: false,

  tone: null,
  toneMenu: false,
  intensity: 1,
  transDone: false,
  transHidden: false,
  view: "source",
  reverted: {},
  rwIdx: 0,
  humanOut: null,
  busy: false,
  hoverIdx: null,
  openIdx: null,

  vText: "",
  vFromHuman: false,
  vRan: false,
  vEditing: true,
  simPhase: "idle",
  simResult: null,
  simError: null,
  simIgnored: [],
  simSrcIdx: 0,
  fdDismissed: [],
  vPop: null,
  popXY: null,
  detectResult: null,
  detecting: false,

  rText: "",
  rRan: false,
  rBusy: false,
  rEditing: true,
  rIdx: 0,
  rPop: null,
  rPopXY: null,

  cText: "",

  profile: null,
  profileLoading: false,
  profileError: null,

  historyItems: [],
  historyCursor: null,
  historyLoading: false,
  historyLoadingMore: false,
  historyLoaded: false,
  historyError: null,

  copied: false,
  extCopied: false,
  undoSnap: null,
  toastKey: "",
  toastParams: undefined,
  extOpen: null,
  extOut: "",
  extLabel: "",
  extMeta: "",
};

export const useStudioStore = create<StudioStore>()((set, get) => {
  /**
   * Ported from `toast()`. `key` is resolved against the `common` message
   * namespace by `UndoToast` (`errors.<code>` for API-error toasts,
   * `toasts.<name>` for action-confirmation toasts) — never pre-formatted
   * text, so the toast always renders in the current site locale.
   */
  const toast = (key: string, params: Record<string, string | number> | undefined, snap: Partial<StudioState> | null) => {
    set({ toastKey: key, toastParams: params, undoSnap: snap });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toastKey: "", toastParams: undefined, undoSnap: null }), 5000);
  };

  /** Ported from `snapshot()`. */
  const snapshot = (): Partial<StudioState> => {
    const s = get();
    return snapshotOf(s.text, s.handled, s.muted);
  };

  /** Ported from `copy()`. */
  const copyToClipboard = (value: string, key: "copied" | "extCopied") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    set({ [key]: true } as Partial<StudioStore>);
    const existing = copyTimers[key];
    if (existing) clearTimeout(existing);
    copyTimers[key] = setTimeout(() => set({ [key]: false } as Partial<StudioStore>), 1600);
  };

  /** The live/queue fixes for the current text+handled+muted+filter, from the real /v1/correct result. */
  const getLiveAndQueue = () => {
    const s = get();
    const live = liveFixes(s.text, s.handled, s.muted, s.flags);
    const queue = queueFixes(live, s.filter);
    return { live, queue };
  };

  /**
   * Tone/intensity are just remembered here — no auto re-run. Re-generating
   * against the real backend costs quota and time, unlike the old local mock,
   * so the user has to hit "Régénérer" again to apply a new tone/intensity.
   */
  const retune = (patch: Partial<StudioState>) => set(patch);

  /** Recomputes the sorted, non-dismissed Vérification findings + active pointer. */
  const computeVerifyFindings = () => {
    const s = get();
    const txt = s.vText || "";
    const ran = s.vRan && wordCount(txt) > 0;
    const sim = ran && s.simPhase === "done" ? s.simResult : null;
    const dismissed = s.fdDismissed || [];
    const all = ran
      ? vFindings(txt, sim)
          .filter((f) => !dismissed.includes(f.id))
          .sort((a, b) => (a.sIdx[0] === undefined ? 99 : a.sIdx[0]) - (b.sIdx[0] === undefined ? 99 : b.sIdx[0]))
      : [];
    const active = s.vPop && all.some((f) => f.id === s.vPop) ? s.vPop : null;
    const aIdx = all.findIndex((f) => f.id === active);
    return { all, aIdx, cur: aIdx === -1 ? null : all[aIdx], sim };
  };

  /** The Lisibilité findings queue for the current text. */
  const readFindingCount = () => analyseReadability(get().rText || "").findings.length;

  /** Every module switch closes the menus, sheets and both inline popovers. */
  const leaveTab = (tab: StudioTab): Partial<StudioState> => ({
    tab,
    langOpen: false,
    avatarOpen: false,
    toneMenu: false,
    modSheet: false,
    tuneSheet: false,
    vPop: null,
    popXY: null,
    rPop: null,
    rPopXY: null,
  });

  /**
   * Ported from the `vRun`/`applyAll` guards: without an account, the second
   * run of a metered tool opens the sign-up gate instead. Returns true when the
   * caller must stop.
   */
  const gateIfExhausted = (used: number): boolean => {
    if (resolveSignedIn(get(), DEFAULT_STUDIO_CONFIG) || used < ANONYMOUS_RUNS) return false;
    set({ gateOpen: true, gateMode: "signup", avatarOpen: false, langOpen: false });
    return true;
  };

  /**
   * Anonymous users must never see a raw "quota atteint" message — `gateIfExhausted`
   * above is meant to stop them before the backend ever does. If a `quota_exceeded`
   * error still comes back for an anonymous request (e.g. the local counter was reset
   * in another tab while the backend's own anon-cookie quota was already used), force
   * the sign-up flow instead of leaking the message. Returns true when handled.
   */
  const openGateInsteadOfQuotaMessage = (code: string): boolean => {
    if (code !== "quota_exceeded" || resolveSignedIn(get(), DEFAULT_STUDIO_CONFIG)) return false;
    set({ gateOpen: true, gateMode: "signup", avatarOpen: false, langOpen: false });
    return true;
  };

  /**
   * Shared body of `vRun`, `vDemo` and `humVerify`: counts the run, resets the
   * Vérification view, then fires the similarity scan and POST /v1/detect.
   * `patch` carries what differs per entry point (text, tab, `vFromHuman`).
   */
  const startVerification = async (patch: Partial<StudioState>): Promise<void> => {
    set((st) => ({
      vFromHuman: false,
      ...patch,
      vRan: true,
      vEditing: false,
      vPop: null,
      popXY: null,
      fdDismissed: [],
      vUsed: st.vUsed + 1,
      detecting: true,
      detectResult: null,
    }));
    void get().simStart();
    try {
      const result = await detectText(get().vText, { token: get().accessToken });
      set({ detectResult: result, detecting: false });
    } catch (error) {
      set({ detecting: false });
      const code = error instanceof ApiError ? error.code : "";
      if (openGateInsteadOfQuotaMessage(code)) return;
      toast(`errors.${apiErrorCode(error)}`, undefined, null);
    }
  };

  return {
    ...initialState,

    // ================= Navigation =================
    goCorrect: () => set(leaveTab("correct")),
    goHuman: () => set(leaveTab("human")),
    goVerify: () => set(leaveTab("verify")),
    goRead: () => set(leaveTab("read")),
    goCount: () => set(leaveTab("count")),
    goHistory: () => set(leaveTab("history")),
    goProfile: () => set(leaveTab("profile")),
    pickModule: (tab) => set({ ...leaveTab(tab), mTab: "text" }),
    toggleLang: () => set((s) => ({ langOpen: !s.langOpen })),
    pickLang: (code) => set({ lang: code, langOpen: false }),
    toggleAvatar: () => set((s) => ({ avatarOpen: !s.avatarOpen, langOpen: false })),
    closeAvatar: () => set({ avatarOpen: false }),

    // ================= Mobile chrome =================
    setMTab: (mTab) => set({ mTab }),
    openModSheet: () => set({ modSheet: true, avatarOpen: false, langOpen: false }),
    closeModSheet: () => set({ modSheet: false }),
    openTuneSheet: () => set({ tuneSheet: true, toneMenu: false, langOpen: false, avatarOpen: false }),
    closeTuneSheet: () => set({ tuneSheet: false }),

    // ================= Account and plan =================
    setPlan: (plan) => set({ plan, tab: "correct" }),
    openGate: (mode = "signup") =>
      set({ gateOpen: true, gateMode: mode, avatarOpen: false, langOpen: false, authError: null }),
    closeGate: () => set({ gateOpen: false, authError: null }),
    gateSwitch: () => set((s) => ({ gateMode: s.gateMode === "login" ? "signup" : "login", authError: null })),

    signup: async (email, password) => {
      set({ authLoading: true, authError: null });
      try {
        await authApi.signup(email, password);
        set({ authLoading: false, pendingEmail: email, gateMode: "otp" });
        return "otp";
      } catch (error) {
        set({ authLoading: false, authError: apiErrorCode(error) });
        throw error;
      }
    },

    login: async (email, password) => {
      set({ authLoading: true, authError: null });
      try {
        const { accessToken } = await authApi.login(email, password);
        set({ accessToken, signedIn: true, userEmail: email, gateOpen: false, authLoading: false });
        broadcastAccessTokenToExtension(accessToken);
        return "signed-in";
      } catch (error) {
        // Unconfirmed account: the backend has just emailed a fresh code.
        if (error instanceof ApiError && error.code === "email_not_verified") {
          set({ authLoading: false, pendingEmail: email, gateMode: "otp" });
          return "otp";
        }
        set({ authLoading: false, authError: apiErrorCode(error) });
        throw error;
      }
    },

    verifyEmailCode: async (code) => {
      const email = get().pendingEmail;
      set({ authLoading: true, authError: null });
      try {
        const { accessToken } = await authApi.verifyEmailCode(email, code);
        set({
          accessToken,
          signedIn: true,
          userEmail: email,
          pendingEmail: "",
          gateOpen: false,
          gateMode: "signup",
          authLoading: false,
        });
        broadcastAccessTokenToExtension(accessToken);
      } catch (error) {
        set({ authLoading: false, authError: apiErrorCode(error) });
        throw error;
      }
    },

    resendEmailCode: async () => {
      set({ authError: null });
      await authApi.resendEmailCode(get().pendingEmail).catch(() => {});
      toast("toasts.codeResent", undefined, null);
    },

    leaveOtp: () => set({ pendingEmail: "", gateMode: "signup", authError: null }),

    logout: async () => {
      await authApi.logout().catch(() => {});
      set({
        accessToken: null,
        signedIn: false,
        userEmail: "",
        flags: [],
        humanOut: null,
        detectResult: null,
        avatarOpen: false,
        tab: "correct",
      });
    },

    refreshSession: async () => {
      const result = await authApi.refresh();
      if (result) {
        set({ accessToken: result.accessToken, signedIn: true });
        // Also covers the "already logged in, opened via the extension's 'Se
        // connecter' button" case — no fresh credentials entered, so signup/login
        // never fire, but the extension still needs this session's token.
        broadcastAccessTokenToExtension(result.accessToken);
      }
    },

    // ================= Shared document =================
    setText: (text) => set({ text, popOpen: false, analyzed: false, analyzing: false, flags: [], analyzeError: null }),
    clearText: () =>
      set({ text: "", handled: {}, humanOut: null, analyzed: false, analyzing: false, flags: [], analyzeError: null }),
    copyText: () => copyToClipboard(get().text, "copied"),

    // ================= Correction =================
    // Nothing is flagged until the analysis has run: the Correction tab opens on
    // an un-analysed document and the CTA calls POST /v1/correct.
    runAnalysis: async () => {
      const s = get();
      if (s.analyzing || s.analyzed) return;
      if (gateIfExhausted(s.cUsed)) return;
      set({ analyzing: true, analyzeError: null, mTab: "res", cUsed: s.cUsed + 1 });
      try {
        const { flags } = await correctText(s.text, s.lang, { token: get().accessToken });
        const mapped: Fix[] = flags.map((f: CorrectFlagResponse) => ({
          id: f.id,
          cat: f.cat,
          rule: f.rule,
          from: f.from,
          to: f.to,
          why: f.why,
        }));
        set({ analyzing: false, analyzed: true, flags: mapped });
      } catch (error) {
        set({ analyzing: false });
        const code = error instanceof ApiError ? error.code : "";
        if (openGateInsteadOfQuotaMessage(code)) return;
        const errorCode = apiErrorCode(error);
        set({ analyzeError: errorCode });
        toast(`errors.${errorCode}`, undefined, null);
      }
    },

    setFilter: (filter) => set({ filter, popOpen: false }),

    apply: (f) => {
      const snap = snapshot();
      const { queue } = getLiveAndQueue();
      const nextId = advanceFix(queue, f.id);
      set((s) => ({
        text: s.text.replace(f.from, f.to),
        handled: { ...s.handled, [f.id]: "applied" },
        activeId: nextId || s.activeId,
        popOpen: false,
      }));
      toast("toasts.fixApplied", { value: f.to }, snap);
    },

    ignore: (f) => {
      const snap = snapshot();
      const { queue } = getLiveAndQueue();
      const nextId = advanceFix(queue, f.id);
      set((s) => ({ handled: { ...s.handled, [f.id]: "ignored" }, activeId: nextId || s.activeId, popOpen: false }));
      toast("toasts.suggestionIgnored", undefined, snap);
    },

    mute: (f) => {
      const snap = snapshot();
      set((s) => ({ muted: s.muted.concat(f.rule), popOpen: false }));
      toast("toasts.ruleDisabled", { rule: f.rule }, snap);
    },

    applyAll: () => {
      const s = get();
      const snap = snapshot();
      const { live } = getLiveAndQueue();
      const { text } = applyAllFixes(s.text, live, s.handled);
      // Tout est traité : repasse en "non analysé" pour que la barre d'action
      // réaffiche "Analyser" plutôt que "Tout ignorer / Tout corriger (0)".
      set({ text, handled: {}, flags: [], analyzed: false, popOpen: false });
      toast("toasts.correctionsApplied", { n: live.length }, snap);
    },

    ignoreAll: () => {
      const snap = snapshot();
      set({ handled: {}, flags: [], analyzed: false, popOpen: false });
      toast("toasts.allIgnored", undefined, snap);
    },

    undo: () => {
      const s = get();
      if (s.undoSnap) set({ ...s.undoSnap, toastKey: "", toastParams: undefined, undoSnap: null, popOpen: false });
    },

    onCaret: (caretPos, flip = NO_FLIP) => {
      const s = get();
      const { live } = getLiveAndQueue();
      const hit = findFixAtCaret(s.text, live, caretPos);
      if (hit) set({ activeId: hit.id, popOpen: true, filter: "Tout", ...flip });
      else if (s.popOpen) set({ popOpen: false });
    },

    locateActive: (flip = NO_FLIP) => {
      const { live, queue } = getLiveAndQueue();
      const s = get();
      const active = live.find((f) => f.id === s.activeId) || queue[0] || null;
      if (!active) return;
      set({ popOpen: true, ...flip });
    },

    prevFix: (flip = NO_FLIP) => {
      const { live, queue } = getLiveAndQueue();
      if (!queue.length) return;
      const s = get();
      const active = live.find((f) => f.id === s.activeId) || queue[0] || null;
      const i = queue.findIndex((f) => active && f.id === active.id);
      const n = queue[(i - 1 + queue.length) % queue.length];
      if (n) set({ activeId: n.id, popOpen: s.popOpen, ...flip });
    },

    nextFix: (flip = NO_FLIP) => {
      const { live, queue } = getLiveAndQueue();
      if (!queue.length) return;
      const s = get();
      const active = live.find((f) => f.id === s.activeId) || queue[0] || null;
      const i = queue.findIndex((f) => active && f.id === active.id);
      const n = queue[(i + 1) % queue.length];
      if (n) set({ activeId: n.id, popOpen: s.popOpen, ...flip });
    },

    closePop: () => set({ popOpen: false }),

    // ================= Humanisation =================
    setTone: (label) => retune({ tone: label, toneMenu: false }),
    toggleToneMenu: () => set((s) => ({ toneMenu: !s.toneMenu })),
    setIntensity: (idx) => retune({ intensity: idx }),

    runHumanize: async () => {
      const s = get();
      if (gateIfExhausted(s.hUsed)) return;
      set({
        busy: true,
        tab: "human",
        humanOut: [],
        hoverIdx: null,
        openIdx: null,
        reverted: {},
        rwIdx: 0,
        view: "result",
        hUsed: s.hUsed + 1,
      });

      await streamHumanize(
        { text: s.text, tone: resolveTone(s), intensity: s.intensity as 0 | 1 | 2, lang: s.lang },
        {
          onSegment: (seg) => {
            const entry: HumanizedSentence = {
              text: seg.after,
              before: seg.before,
              changed: seg.after !== seg.before,
              tag: seg.tag,
              why: seg.why,
            };
            set((st) => ({ humanOut: [...(st.humanOut ?? []), entry] }));
          },
          onDone: () => {
            set({ busy: false });
          },
          onError: (err) => {
            set({ busy: false, humanOut: null });
            if (openGateInsteadOfQuotaMessage(err.code)) return;
            toast(`errors.${knownErrorCode(err.code)}`, undefined, null);
          },
        },
        get().accessToken,
      );
    },

    setView: (view) => set({ view }),
    hoverSentence: (idx) => set({ hoverIdx: idx }),

    toggleSentence: (idx) => {
      const s = get();
      const out = s.humanOut || [];
      const entry = out[idx];
      if (!entry || !entry.changed) return;
      const list = changedEntries(out);
      set({
        openIdx: s.openIdx === idx ? null : idx,
        rwIdx: Math.max(list.findIndex((r) => r.i === idx), 0),
      });
    },

    closeSentence: () => set({ openIdx: null }),

    toggleRevertSentence: (idx) => set((s) => ({ reverted: { ...s.reverted, [idx]: !s.reverted[idx] } })),

    copyHuman: () => {
      const s = get();
      const value = s.view === "source" ? s.text : effectiveHumanizedText(s.humanOut || [], s.reverted);
      copyToClipboard(value, "copied");
    },

    clearHuman: () =>
      set({
        text: "",
        humanOut: null,
        reverted: {},
        analyzed: false,
        analyzing: false,
        flags: [],
        popOpen: false,
      }),

    rwPrev: () => {
      const s = get();
      const list = changedEntries(s.humanOut || []);
      if (!list.length) return;
      const rwIdx = Math.min(s.rwIdx, Math.max(list.length - 1, 0));
      set({ rwIdx: (rwIdx - 1 + list.length) % list.length, openIdx: null });
    },

    rwNext: () => {
      const s = get();
      const list = changedEntries(s.humanOut || []);
      if (!list.length) return;
      const rwIdx = Math.min(s.rwIdx, Math.max(list.length - 1, 0));
      set({ rwIdx: (rwIdx + 1) % list.length, openIdx: null });
    },

    rwToggle: () => {
      const s = get();
      const list = changedEntries(s.humanOut || []);
      if (!list.length) return;
      const rwIdx = Math.min(s.rwIdx, Math.max(list.length - 1, 0));
      const activeRw = list[rwIdx];
      if (!activeRw) return;
      set((st) => ({ reverted: { ...st.reverted, [activeRw.i]: !st.reverted[activeRw.i] } }));
    },

    rwLocate: () => {
      const s = get();
      const list = changedEntries(s.humanOut || []);
      if (!list.length) return;
      const rwIdx = Math.min(s.rwIdx, Math.max(list.length - 1, 0));
      const activeRw = list[rwIdx];
      if (!activeRw) return;
      set({ view: "result", openIdx: activeRw.i });
    },

    transDismiss: () => set({ transHidden: true }),

    // Translation itself has no backend endpoint (no Lot covers it) — only this
    // swap stays mocked. Humanizing the translated text goes through the real
    // pipeline exactly like `runHumanize`, by calling it directly.
    transRun: async (translatedText) => {
      const snap = snapshot();
      set({ text: translatedText, transDone: true });
      await get().runHumanize();
      if (get().gateOpen) return; // runHumanize stopped at the anonymous-run gate: nothing ran.
      toast("toasts.translatedAndHumanized", undefined, snap);
    },

    // ================= Vérification =================
    setVText: (text) =>
      set({
        vText: text,
        vFromHuman: false,
        vRan: false,
        simPhase: "idle",
        simResult: null,
        simError: null,
        vEditing: true,
        vPop: null,
        popXY: null,
        detectResult: null,
      }),
    vClear: () =>
      set({
        vText: "",
        vFromHuman: false,
        vRan: false,
        simPhase: "idle",
        simResult: null,
        simError: null,
        vEditing: true,
        fdDismissed: [],
        vPop: null,
        popXY: null,
        detectResult: null,
      }),

    // The AI-likelihood score comes from the real POST /v1/detect below. The
    // Sources/Similarité card (`simStart` → `simAnalyse`) stays exactly as it
    // was — no backend for it yet — running independently of the real call.
    vRun: async () => {
      const s = get();
      if (!s.vText.trim()) return;
      if (gateIfExhausted(s.vUsed)) return;
      await startVerification({});
    },

    vDemo: async (text) => {
      if (gateIfExhausted(get().vUsed)) return;
      await startVerification({ vText: text });
    },

    // "Et maintenant ?" → Vérification on the humanised text, analysis started
    // right away (PureText AI.dc.html `humVerify`). Same one-free-run limit.
    humVerify: async () => {
      const s = get();
      if (!s.humanOut?.length || s.busy) return;
      if (gateIfExhausted(s.vUsed)) return;
      await startVerification({
        ...leaveTab("verify"),
        vText: effectiveHumanizedText(s.humanOut, s.reverted),
        vFromHuman: true,
      });
    },

    vEdit: () => set({ vEditing: true }),

    simStart: async () => {
      set({ simPhase: "loading", simError: null });
      try {
        const result = await checkSimilarity(get().vText || "", { token: get().accessToken });
        set({ simPhase: "done", simResult: result, simSrcIdx: 0 });
      } catch (error) {
        set({ simPhase: "idle" });
        if (openGateInsteadOfQuotaMessage(error instanceof ApiError ? error.code : "")) return;
        set({ simError: apiErrorCode(error) });
      }
    },

    simSrcPrev: () => {
      const s = get();
      const sim = s.simPhase === "done" ? s.simResult : null;
      const count = sim && sim.sources.length ? sim.sources.length : 1;
      const srcIdx = sim && sim.sources.length ? Math.min(s.simSrcIdx || 0, sim.sources.length - 1) : 0;
      set({ simSrcIdx: (srcIdx - 1 + count) % count });
    },

    simSrcNext: () => {
      const s = get();
      const sim = s.simPhase === "done" ? s.simResult : null;
      const count = sim && sim.sources.length ? sim.sources.length : 1;
      const srcIdx = sim && sim.sources.length ? Math.min(s.simSrcIdx || 0, sim.sources.length - 1) : 0;
      set({ simSrcIdx: (srcIdx + 1) % count });
    },

    locateSource: (srcIdx) => set({ vPop: "s" + srcIdx }),

    vPopToggle: (id, xy) =>
      set((s) => (s.vPop === id ? { vPop: null, popXY: null } : { vPop: id, popXY: xy })),

    vPopJump: (dir) => {
      const { all, aIdx } = computeVerifyFindings();
      if (!all.length) return;
      const n = all[(aIdx + dir + all.length) % all.length];
      if (n) set({ vPop: n.id });
    },

    vPopDismiss: () => {
      const { cur } = computeVerifyFindings();
      const s = get();
      set({ fdDismissed: (s.fdDismissed || []).concat(cur ? [cur.id] : []), vPop: null, popXY: null });
    },

    vPopClose: () => set({ vPop: null, popXY: null }),

    applyFindingAction: (finding, refTitle) => {
      if (finding.actionKind === "copyRef") {
        set({ vPop: null, popXY: null });
        toast("toasts.referenceCopied", { title: refTitle ?? "" }, null);
        return;
      }
      set({ ...leaveTab("human") });
    },

    vdGoto: (tab) => set({ tab }),
    copySourceRef: (title) => toast("toasts.referenceCopied", { title }, null),

    // ================= Lisibilité =================
    setRText: (text) =>
      set({ rText: text, rRan: false, rBusy: false, rEditing: true, rIdx: 0, rPop: null, rPopXY: null }),
    rClear: () =>
      set({ rText: "", rRan: false, rBusy: false, rEditing: true, rIdx: 0, rPop: null, rPopXY: null }),

    rRun: () => {
      const s = get();
      if (!s.rText.trim() || s.rBusy) return;
      set({ rBusy: true, rEditing: false, rRan: false, rIdx: 0, rPop: null, rPopXY: null });
      if (readTimer) clearTimeout(readTimer);
      readTimer = setTimeout(() => set({ rBusy: false, rRan: true }), 1200);
    },

    rDemo: (text) => set({ rText: text, rRan: true, rBusy: false, rEditing: false, rIdx: 0, rPop: null, rPopXY: null }),
    rEdit: () => set({ rEditing: true }),

    rSelect: (idx) => set({ rIdx: idx, rPop: null, rPopXY: null }),

    rPopToggle: (idx, xy) =>
      set((s) => (s.rPop === idx ? { rPop: null, rPopXY: null, rIdx: idx } : { rPop: idx, rPopXY: xy, rIdx: idx })),

    rPopJump: (dir) => {
      const count = readFindingCount();
      if (!count) return;
      const s = get();
      const from = s.rPop ?? s.rIdx;
      const n = (from + dir + count) % count;
      set({ rPop: n, rIdx: n });
    },

    rPopClose: () => set({ rPop: null, rPopXY: null }),

    rPrev: () => {
      const count = readFindingCount();
      if (!count) return;
      set((s) => ({ rIdx: (s.rIdx - 1 + count) % count, rPop: null, rPopXY: null }));
    },

    rNext: () => {
      const count = readFindingCount();
      if (!count) return;
      set((s) => ({ rIdx: (s.rIdx + 1) % count, rPop: null, rPopXY: null }));
    },

    // Carries the measured text over to Correction, as the banner CTA promises.
    rGoCorrect: () => set({ ...leaveTab("correct"), text: get().rText, analyzed: false, analyzing: false }),

    goReadWith: (text) =>
      set({
        ...leaveTab("read"),
        popOpen: false,
        rText: text,
        rRan: !!text.trim(),
        rBusy: false,
        rEditing: !text.trim(),
        rIdx: 0,
      }),

    // ================= Compteur =================
    setCText: (cText) => set({ cText }),
    cClear: () => set({ cText: "" }),

    // ================= Profil / Historique =================
    loadProfile: async () => {
      if (get().profileLoading) return;
      set({ profileLoading: true, profileError: null });
      try {
        const profile = await getMe({ token: get().accessToken });
        set({ profile, profileLoading: false });
      } catch (error) {
        set({ profileLoading: false, profileError: apiErrorCode(error) });
      }
    },

    loadHistory: async () => {
      if (get().historyLoading) return;
      set({ historyLoading: true, historyError: null });
      try {
        const page = await getHistory(null, { token: get().accessToken });
        set({
          historyItems: page.items,
          historyCursor: page.nextCursor,
          historyLoading: false,
          historyLoaded: true,
        });
      } catch (error) {
        set({ historyLoading: false, historyLoaded: true, historyError: apiErrorCode(error) });
      }
    },

    loadMoreHistory: async () => {
      const s = get();
      if (s.historyLoadingMore || !s.historyCursor) return;
      set({ historyLoadingMore: true, historyError: null });
      try {
        const page = await getHistory(s.historyCursor, { token: get().accessToken });
        set((st) => ({
          historyItems: [...st.historyItems, ...page.items],
          historyCursor: page.nextCursor,
          historyLoadingMore: false,
        }));
      } catch (error) {
        set({ historyLoadingMore: false, historyError: apiErrorCode(error) });
      }
    },

    // ================= Extension panel =================
    toggleExt: () => set((s) => ({ extOpen: !resolveExtOpen(s, DEFAULT_STUDIO_CONFIG) })),

    extCorrect: (out, label, meta) => set({ extOut: out, extLabel: label, extMeta: meta }),
    extHumanize: (out, label, meta) => set({ extOut: out, extLabel: label, extMeta: meta }),
    extTone: (out, label, meta) => set({ extOut: out, extLabel: label, extMeta: meta }),

    extCopy: () => copyToClipboard(get().extOut, "extCopied"),
    extReplace: () => set({ text: get().extOut, extOpen: false, tab: "correct", handled: {} }),
  };
});
