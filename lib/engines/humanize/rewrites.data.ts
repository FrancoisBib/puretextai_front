/**
 * Ported verbatim from the original DCLogic component's `TONES`,
 * `TONE_GROUPS` and `INTENSITIES` constants.
 *
 * `REWRITES`/`TERSE` and the `humanizeText()` function that consumed them
 * were removed: real generation goes through `streamHumanize()` (a live
 * `/v1/humanize` API call, see `lib/api/humanize.ts`), not this local mock
 * — `humanizeText` was dead code with no callers.
 */

export type ToneGroupName = "Généraux" | "Freelance" | "Étudiant";

export interface Tone {
  label: string;
  group: ToneGroupName;
  desc: string;
}

export const TONES: Tone[] = [
  { label: "Professionnel", group: "Généraux", desc: "Neutre et clair, sans jargon." },
  { label: "Amical", group: "Généraux", desc: "Chaleureux, phrases courtes." },
  { label: "Synthétique", group: "Généraux", desc: "Va droit au fait, coupe le superflu." },
  { label: "Pitch Upwork/Malt", group: "Freelance", desc: "Accroche orientée bénéfice et ROI client." },
  { label: "Relance facture", group: "Freelance", desc: "Ferme, polie, sans s'excuser." },
  { label: "Email client pro", group: "Freelance", desc: "Courtois et direct, prêt à envoyer." },
  { label: "Cahier des charges", group: "Freelance", desc: "Factuel et structuré, sans ambiguïté." },
  { label: "LinkedIn / réseaux", group: "Freelance", desc: "Rythme court, une idée par ligne." },
  { label: "Vulgarisation académique", group: "Étudiant", desc: "Simplifie le jargon sans perdre la rigueur." },
  { label: "Mémoire / dissertation", group: "Étudiant", desc: "Registre soutenu, connecteurs maîtrisés." },
  { label: "Lettre de motivation", group: "Étudiant", desc: "Engagé et précis, sans formule creuse." },
];

export const TONE_GROUPS: ToneGroupName[] = ["Généraux", "Freelance", "Étudiant"];

export interface Intensity {
  label: string;
  /** The baseline "AI probability" this intensity settles on after humanizing. */
  ai: number;
  note: string;
}

export const INTENSITIES: Intensity[] = [
  { label: "Légère", ai: 34, note: "Retouche les formules les plus mécaniques, garde votre structure de phrases." },
  { label: "Équilibrée", ai: 12, note: "Réécrit les tournures d'IA et varie le rythme. Le meilleur compromis." },
  { label: "Maximale", ai: 3, note: "Casse la syntaxe académique en profondeur. Relisez le résultat avant publication." },
];
