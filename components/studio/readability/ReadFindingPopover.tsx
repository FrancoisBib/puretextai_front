"use client";

import { useTranslations } from "next-intl";
import { AnchoredPopover } from "@/components/studio/shared/AnchoredPopover";
import type { ReadabilityView } from "@/lib/store/selectors/readability";

export interface ReadFindingPopoverProps {
  view: ReadabilityView;
}

/**
 * Lisibilité's finding popover: why the sentence costs the reader, and a
 * shortcut into Correction with this text loaded (markup.html:820-834).
 */
export function ReadFindingPopover({ view }: ReadFindingPopoverProps) {
  const t = useTranslations("studio.readability");

  if (!view.rPopOpen || !view.rPopKey) return null;

  return (
    <AnchoredPopover
      left={view.rPopLeft}
      top={view.rPopTop}
      cat={t(`categories.${view.rPopKey}`)}
      color={view.rPopColor}
      tint={view.rPopTint}
      pos={view.rPopPos}
      onPrev={view.rPopPrev}
      onNext={view.rPopNext}
    >
      <p className="m-0 mb-[13px] text-[12.5px] leading-[1.6] text-pretty text-[#55514A]">
        {t(`findingWhy.${view.rPopKey}`, view.rPopWhyParams)}
      </p>
      <button
        type="button"
        onClick={view.rPopAct}
        className="cursor-pointer whitespace-nowrap rounded-[9px] border border-[#049FDE] bg-[#049FDE] px-[13px] py-2 font-sans text-[12.5px] font-semibold text-white hover:bg-[#0378A9]"
      >
        {t("correctThisSentence")}
      </button>
    </AnchoredPopover>
  );
}
