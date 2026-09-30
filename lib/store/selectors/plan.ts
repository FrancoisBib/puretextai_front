/**
 * Plan, quota and sign-up-gate view-model — port of the source's `planVals`
 * (script_block.txt:536-615), minus the `auth` tab fields, which live on the
 * `/connexion` route instead of in the Studio store.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { AuthMode, PlanId, StudioState } from "@/lib/store/types";
import { DEFAULT_STUDIO_CONFIG, resolvePlan, resolveSignedIn } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

import { budget, FREE_CAPS, PLAN_ROW_KEYS, type PlanRowKey } from "@/lib/engines/plan/plan.engine";
import { wordCount } from "@/lib/text/segment-text";

export interface PlanRowView {
  key: PlanRowKey;
  studio: boolean;
}

export interface PlanView {
  plan: PlanId;
  planFree: boolean;
  planPaid: boolean;
  signedIn: boolean;
  signedOut: boolean;

  // ---- Per-tool word budgets ---------------------------------------------
  // null `cWordsUsed`/`cWordsCap` etc. mean Studio (no cap to show) — the
  // consuming tab translates the "used / cap mots" wording itself via
  // `common.wordsUsed`.
  cWordsUsed: number | null;
  cWordsCap: number | null;
  cBudgetColor: string;
  cOver: boolean;
  /** The Correction CTA shows "Lancer l'analyse" only while under the cap and un-analysed. */
  cShowRun: boolean;
  cShowActions: boolean;

  hWordsUsed: number | null;
  hWordsCap: number | null;
  hBudgetColor: string;
  hOver: boolean;
  hUnder: boolean;

  vWordsUsed: number | null;
  vWordsCap: number | null;
  vBudgetColor: string;
  vOver: boolean;
  vUnder: boolean;

  // ---- Pricing ------------------------------------------------------------
  freeRows: PlanRowView[];
  studioRows: PlanRowView[];
  pickFree: () => void;
  pickStudio: () => void;

  // ---- Sign-up gate ------------------------------------------------------
  gateOpen: boolean;
  gateMode: AuthMode;
  gateIsSignup: boolean;
  gateSwitch: () => void;
  gateClose: () => void;
  /** Real network calls — the modal owns its email/password fields and calls these directly. */
  gateSignup: (email: string, password: string) => Promise<unknown>;
  gateLogin: (email: string, password: string) => Promise<unknown>;
  gateLoading: boolean;
  gateError: string | null;
  // ---- OTP step (after signup, or login on an unconfirmed account) --------
  gateIsOtp: boolean;
  gatePendingEmail: string;
  gateVerify: (code: string) => Promise<void>;
  gateResend: () => Promise<void>;
  gateLeaveOtp: () => void;
}

function computePlanView(s: StudioState): PlanView {
  const plan = resolvePlan(s, DEFAULT_STUDIO_CONFIG);
  const free = plan !== "studio";
  const signedIn = resolveSignedIn(s, DEFAULT_STUDIO_CONFIG);

  // Correction and Humanisation both meter the shared document; Vérification
  // meters its own pasted text.
  const docWords = wordCount(s.text || "");
  const vWords = wordCount(s.vText || "");

  const c = budget(docWords, FREE_CAPS.correction, plan);
  const h = budget(docWords, FREE_CAPS.humanize, plan);
  const v = budget(vWords, FREE_CAPS.verify, plan);

  const login = s.gateMode === "login";

  return {
    plan,
    planFree: free,
    planPaid: !free,
    signedIn,
    signedOut: !signedIn,

    cWordsUsed: c.used,
    cWordsCap: c.cap,
    cBudgetColor: c.color,
    cOver: c.over,
    cShowRun: !c.over && !s.analyzed,
    cShowActions: !c.over && s.analyzed,

    hWordsUsed: h.used,
    hWordsCap: h.cap,
    hBudgetColor: h.color,
    hOver: h.over,
    hUnder: !h.over,

    vWordsUsed: v.used,
    vWordsCap: v.cap,
    vBudgetColor: v.color,
    vOver: v.over,
    vUnder: !v.over,

    freeRows: PLAN_ROW_KEYS.map((key) => ({ key, studio: false })),
    studioRows: PLAN_ROW_KEYS.map((key) => ({ key, studio: true })),
    pickFree: () => useStudioStore.getState().setPlan("free"),
    pickStudio: () => useStudioStore.getState().setPlan("studio"),

    gateOpen: s.gateOpen,
    gateMode: s.gateMode,
    gateIsSignup: !login,
    gateSwitch: () => useStudioStore.getState().gateSwitch(),
    gateClose: () => useStudioStore.getState().closeGate(),
    gateSignup: (email, password) => useStudioStore.getState().signup(email, password),
    gateLogin: (email, password) => useStudioStore.getState().login(email, password),
    gateLoading: s.authLoading,
    gateError: s.authError,
    gateIsOtp: s.gateMode === "otp",
    gatePendingEmail: s.pendingEmail,
    gateVerify: (code) => useStudioStore.getState().verifyEmailCode(code),
    gateResend: () => useStudioStore.getState().resendEmailCode(),
    gateLeaveOtp: () => useStudioStore.getState().leaveOtp(),
  };
}

export const selectPlanView = memoizeLast(computePlanView);
