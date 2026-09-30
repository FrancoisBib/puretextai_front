"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectShellView } from "@/lib/store/selectors/shell";
import { FLAGS, LOCALE_TO_LANG, SITE_LOCALES } from "@/lib/engines/language/languages.data";

import { NavTabs } from "./NavTabs";
import { LangMenu } from "./LangMenu";
import { AvatarMenu } from "./AvatarMenu";
import { ModuleSelector } from "./ModuleSelector";
import { ExtensionStoreButton } from "./ExtensionStoreButton";

/**
 * The sticky top app shell: logo/wordmark, 5-tab nav, plan badge, language
 * switcher, "Ajouter à [navigateur]" link and the account menu. Colours,
 * spacing and radii are the design's.
 *
 * Below 760px the wordmark, the tab nav and the extension link drop out and
 * a module-picker button takes their place; the language switcher moves into
 * the account menu.
 *
 * The header also renders on /tarifs, where the Studio is not mounted: there a
 * module button has to switch the store tab *and* navigate back to /studio,
 * and no tab is shown as current.
 */
export function AppHeader() {
  const v = useStudioStore(selectShellView);
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const inStudio = pathname === "/";

  // `v.langCode` (from the Zustand store) starts hardcoded at "FR" and isn't
  // persisted, so on a fresh load of `/en/...` it doesn't yet know the site
  // is English. `useLocale()` does know — it's resolved from the URL both
  // server- and client-side, so it's correct from the very first paint, no
  // effect needed. Pure display override: no store write, so no ordering
  // hazard with SSR/streaming. Correction-only languages (ES/DE/IT/PT/NL,
  // no `siteLocale`) are never overridden — they stay a session choice.
  const locale = useLocale() as AppLocale;
  const langLocaleMismatch = SITE_LOCALES[v.langCode] !== undefined && SITE_LOCALES[v.langCode] !== locale;
  const displayLangCode = langLocaleMismatch ? LOCALE_TO_LANG[locale] : v.langCode;
  const displayLangFlag = langLocaleMismatch ? FLAGS[displayLangCode] : v.langFlag;
  const displayLangs = langLocaleMismatch
    ? v.langs.map((l) => ({
        ...l,
        weight: (l.code === displayLangCode ? 600 : 500) as 600 | 500,
        check: (l.code === displayLangCode ? "✓" : "") as "✓" | "",
      }))
    : v.langs;

  const go = useCallback(
    (action: () => void) => () => {
      action();
      if (!inStudio) router.push("/");
    },
    [inStudio, router],
  );

  return (
    <header
      className="sticky top-0 z-30 flex min-h-[62px] flex-wrap items-center gap-x-3.5 gap-y-2.5 border-b border-[rgba(20,18,15,.08)] bg-[rgba(246,245,242,.92)] px-6 py-[11px] backdrop-blur-[10px] max-tab:px-[18px] max-tab:py-2.5 max-mob:min-h-[54px] max-mob:gap-2 max-mob:bg-[#F6F5F2] max-mob:px-[13px] max-mob:py-[9px] max-mob:backdrop-blur-none"
    >
      <div className="flex flex-none items-center gap-[9px]">
        <Image src="/logo-puretext.png" alt="PureText AI" width={28} height={28} className="block flex-none" />
        <span
          style={{ fontWeight: 600, fontSize: 23, letterSpacing: "-0.02em" }}
          className="max-mob:hidden"
        >
          PureText<span className="text-[#049FDE]"> AI</span>
        </span>
      </div>

      <ModuleSelector
        moduleLabel={inStudio ? t(v.moduleTabKey) : t("pricing")}
        openModSheet={inStudio ? v.openModSheet : () => router.push("/")}
      />

      <NavTabs
        isCorrect={inStudio && v.isCorrect}
        isHuman={inStudio && v.isHuman}
        isVerify={inStudio && v.isVerify}
        isRead={inStudio && v.isRead}
        isCount={inStudio && v.isCount}
        goCorrect={go(v.goCorrect)}
        goHuman={go(v.goHuman)}
        goVerify={go(v.goVerify)}
        goRead={go(v.goRead)}
        goCount={go(v.goCount)}
      />

      <div className="flex-1" />

      {v.planFree ? (
        <Link
          href="/tarifs"
          className="flex-none whitespace-nowrap rounded-[9px] border border-[#049FDE] bg-[#049FDE] px-[13px] py-[7px] font-sans text-[12.5px] font-semibold text-white shadow-[0_2px_8px_rgba(4,159,222,.25)] hover:bg-[#0378A9] hover:text-white"
        >
          {tHeader("upgradeCta")}
        </Link>
      ) : (
        <Link
          href="/tarifs"
          className="flex-none rounded-full border border-[rgba(4,159,222,.3)] bg-[rgba(4,159,222,.1)] px-2.5 py-[5px] font-sans text-[11px] font-semibold uppercase tracking-[.08em] text-[#049FDE] hover:border-[#049FDE]"
        >
          {tHeader("studioBadge")}
        </Link>
      )}

      <LangMenu
        langOpen={v.langOpen}
        langFlag={displayLangFlag}
        langCode={displayLangCode}
        toggleLang={v.toggleLang}
        langs={displayLangs}
      />

      <ExtensionStoreButton />

      <AvatarMenu
        signedIn={v.signedIn}
        userEmail={v.userEmail}
        userInitial={v.userInitial}
        planFree={v.planFree}
        avatarOpen={v.avatarOpen}
        avatarRing={v.avatarRing}
        toggleAvatar={v.toggleAvatar}
        closeAvatar={v.closeAvatar}
        histBg={v.histBg}
        profBg={v.profBg}
        histCount={v.histCount}
        goHistory={go(v.goHistory)}
        goProfile={go(v.goProfile)}
        noop={v.noop}
        logout={v.logout}
        langs={displayLangs}
      />
    </header>
  );
}
