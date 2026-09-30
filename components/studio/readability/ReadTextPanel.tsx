"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnalysisSkeleton, Button, Card, ProgressButton, Textarea } from "@/components/ui";
import type { ReadabilityRunVM } from "@/lib/store/selectors/readability";
import type { ReadabilityLegendItem } from "@/lib/engines/readability/readability.engine";
import { STABLE_INDEX_WORDS } from "@/lib/engines/readability/readability.data";

export interface ReadTextPanelProps {
  rWords: number;
  rSentences: number;
  rEditing: boolean;
  rMarked: boolean;
  rEdit: () => void;

  rText: string;
  setRText: (value: string) => void;
  rClear: () => void;
  rRun: () => void;
  rBusy: boolean;

  rRuns: ReadabilityRunVM[];
  rLegend: ReadabilityLegendItem[];
}

/**
 * "Votre texte" main panel — editor, measuring, or marked text, mirroring
 * Vérification's text panel structurally. Clicking a flagged sentence opens
 * the finding popover, which `ReadabilityTab` renders against the viewport.
 */
export function ReadTextPanel({
  rWords,
  rSentences,
  rEditing,
  rMarked,
  rEdit,
  rText,
  setRText,
  rClear,
  rRun,
  rBusy,
  rRuns,
  rLegend,
}: ReadTextPanelProps) {
  const t = useTranslations("studio.readability");

  const hint =
    rWords === 0
      ? null
      : rWords < STABLE_INDEX_WORDS
        ? t("hint.unstable", { n: STABLE_INDEX_WORDS - rWords })
        : t("hint.stable");
  const hintColor = rWords < STABLE_INDEX_WORDS ? "#B4780F" : "#1F8A54";

  return (
    <Card elevated data-editor-card className="min-w-0 overflow-hidden">
      <div className="flex items-center gap-[11px] flex-wrap px-5 py-[13px] border-b border-[rgba(20,18,15,.07)]">
        <span className="text-[13.5px] font-semibold whitespace-nowrap">{t("yourText")}</span>
        <span className="text-[12px] text-[#8A857C] tabular-nums">
          {t("wordsAndSentences", { words: rWords, sentences: rSentences })}
        </span>
        <span className="flex-1" />
        {rEditing && hint && (
          <span className="text-[12px]" style={{ color: hintColor }}>
            {hint}
          </span>
        )}
        {rMarked && (
          <Button variant="outline" size="sm" hoverAccent onClick={rEdit} className="whitespace-nowrap">
            {t("editText")}
          </Button>
        )}
      </div>

      {rEditing && (
        <div>
          <Textarea
            data-grow="1"
            value={rText}
            onChange={(e) => setRText(e.target.value)}
            placeholder={t("placeholder")}
            className="block w-full resize-y overflow-hidden px-6 py-[21px] text-[15px] leading-[1.85]"
            style={{ minHeight: "max(314px, calc(100dvh - 360px))" }}
          />
          <div className="flex items-center gap-[10px] flex-wrap px-5 py-3 border-t border-[rgba(20,18,15,.07)] bg-[#FBFAF8]">
            <Button variant="outline" onClick={rClear}>
              {t("clear")}
            </Button>
            <span className="flex-1" />
            <ProgressButton busy={rBusy} onClick={rRun} className="px-[17px] py-[10px] text-[13px]">
              {rBusy ? t("measuring") : t("measureCta")}
            </ProgressButton>
          </div>
        </div>
      )}

      {rBusy && (
        <>
          <AnalysisSkeleton
            label={t("measuringSkeleton")}
            groups={[
              ["94%", "87%", "91%", "58%"],
              ["90%", "52%"],
            ]}
            className="px-6 pt-6 pb-[30px]"
          />
          <div className="flex flex-wrap items-center gap-[10px] border-t border-[rgba(20,18,15,.07)] bg-[#FBFAF8] px-5 py-3">
            <span className="flex-1" />
            <ProgressButton busy disabled className="px-[17px] py-[10px] text-[13px]">
              {t("measuring")}
            </ProgressButton>
          </div>
        </>
      )}

      {rMarked && (
        <div>
          <div className="text-[15px] leading-[2.05] break-words whitespace-pre-wrap" style={{ padding: "22px 24px 26px" }}>
            {rRuns.map((r, i) => (
              <span
                key={i}
                data-r-run="1"
                onClick={r.click}
                className="relative"
                style={{
                  borderRadius: 3,
                  padding: r.pad,
                  background: r.bg,
                  boxShadow: r.ring,
                  cursor: r.cursor,
                  textDecorationLine: r.deco,
                  textDecorationColor: r.decoColor,
                  textDecorationStyle: "dotted",
                  textDecorationThickness: 2,
                  textUnderlineOffset: 5,
                  textDecorationSkipInk: "none",
                }}
              >
                {r.text}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-[13px] flex-wrap px-5 py-[11px] border-t border-[rgba(20,18,15,.07)] bg-[#FBFAF8]">
            <span className="text-[11px] font-bold tracking-[.09em] uppercase text-[#8A857C]">
              {t(rLegend.length ? "legendLabel.toLighten" : "legendLabel.nothingToReport")}
            </span>
            {rLegend.map((lg) => (
              <span key={lg.key} className="inline-flex items-center gap-[7px] text-[12px] text-[#4A4741]">
                <span
                  className="inline-block"
                  style={{ width: 15, height: 8, borderRadius: 3, background: lg.swatch, borderBottom: `2px solid ${lg.line}` }}
                />
                {t(`categories.${lg.key}`)}
                <span className="tabular-nums text-[#A8A29A]">{lg.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
