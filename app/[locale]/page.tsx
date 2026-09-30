import { setRequestLocale } from "next-intl/server";
import { StudioShell } from "@/components/studio/StudioShell";

// The Studio app is now the indexable homepage (was `/studio`, `noindex`,
// with a redirect page separate from the app itself). See CLAUDE.md.
export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StudioShell />;
}
