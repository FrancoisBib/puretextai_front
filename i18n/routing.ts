import { defineRouting } from "next-intl/routing";

/**
 * FR is the default and stays prefix-free (puretext.ai/), EN gets an explicit
 * prefix (puretext.ai/en/...) — the "as-needed" convention, best for the SEO
 * of the already-existing French root. Adding a language later (ES/DE/IT/PT/
 * NL — already supported for text processing, see SUPPORTED_LANGS in the
 * backend) only means appending to `locales` plus a `messages/<code>/*.json`
 * set, no code change.
 */
export const routing = defineRouting({
  locales: ["fr", "en", "es", "de", "it", "pt", "nl"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // The URL alone must determine the language (SEO requirement: `/` is
  // always French, `/en` is always English) — without this, the middleware
  // would content-negotiate from the visitor's Accept-Language header and
  // serve different content at the same French URL depending on the visitor.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
