import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthScreen } from "@/components/auth/AuthScreen";

// The design drops the app chrome on this screen (`chrome: false` in the
// source), and an auth form has nothing to index.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: t("page.metaTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ConnexionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="flex min-h-screen items-center justify-center bg-pt-bg text-pt-ink">
      <AuthScreen />
    </main>
  );
}
