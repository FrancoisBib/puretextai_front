/**
 * Profil view-model — reads `GET /v1/me` (fetched by `loadProfile()`,
 * triggered from `ProfileTab` on mount). Read-only for now: `PATCH /v1/me`
 * (editing preferences) isn't wired yet.
 *
 * Exposes raw values only (plan id, tone/intensity/lang codes, quota
 * numbers) — no formatted text: a selector has no access to the site's
 * locale, so `components/studio/profile/ProfileTab.tsx` resolves display
 * strings via `useTranslations`/`useLocale`.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import { memoizeLast } from "./memoize-last";

export interface ProfileQuotaRow {
  key: "correct" | "humanize" | "verify";
  /** null = unlimited this month. */
  runsLeft: number | null;
}

export interface ProfileView {
  loading: boolean;
  loaded: boolean;
  /** A `common.errors.<code>` key, or null. */
  error: string | null;
  retry: () => void;

  email: string | null;
  displayName: string | null;
  plan: "free" | "studio" | null;
  defaultTone: string | null;
  defaultIntensity: number | null;
  defaultLang: string | null;
  quotas: ProfileQuotaRow[];
}

const QUOTA_KEYS: Array<ProfileQuotaRow["key"]> = ["correct", "humanize", "verify"];

function computeProfileView(s: StudioState): ProfileView {
  return {
    loading: s.profileLoading,
    loaded: !!s.profile,
    error: s.profileError,
    retry: () => useStudioStore.getState().loadProfile(),

    email: s.profile?.email ?? null,
    displayName: s.profile?.displayName ?? null,
    plan: s.profile?.plan ?? null,
    defaultTone: s.profile?.defaultTone ?? null,
    defaultIntensity: s.profile?.defaultIntensity ?? null,
    defaultLang: s.profile?.defaultLang ?? null,
    quotas: s.profile ? QUOTA_KEYS.map((key) => ({ key, runsLeft: s.profile!.quotas[key].runsLeft })) : [],
  };
}

export const selectProfileView = memoizeLast(computeProfileView);
