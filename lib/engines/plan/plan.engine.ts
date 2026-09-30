/**
 * Plan and quota engine — port of the source's `planVals`
 * (script_block.txt:536-576).
 *
 * No tool is paywalled: Correction, Vérification, Lisibilité and Compteur all
 * work on the free plan. What the free plan caps is the *volume* handled per
 * run, plus the Maximale intensity and the non-general tone groups.
 * Pure — no React, no Zustand.
 */

import type { PlanId } from "@/lib/store/types";

/** Words handled per run on the free plan. Studio has no cap. */
export const FREE_CAPS = {
  correction: 300,
  humanize: 300,
  verify: 500,
} as const;

/** Runs allowed before the sign-up gate, for a visitor without an account. */
export const ANONYMOUS_RUNS = 1;

export interface Budget {
  /** null on Studio, where there is no cap to show. */
  used: number | null;
  cap: number | null;
  color: string;
  over: boolean;
}

/** Amber at 90% of the cap, red past it — matching the design's thresholds. */
export function budget(words: number, cap: number, plan: PlanId): Budget {
  if (plan === "studio") return { used: null, cap: null, color: "#8A857C", over: false };
  return {
    used: words,
    cap,
    color: words > cap ? "#C0392B" : words > cap * 0.9 ? "#B4780F" : "#8A857C",
    over: words > cap,
  };
}

/** The five comparison rows shown on both pricing cards — translated by key at the component layer. */
export const PLAN_ROW_KEYS = ["readCount", "correction", "humanize", "verify", "sources"] as const;
export type PlanRowKey = (typeof PLAN_ROW_KEYS)[number];

/** Tone groups outside "Généraux" are Studio-only. */
export function isToneLocked(group: string, plan: PlanId): boolean {
  return group !== "Généraux" && plan !== "studio";
}

/** Only the third intensity ("Maximale") is Studio-only. */
export function isIntensityLocked(index: number, plan: PlanId): boolean {
  return index === 2 && plan !== "studio";
}
