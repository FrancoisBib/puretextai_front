import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretext.ai";

/** `/` (fr) and `/en` are the Studio app itself, now indexable — it was
 * `noindex` under the old `/studio` route. `/connexion` stays excluded (see
 * `robots.ts`). */
const PATHS: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 },
  { path: "/tarifs", priority: 0.8 },
];

function localizedUrl(locale: string, path: string): string {
  return locale === routing.defaultLocale ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.map(({ path, priority }) => ({
    url: localizedUrl(routing.defaultLocale, path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((locale) => [locale, localizedUrl(locale, path)])),
    },
  }));
}
