"use client";

import { useTranslations } from "next-intl";
import { FlagSwatch } from "@/components/ui";

export interface TranslationBannerProps {
  show: boolean;
  flag: string;
  from: string;
  to: string;
  onRun: () => void;
  onDismiss: () => void;
}

/**
 * Blue-tinted "text detected in another language" strip, only rendered
 * when `transShow` is true. Ported from design.html lines 317-325.
 */
export function TranslationBanner({ show, flag, from, to, onRun, onDismiss }: TranslationBannerProps) {
  const t = useTranslations("studio.humanize");
  const tCommon = useTranslations("common");
  if (!show) return null;

  return (
    <div className="flex flex-wrap items-center gap-[11px] border-b border-[rgba(20,18,15,.07)] bg-[rgba(4,159,222,.06)] px-5 py-[10px]">
      <FlagSwatch gradient={flag} />
      <span className="text-[12.5px] text-[#14120F]">
        {t.rich("detectedBanner", { from, to, b: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
      </span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onRun}
        className="rounded-[8px] border-0 bg-[#049FDE] px-[13px] py-[7px] font-sans text-[12.5px] font-semibold text-white cursor-pointer hover:bg-[#0378A9]"
      >
        {t("translateAndHumanize")}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={tCommon("close")}
        className="rounded-none border-0 bg-transparent p-1 font-sans text-[12.5px] text-[#A8A29A] cursor-pointer hover:text-[#14120F]"
      >
        ✕
      </button>
    </div>
  );
}
