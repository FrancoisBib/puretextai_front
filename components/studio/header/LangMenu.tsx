"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { useRouter, usePathname } from "@/i18n/navigation";
import { DropdownMenu, DropdownMenuItem, FlagSwatch } from "@/components/ui";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import type { LangCode } from "@/lib/engines/language/languages.data";
import type { LangMenuItem } from "@/lib/store/selectors/shell";

export interface LangMenuProps {
  langOpen: boolean;
  langFlag: string;
  langCode: LangCode;
  toggleLang: () => void;
  langs: LangMenuItem[];
}

/**
 * Language switcher: trigger button (flag swatch + 2-letter code + ▾
 * caret) and a dropdown of every language (flag / name / code /
 * checkmark). Ported from the source's `data-lang-menu="1"` block.
 */
export function LangMenu({ langOpen, langFlag, langCode, toggleLang, langs }: LangMenuProps) {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const close = useCallback(() => toggleLang(), [toggleLang]);
  const ref = useClickOutside<HTMLDivElement>(langOpen, close);

  const pick = (l: LangMenuItem) => () => {
    l.pick();
    if (l.siteLocale) router.push(pathname, { locale: l.siteLocale });
  };

  return (
    <div ref={ref} data-lang-menu="1" className="relative flex-none max-mob:hidden">
      <button
        type="button"
        onClick={toggleLang}
        className="inline-flex items-center gap-2 rounded-[9px] border border-[rgba(20,18,15,.1)] bg-white px-[10px] py-[7px] pl-[9px] font-sans text-[13px] font-medium text-[#14120F] shadow-[0_1px_2px_rgba(20,18,15,.06)] cursor-pointer hover:border-[#049FDE]"
      >
        <FlagSwatch gradient={langFlag} />
        <span className="font-semibold tracking-[.02em]">{langCode}</span>
        <span className="text-[9px] leading-none text-[#8A857C]">▾</span>
      </button>

      <DropdownMenu open={langOpen} align="right" width={209}>
        <div className="px-[9px] pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#8A857C]">
          {t("correctionLanguage")}
        </div>
        <div className="flex flex-col gap-px">
          {langs.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={pick(l)}
              icon={<FlagSwatch gradient={l.flag} />}
              label={<span style={{ fontWeight: l.weight }}>{l.name}</span>}
              trailing={
                <>
                  <span className="text-[10.5px] font-semibold tracking-[.04em] text-[#8A857C]">{l.code}</span>
                  <span className="inline-block w-[14px] text-[11.5px] text-[#049FDE]">{l.check}</span>
                </>
              }
            />
          ))}
        </div>
      </DropdownMenu>
    </div>
  );
}
