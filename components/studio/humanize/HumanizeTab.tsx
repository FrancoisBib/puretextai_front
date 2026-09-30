"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { AnalysisSkeleton, Button, Card, ProgressButton } from "@/components/ui";
import { useStudioStore } from "@/lib/store/studio-store";
import { INTENSITY_KEYS, selectHumanizeView } from "@/lib/store/selectors/humanize";
import { selectPlanView } from "@/lib/store/selectors/plan";
import { selectShellView } from "@/lib/store/selectors/shell";

import { ActionBar } from "@/components/studio/mobile/ActionBar";
import { MobileTabs } from "@/components/studio/mobile/MobileTabs";
import { TabColumns } from "@/components/studio/mobile/TabColumns";
import { DocumentToolbar } from "./DocumentToolbar";
import { ToneIntensityBar } from "./ToneIntensityBar";
import { TuneRow } from "./TuneRow";
import { TuneSheet } from "./TuneSheet";
import { TranslationBanner } from "./TranslationBanner";
import { SourceView } from "./SourceView";
import { ResultView } from "./ResultView";
import { DiffView } from "./DiffView";
import { RewriteSidebar } from "./RewriteSidebar";
import { IntensityNote } from "./IntensityNote";

/**
 * Humanisation tab: heading + run button, then the document card (view
 * toggle, tone/intensity controls, translation offer, source/result/diff
 * content, footer) beside the rewrite sidebar.
 */
export function HumanizeTab() {
  const vm = useStudioStore(selectHumanizeView);
  const plan = useStudioStore(selectPlanView);
  const shell = useStudioStore(selectShellView);
  const text = useStudioStore((s) => s.text);
  const setText = useStudioStore((s) => s.setText);
  const copied = useStudioStore((s) => s.copied);
  const t = useTranslations("studio.humanize");
  const tCommon = useTranslations("common");

  const copyLabel = copied ? t("copied") : t("copy");
  const humanCta = vm.busy ? t("cta.busy") : vm.hasOutput ? t("cta.rerun") : t("cta.run");
  const hBudget =
    plan.hWordsCap != null ? tCommon("wordsUsed", { used: plan.hWordsUsed ?? 0, cap: plan.hWordsCap }) : "";

  return (
    <div className="animate-pt-in">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-[22px]">
        <div>
          <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
            {t("heading")}
            <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
          </h1>
          <p className="mb-0 mt-[9px] max-w-[58ch] text-sm text-[#55514A]">{t("subheading")}</p>
        </div>

        <ActionBar className="gap-[11px]">
          {plan.hOver ? (
            <>
              <span className="max-w-[34ch] text-[12.5px] text-pretty text-[#B4780F] max-mob:hidden">
                {t("overCap")}
              </span>
              <Link
                href="/tarifs"
                className="rounded-[10px] border border-[#14120F] bg-[#14120F] px-5 py-3 font-sans text-[13.5px] font-semibold text-white hover:bg-black hover:text-white"
              >
                {t("viewPricing")}
              </Link>
            </>
          ) : (
            <ProgressButton
              busy={vm.busy}
              onClick={vm.runHumanize}
              className="rounded-[10px] px-5 py-3 text-[13.5px] shadow-[0_2px_10px_rgba(4,159,222,.28)]"
            >
              {humanCta}
            </ProgressButton>
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
        columns="minmax(0, 1.7fr) minmax(262px, .8fr)"
        mTab={shell.mTab}
        asideTop={86}
        asideClassName="gap-[13px]"
        main={
          <Card elevated data-editor-card className="overflow-hidden">
            <DocumentToolbar
              budget={hBudget}
              budgetColor={plan.hBudgetColor}
              isSourceView={vm.isSourceView}
              isResultView={vm.isResultView}
              isDiffView={vm.isDiffView}
              viewSource={vm.viewSource}
              viewResult={vm.viewResult}
              viewDiff={vm.viewDiff}
            />

            <ToneIntensityBar
              tone={vm.tone}
              toneMenu={vm.toneMenu}
              toggleToneMenu={vm.toggleToneMenu}
              toneGroups={vm.toneGroups}
              intensityOptions={vm.intensityOptions}
              tuneHint={vm.hasResult ? t("tuneHint.recalculated") : t("tuneHint.onLaunch")}
            />

            <TuneRow
              tuneSummary={`${t(`tones.${vm.tone}.label`)} · ${t(`intensity.${INTENSITY_KEYS[vm.intensityIndex]}`)}`}
              openTuneSheet={vm.openTuneSheet}
            />

            <TranslationBanner
              show={vm.transShow}
              flag={vm.transFlag}
              from={vm.transFrom}
              to={vm.transTo}
              onRun={() => vm.transRun(t("translatedDemoText"))}
              onDismiss={vm.transDismiss}
            />

            {vm.isSourceView && <SourceView text={text} onChange={setText} />}

            {vm.busy && (
              <AnalysisSkeleton
                label={t("analyzingSkeleton")}
                groups={[
                  ["96%", "88%", "93%", "61%"],
                  ["92%", "85%", "48%"],
                ]}
                className="px-6 pt-6 pb-[30px]"
              />
            )}

            {vm.humanEmpty && (
              <div className="px-[22px] pb-[94px] pt-[86px] text-center">
                <div className="mx-auto mb-[11px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[rgba(4,159,222,.11)] font-serif text-[18px] text-[#049FDE]">
                  ¶
                </div>
                <p className="mx-auto max-w-[34ch] text-[13px] text-[#8A857C]">{t("emptyNote")}</p>
              </div>
            )}

            {vm.showResultView && <ResultView sentences={vm.sentences} />}
            {vm.showDiffView && <DiffView diffs={vm.diffs} noDiffs={vm.noDiffs} />}

            <div className="flex flex-wrap items-center gap-[9px] rounded-b-[16px] border-t border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-[18px] py-3">
              <span className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                hoverAccent
                onClick={vm.clearHuman}
                className="rounded-[9px] px-[14px] py-2 text-[13px]"
              >
                {t("clear")}
              </Button>
              <Button
                variant="dark"
                size="sm"
                onClick={vm.copyHuman}
                className="rounded-[9px] px-[14px] py-2 text-[13px]"
              >
                {copyLabel}
              </Button>
            </div>
          </Card>
        }
        aside={
          <>
            <RewriteSidebar
              kept={vm.kept}
              rwListLength={vm.rwListLength}
              keptPct={vm.keptPct}
              canVerify={vm.humCanVerify}
              onVerify={vm.humVerify}
              hasResult={vm.hasResult}
              hasActiveRw={vm.hasActiveRw}
              noActiveRw={vm.noActiveRw}
              rwPos={vm.rwPos}
              rwTotal={vm.rwTotal}
              rwTag={vm.rwTag}
              rwBefore={vm.rwBefore}
              rwAfter={vm.rwAfter}
              rwWhy={vm.rwWhy}
              rwReverted={vm.rwReverted}
              rwActionBg={vm.rwActionBg}
              rwActionBorder={vm.rwActionBorder}
              rwActionColor={vm.rwActionColor}
              rwToggle={vm.rwToggle}
              rwLocate={vm.rwLocate}
              rwPrev={vm.rwPrev}
              rwNext={vm.rwNext}
            />
            <IntensityNote intensityIndex={vm.intensityIndex} />
          </>
        }
      />

      <TuneSheet
        open={vm.tuneSheetOpen}
        onClose={vm.closeTuneSheet}
        toneGroups={vm.toneGroups}
        intensityOptions={vm.intensityOptions}
        intensityIndex={vm.intensityIndex}
        hasResult={vm.hasResult}
      />
    </div>
  );
}
