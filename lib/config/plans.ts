/**
 * Catalog prices for each plan — a product-level constant, not billing/
 * subscription data. Mirrors `puretextai_api/src/config/plans.ts`'s
 * `priceMonthlyCents`/`priceYearlyCents` (decided with the user: Studio
 * 4,99 €/mois · 39,99 €/an). Genuine subscription data (which interval a
 * given user is on, the actual renewal date) needs Stripe, not wired yet —
 * see `puretextai_api/src/db/schema/subscriptions.ts`'s comment. Don't
 * confuse the two: this price is known and safe to show; a specific
 * renewal date for a specific user is not.
 */

export const PLAN_PRICES = {
  free: { monthlyCents: 0, yearlyCents: 0 },
  studio: { monthlyCents: 499, yearlyCents: 3999 },
} as const;

/** "4,99 €" (fr) / "€4.99" (en) — matches `Intl.NumberFormat`'s locale-native currency placement. */
export function formatPlanPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(cents / 100);
}
