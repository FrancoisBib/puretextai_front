"use client";

import { useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectVerifyView } from "@/lib/store/selectors/verify";
import { selectPlanView } from "@/lib/store/selectors/plan";
import { selectShellView } from "@/lib/store/selectors/shell";

import { MobileTabs } from "@/components/studio/mobile/MobileTabs";
import { TabColumns } from "@/components/studio/mobile/TabColumns";
import { VerdictBanner } from "./VerdictBanner";
import { VerifyTextPanel } from "./VerifyTextPanel";
import { SimilarityCard } from "./SimilarityCard";
import { VerifyEmptyState } from "./VerifyEmptyState";
import { FindingPopover } from "./FindingPopover";

/**
 * Top-level "Vérification" tab — heading, the verdict banner once a pass has
 * run, and the two-column layout (marked text + Similarité sidebar, or the
 * dashed placeholder before the first run). The finding popover is rendered
 * here rather than inside the text, because it is positioned against the
 * viewport.
 */
export function VerifyTab() {
  const v = useStudioStore(selectVerifyView);
  const plan = useStudioStore(selectPlanView);
  const shell = useStudioStore(selectShellView);
  const t = useTranslations("studio.verify");

  return (
    <div className="animate-pt-in">
      <div className="mb-[19px]">
        <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
          {t("heading")}
          <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
        </h1>
        <p className="mt-[9px] mb-0 max-w-[64ch] text-[#55514A]">{t("subheading")}</p>
      </div>

      {v.vFromHuman && (
        <div className="mb-[10px] flex flex-wrap items-center gap-[10px] text-[12.5px] text-[#55514A]">
          <span className="h-[6px] w-[6px] flex-none rounded-full bg-[#049FDE]" />
          <span>{t("fromHuman.note")}</span>
          <button
            type="button"
            onClick={v.goHuman}
            className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[12.5px] font-semibold text-[#049FDE] hover:text-[#0378A9]"
          >
            {t("fromHuman.back")}
          </button>
        </div>
      )}

      {v.vDone && (
        <VerdictBanner
          vdBg={v.vdBg}
          vdBorder={v.vdBorder}
          vdScale={v.vdScale}
          vdColor={v.vdColor}
          vdLevelIndex={v.vdLevelIndex}
          vdScore={v.vdScore}
          vdFindCount={v.vdFindCount}
          vdRhythmCount={v.vdRhythmCount}
          vdPhrasingCount={v.vdPhrasingCount}
          vdAction={v.vdAction}
        />
      )}

      <MobileTabs
        mTabIsText={shell.mTabIsText}
        mTabIsRes={shell.mTabIsRes}
        setMTabText={shell.setMTabText}
        setMTabRes={shell.setMTabRes}
        mResBadge={shell.mResBadge}
        mResHasBadge={shell.mResHasBadge}
      />

      <TabColumns
        columns="minmax(0, 1.55fr) minmax(310px, .85fr)"
        mTab={shell.mTab}
        main={
          <VerifyTextPanel
            vWords={v.vWords}
            vSentences={v.vSentences}
            vShowEditor={v.vShowEditor}
            vShowMarked={v.vShowMarked}
            vHintWordsToGo={v.vHintWordsToGo}
            vHintColor={v.vHintColor}
            vEdit={v.vEdit}
            vText={v.vText}
            setVText={v.setVText}
            vClear={v.vClear}
            vRun={v.vRun}
            vRuns={v.vRuns}
            vFindCount={v.vFindCount}
            vLegend={v.vLegend}
            vWordsUsed={plan.vWordsUsed}
            vWordsCap={plan.vWordsCap}
            vBudgetColor={plan.vBudgetColor}
            vOver={plan.vOver}
          />
        }
        aside={
          <>
            {v.vDone && (
              <SimilarityCard
                simStatusKey={v.simStatusKey}
                simLoading={v.simLoading}
                simDone={v.simDone}
                simError={v.simError}
                simScore={v.simScore}
                simColor={v.simColor}
                simVerdictKey={v.simVerdictKey}
                simHasMulti={v.simHasMulti}
                simSrcPos={v.simSrcPos}
                simSrcCount={v.simSrcCount}
                simSrcPrev={v.simSrcPrev}
                simSrcNext={v.simSrcNext}
                simEmpty={v.simEmpty}
                simActive={v.simActive}
              />
            )}

            {v.vEmpty && <VerifyEmptyState vDemo={v.vDemo} />}
          </>
        }
      />

      <FindingPopover view={v} />
    </div>
  );
}
