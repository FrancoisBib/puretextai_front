import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Each namespace is its own small JSON file under `messages/<locale>/` rather
 * than one giant catalog — keeps unrelated areas (Correction vs Pricing vs
 * the header) independently editable without touching a shared file.
 */
async function loadMessages(locale: string) {
  const [
    common,
    nav,
    header,
    overlays,
    auth,
    pricing,
    correction,
    humanize,
    verify,
    readability,
    count,
    profile,
    history,
  ] = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/nav.json`),
    import(`../messages/${locale}/header.json`),
    import(`../messages/${locale}/overlays.json`),
    import(`../messages/${locale}/auth.json`),
    import(`../messages/${locale}/pricing.json`),
    import(`../messages/${locale}/correction.json`),
    import(`../messages/${locale}/humanize.json`),
    import(`../messages/${locale}/verify.json`),
    import(`../messages/${locale}/readability.json`),
    import(`../messages/${locale}/count.json`),
    import(`../messages/${locale}/profile.json`),
    import(`../messages/${locale}/history.json`),
  ]);

  return {
    common: common.default,
    nav: nav.default,
    header: header.default,
    overlays: overlays.default,
    auth: auth.default,
    pricing: pricing.default,
    profile: profile.default,
    history: history.default,
    studio: {
      correction: correction.default,
      humanize: humanize.default,
      verify: verify.default,
      readability: readability.default,
      count: count.default,
    },
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
