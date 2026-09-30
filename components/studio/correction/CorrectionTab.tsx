"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { useStudioStore } from "@/lib/store/studio-store";
import { selectCorrectionView } from "@/lib/store/selectors/correction";
import { selectPlanView } from "@/lib/store/selectors/plan";
import { selectShellView } from "@/lib/store/selectors/shell";
import { Button, ProgressButton, SheetScrim } from "@/components/ui";
import { ActionBar } from "@/components/studio/mobile/ActionBar";
import { MobileTabs } from "@/components/studio/mobile/MobileTabs";
import { TabColumns } from "@/components/studio/mobile/TabColumns";
import { DocumentEditor } from "./DocumentEditor";
import { ReviewSidebar } from "./ReviewSidebar";

/**
 * Top-level "Correction" tab: heading, the action bar (run the analysis, then
 * Tout ignorer / Tout corriger), and the two-column document + Révision
 * layout. Ported from the `isCorrect` block of the design.
 */
export function CorrectionTab() {
  const view = useStudioStore(selectCorrectionView);
  const plan = useStudioStore(selectPlanView);
  const shell = useStudioStore(selectShellView);
  const t = useTranslations("studio.correction");
  const tCommon = useTranslations("common");
  const cBudget =
    plan.cWordsCap != null ? tCommon("wordsUsed", { used: plan.cWordsUsed ?? 0, cap: plan.cWordsCap }) : "";

  return (
    <div className="animate-pt-in">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-[22px]">
        <div>
          <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
            {t("heading")}
            <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
          </h1>
          <p className="mt-[9px] mb-0 max-w-[58ch] text-[14px] text-[#55514A]">{t("subheading")}</p>
        </div>

        <ActionBar>
          {plan.cOver && (
            <>
              <span className="max-w-[34ch] text-[12.5px] text-pretty text-[#B4780F] max-mob:hidden">
                {t("overCap")}
              </span>
              <Link
                href="/tarifs"
                className="rounded-[10px] border border-[#14120F] bg-[#14120F] px-4 py-2.5 font-sans text-[13px] font-semibold text-white hover:bg-black hover:text-white"
              >
                {t("viewPricing")}
              </Link>
            </>
          )}
          {plan.cShowRun && (
            <ProgressButton busy={view.cBusy} onClick={view.runAnalysis}>
              {view.cBusy ? t("analyzing") : t("runAnalysis")}
            </ProgressButton>
          )}
          {plan.cShowActions && (
            <>
              <Button
                variant="outline"
                className="whitespace-nowrap rounded-[10px] px-[14px] py-2.5 text-[13px] font-medium"
                onClick={view.ignoreAll}
              >
                {t("ignoreAll")}
              </Button>
              <Button variant="accent" className="whitespace-nowrap" onClick={view.applyAll}>
                {t("applyAllCount", { count: view.pendingCount })}
              </Button>
            </>
          )}
        </ActionBar>
      </div>

      <MobileTabs
        mTabIsText={shell.mTabIsText}
        mTabIsRes={shell.mTabIsRes}
        setMTabText={shell.setMTabText}
        setMTabRes={shell.setMTabRes}
        mResBadge={shell.mResBadge}
        mResHasBadge={shell.mResHasBadge}
      />

      <TabColumns
        columns="minmax(0, 1.7fr) minmax(264px, .9fr)"
        mTab={shell.mTab}
        asideTop={86}
        asideClassName="gap-[13px]"
        main={<DocumentEditor view={view} budget={cBudget} budgetColor={plan.cBudgetColor} />}
        aside={<ReviewSidebar view={view} />}
      />

      {view.popSheetOpen && <SheetScrim onClick={view.closePop} />}
    </div>
  );
}
