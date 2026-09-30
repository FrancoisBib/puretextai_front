"use client";

import { useTranslations } from "next-intl";
import type { LegendItem } from "@/lib/store/selectors/verify";

export interface VerifyLegendProps {
  vLegend: LegendItem[];
  vFindCount: number;
}

/**
 * Bottom legend row of the text panel's marked-text mode: rythme /
 * connecteur / tournure / source swatches, each with its finding count.
 * The leading label switches from "Légende" to "Cliquez un passage" once
 * there are findings to review.
 */
export function VerifyLegend({ vLegend, vFindCount }: VerifyLegendProps) {
  const t = useTranslations("studio.verify");

  return (
    <div className="flex items-center gap-[13px] flex-wrap px-5 py-[11px] border-t border-[rgba(20,18,15,.07)] bg-[#FBFAF8]">
      <span className="text-[11px] font-bold tracking-[.09em] uppercase text-[#8A857C]">
        {t(vFindCount ? "legendLabel.hasFindings" : "legendLabel.none")}
      </span>
      {vLegend.map((lg) => (
        <span key={lg.key} className="inline-flex items-center gap-[7px] text-[12px] text-[#4A4741]">
          <span
            className="w-[15px] h-2 rounded-[3px]"
            style={{ background: lg.swatch, borderBottom: `2px solid ${lg.line}` }}
          />
          {t(`legend.${lg.key}`)}
          <span className="tabular-nums text-[#A8A29A]">{lg.count}</span>
        </span>
      ))}
    </div>
  );
}
