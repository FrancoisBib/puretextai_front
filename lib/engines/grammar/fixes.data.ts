/**
 * Ported verbatim from the original DCLogic component's `SEED` and `CAT`
 * constants. French copy is kept exactly as authored.
 *
 * The original `FIXES` mock array (local rule/from/to/why detection data)
 * was removed: real analysis goes through `correctText()` (a live
 * `POST /v1/correct` API call, see `lib/api/correct.ts`), which populates
 * `StudioState.flags` directly — `FIXES` had no callers left, `liveFixes()`
 * always receives `s.flags` from every call site.
 */
export type FixCategory = "Orthographe" | "Grammaire" | "Style" | "Vocabulaire" | "Ponctuation";

export interface Fix {
  id: number;
  cat: FixCategory;
  rule: string;
  from: string;
  to: string;
  why: string;
}

/** The default document text loaded into the Correction module. */
export const SEED =
  "Dans le cadre de cette étude, il est important de noter que l'intelligence artificielle joue un role primordial dans la transformation des entreprises. De plus, il convient de souligner que les organisations doivent impérativements s'adapter a ce nouveau paradigme technologique. Les dirigeants qui ont comprit cet enjeu investissent déjà. En conclusion, force est de constater que cette technologie transforme profondement nos méthodes de travail.";

export const CAT: Record<FixCategory, string> = {
  Orthographe: "#B23A2E",
  Grammaire: "#C08A1E",
  Style: "#049FDE",
  Vocabulaire: "#7A4FBF",
  Ponctuation: "#1F8A54",
};
