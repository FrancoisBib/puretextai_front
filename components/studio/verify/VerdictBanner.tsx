"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { VERDICT_LEVEL_KEYS, type ScaleTick } from "@/lib/store/selectors/verify";

export interface VerdictBannerProps {
  vdBg: string;
  vdBorder: string;
  vdScale: ScaleTick[];
  vdColor: string;
  vdLevelIndex: 0 | 1 | 2 | 3;
  vdScore: number | null;
  vdFindCount: number;
  vdRhythmCount: number;
  vdPhrasingCount: number;
  vdAction: () => void;
}

/**
 * Full-width verdict banner shown once an analysis has run: a mini
 * 4-bar bar-chart + level name, a divider, title/subtitle, a numeric
 * "indice N/100" (with an explanatory tooltip), and the primary action
 * button ("Passer à la correction" / "Humaniser ce texte").
 */
export function VerdictBanner({
  vdBg,
  vdBorder,
  vdScale,
  vdColor,
  vdLevelIndex,
  vdScore,
  vdFindCount,
  vdRhythmCount,
  vdPhrasingCount,
  vdAction,
}: VerdictBannerProps) {
  const t = useTranslations("studio.verify");
  const levelKey = VERDICT_LEVEL_KEYS[vdLevelIndex];

  const vdLevel = t(`verdict.level.${levelKey}`);
  const vdTitle = vdScore === null ? t("verdict.analyzing") : t(`verdict.title.${levelKey}`);
  const vdSub =
    (vdFindCount === 0 ? t("verdict.subNoFindings") : t("verdict.subFindingsCount", { count: vdFindCount })) +
    (vdRhythmCount ? t("verdict.subRhythm") : "") +
    (vdPhrasingCount ? t("verdict.subPhrasing", { count: vdPhrasingCount }) : "");
  const vdNum = vdScore === null ? t("verdict.numAnalyzing") : t("verdict.scoreLabel", { score: vdScore });
  const vdNumTitle = t("verdict.scoreTooltip");
  const vdActionLabel = vdLevelIndex === 0 ? t("verdict.actionCorrect") : t("verdict.actionHumanize");

  return (
    <section
      className="flex items-center gap-[17px] flex-wrap rounded-[16px] mb-[19px]"
      style={{ padding: "15px 19px", background: vdBg, border: `1px solid ${vdBorder}` }}
    >
      <div className="flex items-center gap-[11px] flex-none">
        <div className="flex gap-[3px] items-end" style={{ height: 26 }}>
          {vdScale.map((b, i) => (
            <span key={i} className="w-[7px] rounded-[2px]" style={{ height: b.h, background: b.bg }} />
          ))}
        </div>
        <span className="text-[16px] font-bold tracking-[-0.01em]" style={{ color: vdColor }}>
          {vdLevel}
        </span>
      </div>

      <div className="w-px self-stretch flex-none" style={{ background: vdBorder }} />

      <div className="flex-[1_1_300px] min-w-0">
        <p className="m-0 text-[14px] font-semibold" style={{ textWrap: "pretty" }}>
          {vdTitle}
        </p>
        <p className="mt-[2px] mb-0 text-[12.5px] text-[#55514A]" style={{ textWrap: "pretty" }}>
          {vdSub}
        </p>
      </div>

      <span title={vdNumTitle} className="text-[11.5px] text-[#8A857C] tabular-nums flex-none cursor-help">
        {vdNum}
      </span>

      <Button variant="accent" onClick={vdAction} className="flex-none px-[16px] py-[10px] text-[13px]">
        {vdActionLabel}
      </Button>
    </section>
  );
}
