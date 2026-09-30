"use client";

import { useTranslations } from "next-intl";

/**
 * Mobile stand-in for the tone/intensity bar: one row showing the current
 * settings, which opens the full sheet (markup.html:476-482).
 */
export interface TuneRowProps {
  tuneSummary: string;
  openTuneSheet: () => void;
}

export function TuneRow({ tuneSummary, openTuneSheet }: TuneRowProps) {
  const t = useTranslations("studio.humanize");

  return (
    <div className="hidden border-b border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-3.5 py-[9px] max-mob:block">
      <button
        type="button"
        onClick={openTuneSheet}
        aria-haspopup="dialog"
        className="flex min-h-[46px] w-full cursor-pointer items-center gap-[9px] rounded-[11px] border border-[rgba(20,18,15,.12)] bg-white px-[13px] py-2.5 text-left font-sans shadow-[0_1px_2px_rgba(20,18,15,.05)]"
      >
        <span className="flex-none text-[11px] font-bold uppercase tracking-[.09em] text-[#8A857C]">
          {t("settings")}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[#14120F]">
          {tuneSummary}
        </span>
        <span aria-hidden className="flex-none text-[9px] text-[#8A857C]">
          ▾
        </span>
      </button>
    </div>
  );
}
