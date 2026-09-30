import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { OverlayScrollbars } from "@/components/system/OverlayScrollbars";
import { SessionBootstrap } from "@/components/system/SessionBootstrap";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretext.ai";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "PureText AI",
      template: "%s · PureText AI",
    },
    description: t("siteDescription"),
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: {
        fr: "/",
        en: "/en",
        es: "/es",
        de: "/de",
        it: "/it",
        pt: "/pt",
        nl: "/nl",
      },
    },
    openGraph: {
      type: "website",
      locale:
        locale === "fr"
          ? "fr_FR"
          : locale === "es"
            ? "es_ES"
            : locale === "de"
              ? "de_DE"
              : locale === "it"
                ? "it_IT"
                : locale === "pt"
                  ? "pt_PT"
                  : locale === "nl"
                    ? "nl_NL"
                    : "en_US",
      siteName: "PureText AI",
      title: "PureText AI",
      description: t("siteDescriptionShort"),
    },
    twitter: {
      card: "summary_large_image",
      title: "PureText AI",
      description: t("siteDescriptionShort"),
    },
  };
}

// `viewportFit: "cover"` is required: the mobile layout pins action bars to the
// bottom edge and pads them with env(safe-area-inset-bottom).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
          <OverlayScrollbars />
          <SessionBootstrap />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
