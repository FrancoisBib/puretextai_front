"use client";

import { useTranslations } from "next-intl";
import {
  AnalysisSkeleton,
  Button,
  Card,
  EmptyState,
  PillFilter,
  ProgressBar,
  QueueNav,
} from "@/components/ui";
import type { CorrectionView } from "@/lib/store/selectors/correction";

export interface ReviewSidebarProps {
  view: CorrectionView;
}

/**
 * The "Révision" card: progress header + category filter pills, then one of
 * three states — the analysis skeleton, the active-fix panel (queue nav, rule
 * detail, Appliquer/Ignorer), or the empty state, whose call to action is
 * "Lancer l'analyse" before the run and "Tester la lisibilité" once the
 * document comes back clean.
 */
export function ReviewSidebar({ view }: ReviewSidebarProps) {
  const t = useTranslations("studio.correction");
  const tCommon = useTranslations("common");
  const progressLabel = !view.analyzed ? "—" : t("progress", { done: view.doneCount, total: view.totalCount });

  return (
    <Card elevation="sm" className="overflow-hidden">
      <div className="px-[18px] pt-4 pb-[14px]">
        <div className="mb-[9px] flex items-baseline justify-between">
          <span className="text-[13.5px] font-semibold">{t("review")}</span>
          <span className="text-[12px] tabular-nums text-[#8A857C]">{progressLabel}</span>
        </div>
        <ProgressBar percent={Number.parseFloat(view.progressPct) || 0} />
        <div className="mt-[13px] flex flex-wrap gap-1.5">
          {view.filters.map((f) => (
            <PillFilter
              key={f.label}
              label={t(`categories.${f.label}`)}
              count={f.count}
              active={f.bg !== "transparent"}
              dot={f.dot}
              dotRing={f.dotRing}
              onClick={f.pick}
              className="max-mob:min-h-10 max-mob:px-[13px] max-mob:py-2 max-mob:text-[13px]"
            />
          ))}
        </div>
      </div>

      {view.cBusy && (
        <AnalysisSkeleton
          dense
          label={t("analyzingSkeleton")}
          groups={[
            ["42%", "88%", "66%"],
            ["38%", "80%", "54%"],
          ]}
          className="border-t border-[rgba(20,18,15,.07)] p-[18px]"
        />
      )}

      {view.hasActive && (
        <div className="border-t border-[rgba(20,18,15,.07)]">
          <div className="flex items-center gap-2 border-b border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-[18px] py-[11px]">
            <QueueNav pos={view.activePos} total={view.queueCount} onPrev={view.prev} onNext={view.next} />
          </div>

          <div className="px-[18px] pt-4 pb-[18px]">
            <div
              className="mb-2 text-[10px] font-bold uppercase tracking-[.1em]"
              style={{ color: view.activeCatColor }}
            >
              {view.activeCat ? t(`categories.${view.activeCat}`) : ""}
            </div>
            <div className="mb-[9px] text-[14.5px] font-semibold leading-[1.4]">{view.activeRule}</div>
            <div className="mb-[9px] flex flex-wrap items-center gap-2 text-[13.5px]">
              <span
                className="line-through text-[#8A857C]"
                style={{ textDecorationColor: "rgba(178,58,46,.55)" }}
              >
                {view.activeFrom}
              </span>
              <span className="text-[#C4BEB4]">→</span>
              <span className="font-semibold text-[#049FDE]">{view.activeTo}</span>
            </div>
            <p className="m-0 mb-[14px] text-[13px] leading-[1.65] text-[#55514A]">{view.activeWhy}</p>
            <div className="flex items-center gap-2 max-mob:gap-2.5 max-mob:[&>button]:min-h-[50px] max-mob:[&>button]:flex-1 max-mob:[&>button]:rounded-[12px] max-mob:[&>button]:text-[14.5px]">
              <Button
                variant="dark"
                className="flex-1 rounded-[9px] px-[13px] py-[9px] text-[13px] font-semibold"
                onClick={view.applyActive}
              >
                {t("apply")}
              </Button>
              <Button
                variant="outline"
                className="rounded-[9px] px-[13px] py-[9px] text-[13px] font-medium text-[#55514A]"
                onClick={view.ignoreActive}
              >
                {t("ignore")}
              </Button>
            </div>
            <button
              type="button"
              onClick={view.locate}
              className="mt-[9px] w-full cursor-pointer border-0 bg-transparent font-sans text-[12px] font-medium text-[#8A857C] transition-colors duration-150 hover:text-[#049FDE]"
            >
              {t("seeInText")}
            </button>
          </div>
        </div>
      )}

      {view.noActive && (
        <div className="border-t border-[rgba(20,18,15,.07)]">
          <EmptyState
            variant="done"
            icon={view.emptyIcon}
            iconBg={view.emptyIconBg}
            iconColor={view.emptyIconColor}
            title={t(`empty.${view.emptyState}Title`)}
            note={view.emptyState === "error" ? tCommon(`errors.${view.analyzeError}`) : t(`empty.${view.emptyState}Note`)}
          >
            <div className="flex flex-col max-mob:[&>button]:min-h-[50px] max-mob:[&>button]:w-full max-mob:[&>button]:rounded-[12px] max-mob:[&>button]:text-[14.5px]">
              {view.emptyRunCta && (
                <Button variant="accent" size="sm" onClick={view.runAnalysis}>
                  {view.cBusy ? t("analyzing") : t("runAnalysis")}
                </Button>
              )}
              {view.emptyReadCta && (
                <Button variant="accent-outline" size="sm" onClick={view.cToRead}>
                  {t("testReadability")}
                </Button>
              )}
            </div>
          </EmptyState>
        </div>
      )}
    </Card>
  );
}
