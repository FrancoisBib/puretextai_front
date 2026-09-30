/**
 * Ported verbatim from the original DCLogic component's `LANGS`, `FLAGS`
 * and `STOPWORDS` constants.
 */

export type LangCode = "FR" | "EN" | "ES" | "DE" | "IT" | "PT" | "NL";

export interface LangInfo {
  code: LangCode;
  name: string;
}

export const LANGS: LangInfo[] = [
  { code: "FR", name: "Français" },
  { code: "EN", name: "English" },
  { code: "ES", name: "Español" },
  { code: "DE", name: "Deutsch" },
  { code: "IT", name: "Italiano" },
  { code: "PT", name: "Português" },
  { code: "NL", name: "Nederlands" },
];

/** Correction languages that also have a full site-UI translation (`messages/<code>`). */
export const SITE_LOCALES: Partial<Record<LangCode, "fr" | "en" | "es" | "de" | "it" | "pt" | "nl">> = {
  FR: "fr",
  EN: "en",
  ES: "es",
  DE: "de",
  IT: "it",
  PT: "pt",
  NL: "nl",
};

/** Inverse of `SITE_LOCALES` — the correction language matching each site locale. */
export const LOCALE_TO_LANG: Record<"fr" | "en" | "es" | "de" | "it" | "pt" | "nl", LangCode> = {
  fr: "FR",
  en: "EN",
  es: "ES",
  de: "DE",
  it: "IT",
  pt: "PT",
  nl: "NL",
};

/** CSS `background` values (gradients) used to render each language's flag. */
export const FLAGS: Record<LangCode, string> = {
  FR: "linear-gradient(90deg,#0B2C77 0 33.34%,#FFFFFF 0 66.67%,#D4172F 0)",
  EN: "linear-gradient(#D4172F 0 0) center/100% 26% no-repeat, linear-gradient(#D4172F 0 0) center/20% 100% no-repeat, linear-gradient(#FFFFFF 0 0) center/100% 48% no-repeat, linear-gradient(#FFFFFF 0 0) center/40% 100% no-repeat, #0B2C77",
  ES: "linear-gradient(#C60B1E 0 26%,#FFC400 0 74%,#C60B1E 0)",
  DE: "linear-gradient(#141210 0 33.34%,#D00A18 0 66.67%,#FFCE00 0)",
  IT: "linear-gradient(90deg,#0F8F4D 0 33.34%,#FFFFFF 0 66.67%,#D4172F 0)",
  PT: "linear-gradient(90deg,#0F6B3C 0 40%,#D4172F 0)",
  NL: "linear-gradient(#AE1C28 0 33.34%,#FFFFFF 0 66.67%,#1E3C8C 0)",
};

export const STOPWORDS: Record<LangCode, string[]> = {
  FR: [" les ", " des ", " une ", " est ", " dans ", " que ", " pour ", " cette ", " aux ", " plus "],
  EN: [" the ", " and ", " of ", " is ", " that ", " with ", " this ", " for ", " are ", " to "],
  ES: [" que ", " los ", " una ", " con ", " para ", " por ", " las ", " del ", " como "],
  DE: [" der ", " die ", " und ", " das ", " ist ", " mit ", " nicht ", " den ", " eine "],
  IT: [" che ", " non ", " per ", " una ", " gli ", " sono ", " del ", " come "],
  PT: [" que ", " não ", " uma ", " para ", " com ", " dos ", " como ", " mais "],
  NL: [" het ", " een ", " van ", " is ", " dat ", " niet ", " met ", " zijn "],
};

