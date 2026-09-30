"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import type { ReadabilityLevelKey } from "@/lib/engines/readability/readability.data";

export interface ScoreBannerProps {
  rBg: string;
  rBorder: string;
  rScore: number;
  rColor: string;
  rLevelKey: ReadabilityLevelKey;
  rFindingsCount: number;
  rAsl: number;
  rGoCorrect: () => void;
}

/**
 * Score banner for the Lisibilité tab — structurally mirrors Vérification's
 * verdict banner (`vdBg`/`vdBorder`/.../`vdAction`), swapping the little
 * bar-chart level indicator for a plain `{score}/100` in Instrument Serif.
 */
export function ScoreBanner({ rBg, rBorder, rScore, rColor, rLevelKey, rFindingsCount, rAsl, rGoCorrect }: ScoreBannerProps) {
  const t = useTranslations("studio.readability");

  return (
    <section
      className="flex items-center gap-[17px] flex-wrap rounded-[16px] mb-[19px]"
      style={{ padding: "15px 19px", background: rBg, border: `1px solid ${rBorder}` }}
    >
      <div className="flex items-baseline gap-1 flex-none">
        <span className="font-serif leading-none" style={{ fontSize: 40, color: rColor }}>
          {rScore}
        </span>
        <span className="text-[13px] text-[#8A857C]">/100</span>
      </div>

      <div className="w-px self-stretch flex-none" style={{ background: rBorder }} />

      <div className="flex-1 basis-[300px] min-w-0">
        <p className="m-0 text-[14px] font-semibold text-pretty">{t(`levels.${rLevelKey}.name`)}</p>
        <p className="mt-[2px] mb-0 text-[12.5px] text-[#55514A] text-pretty">
          {rFindingsCount ? t("summary.some", { n: rFindingsCount, asl: rAsl.toFixed(0) }) : t("summary.none")}
        </p>
      </div>

      <span title={t("scoreTooltip")} className="text-[11.5px] text-[#8A857C] flex-none cursor-help">
        {t(`levels.${rLevelKey}.grade`)}
      </span>

      <Button variant="accent" onClick={rGoCorrect} className="flex-none">
        {t("goToCorrect")}
      </Button>
    </section>
  );
}
