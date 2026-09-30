"use client";

import { useTranslations } from "next-intl";
import { Card, ProgressBar, QueueNav } from "@/components/ui";

export interface RewriteSidebarProps {
  kept: number;
  rwListLength: number;
  /** e.g. "40%" — already formatted with a trailing "%" by the selector. */
  keptPct: string;
  /** Shows the "Et maintenant ?" follow-up once a humanised result exists. */
  canVerify: boolean;
  onVerify: () => void;
  hasResult: boolean;
  hasActiveRw: boolean;
  noActiveRw: boolean;
  rwPos: number;
  rwTotal: number;
  rwTag: string;
  rwBefore: string | null;
  rwAfter: string;
  rwWhy: string;
  rwReverted: boolean;
  rwActionBg: string;
  rwActionBorder: string;
  rwActionColor: string;
  rwToggle: () => void;
  rwLocate: () => void;
  rwPrev: () => void;
  rwNext: () => void;
}

/**
 * "Réécritures" sidebar card: kept-% progress, the "Et maintenant ?" hand-off
 * to Vérification, then either the active-rewrite queue panel or an empty
 * note. Ported from PureText AI.dc.html lines 564-610.
 */
export function RewriteSidebar({
  kept,
  rwListLength,
  keptPct,
  canVerify,
  onVerify,
  hasResult,
  hasActiveRw,
  noActiveRw,
  rwPos,
  rwTotal,
  rwTag,
  rwBefore,
  rwAfter,
  rwWhy,
  rwReverted,
  rwActionBg,
  rwActionBorder,
  rwActionColor,
  rwToggle,
  rwLocate,
  rwPrev,
  rwNext,
}: RewriteSidebarProps) {
  const t = useTranslations("studio.humanize");
  const keptPercent = parseFloat(keptPct) || 0;
  const keptLabel = rwListLength ? t("kept", { kept, total: rwListLength }) : t("keptNone");

  return (
    <Card className="overflow-hidden">
      <div className="px-[18px] pb-[14px] pt-4">
        <div className="mb-[9px] flex items-baseline justify-between">
          <span className="text-[13.5px] font-semibold">{t("sidebarTitle")}</span>
          <span className="text-xs text-[#8A857C] tabular-nums">{keptLabel}</span>
        </div>
        <ProgressBar percent={keptPercent} />
        {canVerify && (
          <div className="mt-[14px] flex flex-wrap items-center gap-3 rounded-[12px] border border-[rgba(4,159,222,.18)] bg-[#EEF7FC] px-[14px] py-[13px]">
            <div className="flex min-w-[150px] flex-1 flex-col gap-[2px]">
              <span className="text-[13px] font-bold text-[#14120F]">{t("nextStep.title")}</span>
              <span className="text-[12.5px] leading-[1.45] text-pretty text-[#55514A]">{t("nextStep.note")}</span>
            </div>
            <button
              type="button"
              onClick={onVerify}
              className="flex-none cursor-pointer whitespace-nowrap rounded-[9px] border-0 bg-[#049FDE] px-[14px] py-[9px] font-sans text-[13px] font-semibold text-white hover:bg-[#0378A9]"
            >
              {t("nextStep.cta")}
            </button>
          </div>
        )}
      </div>

      {hasActiveRw && (
        <div className="border-t border-[rgba(20,18,15,.07)]">
          <div className="border-b border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-[18px] py-[11px]">
            <QueueNav pos={rwPos} total={rwTotal} onPrev={rwPrev} onNext={rwNext} />
          </div>
          <div className="px-[18px] pb-[18px] pt-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#049FDE]">{rwTag}</div>
            <p className="m-0 mb-2 text-[13px] leading-[1.6] text-[#8A857C] line-through decoration-[rgba(20,18,15,.22)]">
              {rwBefore ?? t("sentence.originalFallback")}
            </p>
            <p className="m-0 mb-[9px] text-[13.5px] font-medium leading-[1.65]">{rwAfter}</p>
            <p className="m-0 mb-[14px] text-[12.5px] leading-[1.6] text-[#55514A]">{rwWhy}</p>
            <button
              type="button"
              onClick={rwToggle}
              style={{ background: rwActionBg, borderColor: rwActionBorder, color: rwActionColor }}
              className="w-full rounded-[9px] border px-[13px] py-[9px] font-sans text-[13px] font-semibold cursor-pointer"
            >
              {rwReverted ? t("sentence.keepRewrite") : t("sentence.restoreOriginal")}
            </button>
            <button
              type="button"
              onClick={rwLocate}
              className="mt-[9px] w-full rounded-none border-0 bg-transparent font-sans text-xs font-medium text-[#8A857C] cursor-pointer hover:text-[#049FDE]"
            >
              {t("seeInText")}
            </button>
          </div>
        </div>
      )}

      {noActiveRw && (
        <div className="border-t border-[rgba(20,18,15,.07)] px-[18px] pb-[27px] pt-[25px] text-center">
          <p className="mx-auto max-w-[28ch] text-[12.5px] text-[#8A857C]">
            {hasResult ? t("rewrite.emptyWithOutput") : t("rewrite.emptyNoOutput")}
          </p>
        </div>
      )}
    </Card>
  );
}
