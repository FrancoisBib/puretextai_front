"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Avatar, DropdownMenu, DropdownMenuItem, FlagSwatch, mobileSheetClasses } from "@/components/ui";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import type { LangMenuItem } from "@/lib/store/selectors/shell";

export interface AvatarMenuProps {
  signedIn: boolean;
  userEmail: string;
  userInitial: string;
  planFree: boolean;
  avatarOpen: boolean;
  avatarRing: string;
  toggleAvatar: () => void;
  closeAvatar: () => void;
  histBg: string;
  profBg: string;
  histCount: number;
  goHistory: () => void;
  goProfile: () => void;
  noop: () => void;
  logout: () => void;
  langs: LangMenuItem[];
}

/**
 * Account trigger + menu, in two states (markup.html:159-235).
 *
 * Signed out: a dashed placeholder avatar over a menu that explains nothing is
 * being saved and offers sign-in. Signed in: initial avatar over the email,
 * plan, Historique / Profil / Préférences and sign-out.
 *
 * Below 760px the header's language switcher is hidden and its list moves in
 * here, so the phone header keeps to one menu.
 */
export function AvatarMenu({
  signedIn,
  userEmail,
  userInitial,
  planFree,
  avatarOpen,
  avatarRing,
  toggleAvatar,
  closeAvatar,
  histBg,
  profBg,
  histCount,
  goHistory,
  goProfile,
  noop,
  logout,
  langs,
}: AvatarMenuProps) {
  const t = useTranslations("header");
  const close = useCallback(() => closeAvatar(), [closeAvatar]);
  const ref = useClickOutside<HTMLDivElement>(avatarOpen, close);
  const router = useRouter();
  const pathname = usePathname();

  const pickLang = (l: LangMenuItem) => () => {
    l.pick();
    if (l.siteLocale) router.push(pathname, { locale: l.siteLocale });
  };

  const languageSection = (
    <div className="mt-1.5 hidden flex-col gap-px border-t border-[rgba(20,18,15,.07)] pt-1.5 max-mob:flex">
      <div className="px-[9px] pt-[5px] pb-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#8A857C]">
        {t("correctionLanguage")}
      </div>
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={pickLang(l)}
          className="flex min-h-[44px] w-full cursor-pointer items-center gap-[9px] rounded-[9px] border-0 bg-transparent p-[9px] text-left font-sans text-[13.5px] text-[#14120F] hover:bg-[rgba(20,18,15,.05)]"
        >
          <FlagSwatch gradient={l.flag} />
          <span style={{ fontWeight: l.weight }} className="flex-1">
            {l.name}
          </span>
          <span className="w-[14px] text-[12px] text-[#049FDE]">{l.check}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div ref={ref} data-avatar-menu="1" className="relative flex-none">
      {signedIn ? (
        <button
          type="button"
          onClick={toggleAvatar}
          aria-label={t("account")}
          aria-expanded={avatarOpen}
          className="grid place-items-center rounded-full border-0 bg-[#14120F] p-0 font-sans text-[12px] font-semibold text-[#F6F5F2] cursor-pointer hover:shadow-[0_0_0_3px_rgba(4,159,222,.2)]"
          style={{ width: 31, height: 31, boxShadow: `0 0 0 ${avatarRing} rgba(4,159,222,.25)` }}
        >
          {userInitial}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleAvatar}
          aria-label={t("account")}
          aria-expanded={avatarOpen}
          className="grid h-[31px] w-[31px] place-items-center rounded-full border border-dashed border-[rgba(20,18,15,.28)] bg-white p-0 font-sans text-[13px] font-medium text-[#8A857C] cursor-pointer hover:border-[#14120F] hover:text-[#14120F]"
        >
          ◍
        </button>
      )}

      {signedIn ? (
        <DropdownMenu
          open={avatarOpen}
          align="right"
          width={228}
          className={mobileSheetClasses({ touchTargets: false })}
        >
          <div className="mb-[5px] flex items-center gap-2.5 border-b border-[rgba(20,18,15,.07)] px-[9px] pt-[9px] pb-[11px]">
            <Avatar initials={userInitial} size={33} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{userEmail}</span>
              <span className="block text-[11.5px] text-[#8A857C]">{t(planFree ? "planFree" : "planStudio")}</span>
            </span>
          </div>

          <div className="flex flex-col gap-px">
            <DropdownMenuItem
              onClick={goHistory}
              style={{ background: histBg }}
              icon={<span className="w-[15px] text-center text-[12px] text-[#8A857C]">◷</span>}
              label={t("history")}
              trailing={<span className="text-[11.5px] tabular-nums text-[#A8A29A]">{histCount}</span>}
            />
            <DropdownMenuItem
              onClick={goProfile}
              style={{ background: profBg }}
              icon={<span className="w-[15px] text-center text-[12px] text-[#8A857C]">◍</span>}
              label={t("profile")}
            />
            <DropdownMenuItem
              onClick={noop}
              icon={<span className="w-[15px] text-center text-[12px] text-[#8A857C]">⚙</span>}
              label={t("preferences")}
            />
          </div>

          <div className="mt-[5px] border-t border-[rgba(20,18,15,.07)] pt-[5px]">
            <DropdownMenuItem
              onClick={logout}
              className="text-[#8A857C] hover:text-[#14120F]"
              icon={<span className="w-[15px] text-center text-[12px]">→</span>}
              label={t("signOut")}
            />
          </div>

          {languageSection}
        </DropdownMenu>
      ) : (
        <DropdownMenu
          open={avatarOpen}
          align="right"
          width={244}
          className={mobileSheetClasses({ touchTargets: false })}
        >
          <div className="mb-2 flex items-center gap-2.5 border-b border-[rgba(20,18,15,.07)] px-[9px] pt-2.5 pb-3">
            <span className="grid h-[33px] w-[33px] flex-none place-items-center rounded-full border border-dashed border-[rgba(20,18,15,.28)] text-[13px] text-[#8A857C]">
              ◍
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{t("noAccount")}</span>
              <span className="block text-[11.5px] text-pretty text-[#8A857C]">{t("noAccountHint")}</span>
            </span>
          </div>
          <div className="px-[3px] pb-1">
            <Link
              href="/connexion"
              className="block w-full rounded-[10px] border border-[#049FDE] bg-[#049FDE] px-3.5 py-2.5 text-center font-sans text-[13px] font-semibold text-white hover:bg-[#0378A9] hover:text-white"
            >
              {t("signIn")}
            </Link>
            <p className="mx-0.5 mt-[9px] mb-[3px] text-[11.5px] leading-[1.5] text-pretty text-[#8A857C]">
              {t("freeAccountHint")}
            </p>
          </div>

          {languageSection}
        </DropdownMenu>
      )}
    </div>
  );
}
