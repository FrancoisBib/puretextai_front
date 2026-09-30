"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui";
import type { SegmentedControlOption } from "@/components/ui";

export type HumanizeViewName = "source" | "result" | "diff";

export interface DocumentToolbarProps {
  /** "412 / 300 mots" on the free plan; empty on Studio. */
  budget: string;
  budgetColor: string;
  isSourceView: boolean;
  isResultView: boolean;
  isDiffView: boolean;
  viewSource: () => void;
  viewResult: () => void;
  viewDiff: () => void;
}

/**
 * "Votre texte" header strip: label + the free-plan word budget, then the
 * Source / Résultat / Différences 3-way segmented control.
 */
export function DocumentToolbar({
  budget,
  budgetColor,
  isSourceView,
  isResultView,
  isDiffView,
  viewSource,
  viewResult,
  viewDiff,
}: DocumentToolbarProps) {
  const t = useTranslations("studio.humanize");
  const value: HumanizeViewName = isSourceView ? "source" : isResultView ? "result" : isDiffView ? "diff" : "source";

  const options: SegmentedControlOption<HumanizeViewName>[] = [
    { label: t("view.source"), value: "source" },
    { label: t("view.result"), value: "result" },
    { label: t("view.diff"), value: "diff" },
  ];

  const onChange = (next: HumanizeViewName) => {
    if (next === "source") viewSource();
    else if (next === "result") viewResult();
    else viewDiff();
  };

  return (
    <div className="flex flex-wrap items-center gap-[11px] px-[18px] py-3 border-b border-[rgba(20,18,15,.07)] rounded-t-[16px]">
      <span className="text-[13.5px] font-semibold">{t("yourText")}</span>
      {budget && (
        <span style={{ color: budgetColor }} className="text-xs tabular-nums">
          {budget}
        </span>
      )}
      <span className="flex-1" />
      <SegmentedControl options={options} value={value} onChange={onChange} aria-label={t("viewLabel")} />
    </div>
  );
}
