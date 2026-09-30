"use client";

import { useTranslations } from "next-intl";
import { AnchoredPopover } from "@/components/studio/shared/AnchoredPopover";
import type { VerifyView } from "@/lib/store/selectors/verify";

export interface FindingPopoverProps {
  view: VerifyView;
}

/**
 * Vérification's finding popover: what was flagged, why it reads as machine
 * writing, the source when there is one, and the two ways out — act on it, or
 * tell the app to stop signalling it.
 */
export function FindingPopover({ view }: FindingPopoverProps) {
  const t = useTranslations("studio.verify");
  if (!view.vPopOpen || !view.vPopKey) return null;

  const popSource = view.vPopSourceIdx !== null ? view.simSources[view.vPopSourceIdx] : undefined;
  const sourceTitle = popSource?.title;
  const sourceHost = popSource?.host;

  return (
    <AnchoredPopover
      left={view.vPopLeft}
      top={view.vPopTop}
      cat={t(`categories.${view.vPopKey}`)}
      color={view.vPopColor}
      tint={view.vPopTint}
      pos={view.vPopPos}
      onPrev={view.vPopPrev}
      onNext={view.vPopNext}
    >
      <p className="m-0 mb-1.5 text-[14px] font-semibold leading-[1.45] text-pretty">
        {t(`findingTitle.${view.vPopKey}`, view.vPopTitleParams)}
      </p>
      <p className="m-0 text-[12.5px] leading-[1.6] text-pretty text-[#55514A]">{t(`findingWhy.${view.vPopKey}`)}</p>
      {view.vPopHasSource && (
        <p className="mt-[9px] mb-0 text-[11.5px] text-[#8A857C]">
          {sourceTitle} · {sourceHost}
        </p>
      )}
      <div className="mt-[13px] flex flex-wrap gap-[7px]">
        <button
          type="button"
          onClick={(event) => view.vPopAct(event, sourceTitle)}
          className="cursor-pointer whitespace-nowrap rounded-[9px] border border-[#049FDE] bg-[#049FDE] px-[13px] py-2 font-sans text-[12.5px] font-semibold text-white hover:bg-[#0378A9]"
        >
          {t(`actLabel.${view.vPopKey}`)}
        </button>
        <button
          type="button"
          onClick={view.vPopDismiss}
          className="cursor-pointer whitespace-nowrap rounded-[9px] border border-[rgba(20,18,15,.12)] bg-transparent px-[13px] py-2 font-sans text-[12.5px] font-medium text-[#4A4741] hover:border-[rgba(20,18,15,.3)] hover:text-[#14120F]"
        >
          {t("dontFlag")}
        </button>
      </div>
    </AnchoredPopover>
  );
}
