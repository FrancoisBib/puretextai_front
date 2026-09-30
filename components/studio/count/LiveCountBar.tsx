"use client";

import { useTranslations } from "next-intl";

/**
 * Mobile-only readout pinned over the bottom edge while the Compteur's editor
 * is showing, with a shortcut to the full breakdown (markup.html:1016-1024).
 * Hidden at wider widths, where the sidebar is always visible.
 */
export interface LiveCountBarProps {
  words: string;
  wordsLabel: string;
  charsShort: string;
  readShort: string;
  onDetails: () => void;
  /** Only shown while the mobile column is on the editor. */
  visible: boolean;
}

export function LiveCountBar({
  words,
  wordsLabel,
  charsShort,
  readShort,
  onDetails,
  visible,
}: LiveCountBarProps) {
  const t = useTranslations("studio.count");

  if (!visible) return null;

  return (
    <div
      data-fixed-bar
      className="fixed inset-x-0 bottom-0 z-[42] hidden items-center gap-2.5 border-t border-[rgba(20,18,15,.09)] bg-white px-3.5 pt-[11px] pb-[calc(11px+env(safe-area-inset-bottom,0px))] max-mob:flex"
    >
      <span className="inline-flex items-baseline gap-[5px]">
        <span className="font-serif text-[25px] leading-none text-[#049FDE]">{words}</span>
        <span className="text-[12.5px] text-[#55514A]">{wordsLabel}</span>
      </span>
      <span className="whitespace-nowrap text-[12.5px] tabular-nums text-[#8A857C]">
        · {charsShort} {t("mobileBar.chars")} · {readShort}
      </span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onDetails}
        className="min-h-[42px] cursor-pointer whitespace-nowrap rounded-[10px] border border-[rgba(20,18,15,.14)] bg-transparent px-[13px] py-[9px] font-sans text-[13px] font-semibold text-[#14120F] hover:border-[#049FDE] hover:text-[#049FDE]"
      >
        {t("mobileBar.details")}
      </button>
    </div>
  );
}
