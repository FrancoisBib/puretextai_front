import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PricingScreen } from "@/components/pricing/PricingScreen";

// Public, indexable: this is the one marketing page the app currently has.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: "/tarifs",
      languages: {
        fr: "/tarifs",
        en: "/en/tarifs",
        es: "/es/tarifs",
        de: "/de/tarifs",
        it: "/it/tarifs",
        pt: "/pt/tarifs",
        nl: "/nl/tarifs",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/tarifs",
    },
  };
}

export default async function TarifsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingScreen />;
}
