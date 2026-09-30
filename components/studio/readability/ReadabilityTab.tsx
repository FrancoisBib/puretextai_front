"use client";

import { useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectReadabilityView } from "@/lib/store/selectors/readability";
import { selectShellView } from "@/lib/store/selectors/shell";

import { MobileTabs } from "@/components/studio/mobile/MobileTabs";
import { TabColumns } from "@/components/studio/mobile/TabColumns";
import { ScoreBanner } from "./ScoreBanner";
import { ReadTextPanel } from "./ReadTextPanel";
import { SignalBars } from "./SignalBars";
import { FindingsQueue } from "./FindingsQueue";
import { ReadEmptyState } from "./ReadEmptyState";
import { ReadFindingPopover } from "./ReadFindingPopover";

/**
 * Top-level "Lisibilité" tab — heading, the score banner once a measure has
 * run, and the two-column layout: the marked text on one side, the four
 * signals and the queue of sentences to lighten on the other.
 */
export function ReadabilityTab() {
  const v = useStudioStore(selectReadabilityView);
  const shell = useStudioStore(selectShellView);
  const t = useTranslations("studio.readability");

  return (
    <div className="animate-pt-in">
      <div className="mb-[19px]">
        <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
          {t("heading")}
          <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
        </h1>
        <p className="mt-[9px] mb-0 max-w-[64ch] text-[#55514A]">{t("subheading")}</p>
      </div>

      {v.rDone && (
        <ScoreBanner
          rBg={v.rBg}
          rBorder={v.rBorder}
          rScore={v.rScore}
          rColor={v.rColor}
          rLevelKey={v.rLevelKey}
          rFindingsCount={v.rFindingsCount}
          rAsl={v.rAsl}
          rGoCorrect={v.rGoCorrect}
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
          <ReadTextPanel
            rWords={v.rWords}
            rSentences={v.rSentences}
            rEditing={v.rEditing}
            rMarked={v.rMarked}
            rEdit={v.rEdit}
            rText={v.rText}
            setRText={v.setRText}
            rClear={v.rClear}
            rRun={v.rRun}
            rBusy={v.rBusy}
            rRuns={v.rRuns}
            rLegend={v.rLegend}
          />
        }
        aside={
          <>
            {v.rDone && (
              <SignalBars rSignals={v.rSignals}>
                <FindingsQueue
                  rQueueMulti={v.rQueueMulti}
                  rQueuePos={v.rQueuePos}
                  rQueueCount={v.rQueueCount}
                  rPrev={v.rPrev}
                  rNext={v.rNext}
                  rActive={v.rActive}
                  rQueueEmpty={v.rQueueEmpty}
                />
              </SignalBars>
            )}

            {v.rEmpty && <ReadEmptyState rDemo={() => v.rDemo(t("demoText"))} />}
          </>
        }
      />

      <ReadFindingPopover view={v} />
    </div>
  );
}
