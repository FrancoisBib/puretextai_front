"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { DEFAULT_STUDIO_CONFIG, type BrowserOverride } from "@/lib/store/types";
import { browserStoreLink, type BrowserStoreLink } from "@/lib/utils/browser";

const noopSubscribe = () => () => {};

// `useSyncExternalStore` needs a stable snapshot: the navigator never changes
// during a session, so compute the link once per override value.
const cache = new Map<BrowserOverride, BrowserStoreLink | null>();
function clientLink(override: BrowserOverride): BrowserStoreLink | null {
  if (!cache.has(override)) cache.set(override, browserStoreLink(navigator, override));
  return cache.get(override) ?? null;
}

/**
 * "Ajouter à [navigateur]" (PureText AI.dc.html lines 158-164): links to the
 * Chrome Web Store for Chromium browsers and Firefox Add-ons for Firefox;
 * renders nothing on Safari, mobile or anything else. The server snapshot is
 * `null`, so the button only appears after hydration — no SSR mismatch.
 */
export function ExtensionStoreButton() {
  const t = useTranslations("header");
  const override = DEFAULT_STUDIO_CONFIG.browser;
  const link = useSyncExternalStore(noopSubscribe, () => clientLink(override), () => null);

  if (!link) return null;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener"
      className="inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-[9px] border border-[rgba(20,18,15,.1)] bg-white py-[7px] pl-[10px] pr-[13px] font-sans text-[13px] font-medium text-[#14120F] no-underline shadow-[0_1px_2px_rgba(20,18,15,.06)] hover:border-[#049FDE] hover:text-[#049FDE] max-mob:hidden"
    >
      <Image src={link.logo} alt="" width={17} height={17} className="block" />
      <span>{t("addToBrowser", { browser: link.name })}</span>
    </a>
  );
}
