/**
 * `StudioState` mirrors the updated design's flat `state = {...}` field-for-field
 * (script_block.txt:101-141), plus every field the source only ever touches
 * through ad hoc `setState` calls outside the initial literal (`avatarOpen`,
 * `flipUp`, `flipRight`, `simSrcIdx`, `rIdx`, `rRan`, `rEditing`, `rBusy`,
 * `rPop`, `rPopXY`, `toastOpen` — derived here from `toastKey`).
 *
 * No closures/functions live in state — those are produced per-render by
 * the selectors in `lib/store/selectors/*`.
 */

import type { HandledMap, FixFilter } from "@/lib/engines/grammar/grammar.engine";
import type { Fix } from "@/lib/engines/grammar/fixes.data";
import type { HumanizedSentence } from "@/lib/engines/humanize/humanize.engine";
import type { LangCode } from "@/lib/engines/language/languages.data";
import type { AnchorXY } from "@/lib/hooks/use-anchor-xy";
import type { DetectResponse } from "@/lib/api/detect";
import type { SimilarityResponse } from "@/lib/api/similarity";
import type { MeResponse } from "@/lib/api/me";
import type { HistoryItem } from "@/lib/api/history";

/**
 * `auth` and `pricing` are tabs in the source prototype; here they are real
 * routes (`/connexion`, `/tarifs`), so they are deliberately absent from this
 * union. See the plan's routing decision.
 */
export type StudioTab = "correct" | "human" | "verify" | "read" | "count" | "history" | "profile";

export type SimPhase = "idle" | "loading" | "done";

export type HumanizeView = "source" | "result" | "diff";

/** Mobile-only column switch: the single column shows the text or the results. */
export type MobileTab = "text" | "res";

export type PlanId = "free" | "studio";

/** `otp`: the 6-digit email-confirmation step that follows signup (or login on an unconfirmed account). */
export type AuthMode = "signup" | "login" | "otp";

/** What a signup/login attempt led to — the caller shows the OTP step on `"otp"`. */
export type AuthOutcome = "signed-in" | "otp";

/**
 * Config the component originally received as `props` (see the
 * `data-props` block at the top of the source `<script>` tag):
 * `browser`, `defaultTone`, `extensionOpen`, `plan` and `signedIn`. The
 * matching state fields are `null` until the user acts, and fall back to these
 * values (ported from the source's `get tone()` / `get extOpen()` /
 * `get plan()` / `get signedIn()` getters).
 */
export interface StudioConfig {
  /** Forces the header's "Ajouter à [navigateur]" button as it looks on that browser; "Auto" detects it. */
  browser: BrowserOverride;
  defaultTone: string;
  extensionOpen: boolean;
  plan: PlanId;
  signedIn: boolean;
}

export type BrowserOverride = "Auto" | "Chrome" | "Edge" | "Brave" | "Firefox" | "Safari";

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  browser: "Auto",
  defaultTone: "Professionnel",
  extensionOpen: false,
  plan: "free",
  signedIn: false,
};

export interface StudioState {
  // ---- Navigation --------------------------------------------------
  tab: StudioTab;
  lang: LangCode;
  langOpen: boolean;
  avatarOpen: boolean;
  /** Mobile column switch; reset to "text" whenever the module changes. */
  mTab: MobileTab;
  /** Mobile bottom sheets: module picker (header) and tone/intensity (Humanisation). */
  modSheet: boolean;
  tuneSheet: boolean;

  // ---- Account and plan ---------------------------------------------
  /** null falls back to `StudioConfig.signedIn`. */
  signedIn: boolean | null;
  /** null falls back to `StudioConfig.plan`. */
  plan: PlanId | null;
  userEmail: string;
  /** In-memory only (§4 of the backend spec: 15 min JWT, never persisted). */
  accessToken: string | null;
  authLoading: boolean;
  /** A `common.errors.<code>` key (not formatted text), resolved by `AuthGate`. */
  authError: string | null;
  /** Free-plan run counters — one free run per tool (Correction, Humanisation, Vérification) without an account. */
  cUsed: number;
  hUsed: number;
  vUsed: number;
  gateOpen: boolean;
  gateMode: AuthMode;
  /** Email awaiting its confirmation code (OTP step), "" otherwise. */
  pendingEmail: string;

  // ---- Shared document ----------------------------------------------
  text: string;

  // ---- Correction ----------------------------------------------------
  /** The analysis is an explicit step: nothing is flagged until `runAnalysis` completes. */
  analyzed: boolean;
  analyzing: boolean;
  /** A `common.errors.<code>` key (not formatted text), resolved by `ReviewSidebar`. */
  analyzeError: string | null;
  /** Flags returned by `POST /v1/correct` for the current `text` — empty until `runAnalysis` succeeds. */
  flags: Fix[];
  handled: HandledMap;
  muted: string[];
  filter: FixFilter;
  activeId: number | null;
  popOpen: boolean;
  /** Popover placement flags, computed by the UI layer from DOM measurements (ported from `place()`). */
  flipUp: boolean;
  flipRight: boolean;

