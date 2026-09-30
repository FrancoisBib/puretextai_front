"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button, Card, Textarea } from "@/components/ui";
import type { LegendItem, VerifyRunVM } from "@/lib/store/selectors/verify";

import { VerifyLegend } from "./VerifyLegend";

export interface VerifyTextPanelProps {
  vWords: number;
  vSentences: number;
  vShowEditor: boolean;
  vShowMarked: boolean;
  vHintWordsToGo: number;
  vHintColor: string;
  vEdit: () => void;
  vText: string;
  setVText: (value: string) => void;
  vClear: () => void;
  vRun: () => void;
  vRuns: VerifyRunVM[];
  vFindCount: number;
  vLegend: LegendItem[];
  /** Free-plan word budget for this tool, and the over-cap upsell. */
  vWordsUsed: number | null;
  vWordsCap: number | null;
  vBudgetColor: string;
  vOver: boolean;
}

/**
 * The main "Votre texte" panel. Header shows word/sentence counts plus
 * either the length hint (editor mode) or a "Modifier le texte" button
 * (marked mode). Editor mode is a plain `Textarea` + Effacer/Vérifier
 * footer; marked mode renders `vRuns` as inline spans (dotted underline
 * for sentence-level findings, tinted background for phrase-level ones),
 * followed by the `VerifyLegend` footer strip. The finding popover is a
 * viewport-anchored sibling, rendered by `VerifyTab`.
 */
export function VerifyTextPanel({
  vWords,
  vSentences,
  vShowEditor,
  vShowMarked,
  vHintWordsToGo,
  vHintColor,
  vEdit,
  vText,
  setVText,
  vClear,
  vRun,
  vRuns,
  vFindCount,
  vLegend,
  vWordsUsed,
  vWordsCap,
  vBudgetColor,
  vOver,
}: VerifyTextPanelProps) {
  const t = useTranslations("studio.verify");
  const tCommon = useTranslations("common");
  const vHint = vWords === 0 ? "" : vHintWordsToGo > 0 ? t("hint.moreWords", { n: vHintWordsToGo }) : t("hint.enough");
  const vBudget = vWordsCap != null ? tCommon("wordsUsed", { used: vWordsUsed ?? 0, cap: vWordsCap }) : "";

  return (
    <Card elevated data-editor-card className="overflow-hidden min-w-0">
      <div
        className="flex items-center gap-[11px] flex-wrap"
        style={{ padding: "13px 20px", borderBottom: "1px solid rgba(20,18,15,.07)" }}
      >
        <span className="text-[13.5px] font-semibold whitespace-nowrap">{t("yourText")}</span>
        <span className="text-[12px] text-[#8A857C] tabular-nums">
          {t("wordsSentences", { words: vWords, sentences: vSentences })}
        </span>
        <span className="flex-1" />
        {vShowEditor && (
          <>
            <span className="text-[12px]" style={{ color: vHintColor }}>
              {vHint}
            </span>
            {vBudget && (
              <span className="text-[12px] tabular-nums" style={{ color: vBudgetColor }}>
                {vBudget}
              </span>
            )}
          </>
        )}
        {vShowMarked && (
          <Button variant="outline" hoverAccent onClick={vEdit} className="px-[11px] py-[6px] text-[12.5px]">
            {t("editText")}
          </Button>
        )}
      </div>

      {vShowEditor && (
        <div>
          <Textarea
            data-grow="1"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
            placeholder={t("placeholder")}
            className="block w-full resize-y overflow-hidden px-6 py-[21px] text-[15px] leading-[1.85]"
            style={{ minHeight: "max(314px, calc(100dvh - 360px))" }}
          />
          <div
            className="flex items-center gap-[10px] flex-wrap px-5 py-3 bg-[#FBFAF8]"
            style={{ borderTop: "1px solid rgba(20,18,15,.07)" }}
          >
            <Button variant="outline" onClick={vClear} className="px-[14px] py-[9px] text-[13px]">
              {t("clear")}
            </Button>
            <span className="flex-1" />
            {vOver ? (
              <>
                <span className="text-[12.5px] text-pretty text-[#B4780F]">{t("overCap")}</span>
                <Link
                  href="/tarifs"
                  className="rounded-[10px] border border-[#14120F] bg-[#14120F] px-[17px] py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-black hover:text-white"
                >
                  {t("viewPricing")}
                </Link>
              </>
            ) : (
              <Button variant="accent" onClick={vRun} className="px-[17px] py-[10px] text-[13px]">
                {t("run")}
              </Button>
            )}
          </div>
        </div>
      )}

      {vShowMarked && (
        <div>
          <div className="px-6 pt-[22px] pb-[26px] text-[15px] leading-[2.05] whitespace-pre-wrap [overflow-wrap:break-word]">
            {vRuns.map((r, i) => (
              <span
                key={i}
                data-v-run={r.anchor}
                onClick={r.click}
                className="relative rounded-[3px]"
                style={{
                  padding: r.pad,
                  background: r.bg,
                  color: r.color,
                  fontWeight: r.weight,
                  cursor: r.cursor,
                  textDecorationLine: r.deco,
                  textDecorationColor: r.decoColor,
                  textDecorationStyle: "dotted",
                  textDecorationThickness: "2px",
                  textUnderlineOffset: "5px",
                  textDecorationSkipInk: "none",
                }}
              >
                {r.text}
              </span>
            ))}
          </div>
          <VerifyLegend vFindCount={vFindCount} vLegend={vLegend} />
        </div>
      )}
    </Card>
  );
}