  // ---- Humanisation ----------------------------------------------------
  /** null falls back to `StudioConfig.defaultTone` (ported from the `get tone()` getter). */
  tone: string | null;
  toneMenu: boolean;
  intensity: number;
  transDone: boolean;
  transHidden: boolean;
  view: HumanizeView;
  reverted: Record<number, boolean>;
  rwIdx: number;
  humanOut: HumanizedSentence[] | null;
  busy: boolean;
  hoverIdx: number | null;
  openIdx: number | null;

  // ---- Vérification ----------------------------------------------------
  vText: string;
  /** The text came from "Lancer la vérification" on a humanised result — cleared on edit, clear or re-run. */
  vFromHuman: boolean;
  vRan: boolean;
  vEditing: boolean;
  simPhase: SimPhase;
  /** Result of `POST /v1/similarity` for `vText` — null until a run completes. */
  simResult: SimilarityResponse | null;
  /** A `common.errors.<code>` key, or null. */
  simError: string | null;
  /** Declared in the source's initial state but never read or written again — kept for field parity. */
  simIgnored: string[];
  simSrcIdx: number;
  fdDismissed: string[];
  vPop: string | null;
  /** Viewport coordinates of the open Vérification popover (`anchorXY`). */
  popXY: AnchorXY | null;
  /** Result of `POST /v1/detect` for `vText` — drives the AI-likelihood gauge. */
  detectResult: DetectResponse | null;
  detecting: boolean;

  // ---- Lisibilité -------------------------------------------------------
  rText: string;
  rRan: boolean;
  rBusy: boolean;
  rEditing: boolean;
  /** Index into the findings queue shown in the sidebar. */
  rIdx: number;
  /** Index of the finding whose inline popover is open, or null. */
  rPop: number | null;
  rPopXY: AnchorXY | null;

  // ---- Compteur ---------------------------------------------------------
  /** The Compteur keeps its own draft, separate from the shared `text`. */
  cText: string;

  // ---- Profil (GET /v1/me) -----------------------------------------------
  profile: MeResponse | null;
  profileLoading: boolean;
  /** A `common.errors.<code>` key (not formatted text). */
  profileError: string | null;

  // ---- Historique (GET /v1/history) ---------------------------------------
  historyItems: HistoryItem[];
  historyCursor: string | null;
  /** True only for the first page's load. */
  historyLoading: boolean;
  /** True only while fetching a subsequent page via "Charger plus". */
  historyLoadingMore: boolean;
  /** Whether the first page has been fetched at least once (drives the empty state). */
  historyLoaded: boolean;
  /** A `common.errors.<code>` key (not formatted text). */
  historyError: string | null;

  // ---- Overlays --------------------------------------------------------
  copied: boolean;
  extCopied: boolean;
  undoSnap: Partial<StudioState> | null;
  /** Key into `common.errors.<code>`/`common.toasts.<key>`, resolved at render by `UndoToast`. Empty string = hidden. */
  toastKey: string;
  toastParams: Record<string, string | number> | undefined;
  /** null falls back to `StudioConfig.extensionOpen` (ported from the `get extOpen()` getter). */
  extOpen: boolean | null;
  extOut: string;
  extLabel: string;
  extMeta: string;
}

/**
 * Resolves `state.tone`, falling back to `config.defaultTone` — ported
 * from the source's `get tone() { return this.state.tone || this.props.defaultTone || "Professionnel"; }`.
 */
export function resolveTone(state: Pick<StudioState, "tone">, config: StudioConfig = DEFAULT_STUDIO_CONFIG): string {
  return state.tone || config.defaultTone || "Professionnel";
}

/**
 * Resolves `state.extOpen`, falling back to `config.extensionOpen` —
 * ported from the source's `get extOpen() { return this.state.extOpen === null ? (this.props.extensionOpen ?? false) : this.state.extOpen; }`.
 */
export function resolveExtOpen(state: Pick<StudioState, "extOpen">, config: StudioConfig = DEFAULT_STUDIO_CONFIG): boolean {
  return state.extOpen === null ? (config.extensionOpen ?? false) : state.extOpen;
}

/**
 * Resolves `state.signedIn`, falling back to `config.signedIn` — ported from
 * the source's `get signedIn()`.
 */
export function resolveSignedIn(
  state: Pick<StudioState, "signedIn">,
  config: StudioConfig = DEFAULT_STUDIO_CONFIG,
): boolean {
  return state.signedIn === null || state.signedIn === undefined ? (config.signedIn ?? false) : state.signedIn;
}

/**
 * Resolves `state.plan`, falling back to `config.plan` — ported from the
 * source's `get plan()`.
 */
export function resolvePlan(
  state: Pick<StudioState, "plan">,
  config: StudioConfig = DEFAULT_STUDIO_CONFIG,
): PlanId {
  return state.plan === null || state.plan === undefined ? (config.plan ?? "free") : state.plan;
}
