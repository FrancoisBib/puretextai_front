"use client";

import { useLocale, useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectCountView } from "@/lib/store/selectors/count";
import { selectShellView } from "@/lib/store/selectors/shell";
import { Button, Card, Textarea } from "@/components/ui";
import { MobileTabs } from "@/components/studio/mobile/MobileTabs";
import { TabColumns } from "@/components/studio/mobile/TabColumns";
import { CountStats } from "./CountStats";
import { LiveCountBar } from "./LiveCountBar";
import { formatCountDuration } from "./format-duration";

/**
 * "Compteur" tab: a plain editor whose word, character, sentence, paragraph
 * and reading-time readouts update on every keystroke. Everything is computed
 * in the browser — nothing is sent anywhere, which is what the subheading
 * promises.
 */
export function CountTab() {
  const v = useStudioStore(selectCountView);
  const shell = useStudioStore(selectShellView);
  const t = useTranslations("studio.count");
  const locale = useLocale();

  const wordsLabel = v.cWords.toLocaleString(locale);
  const charsShort = v.cChars.toLocaleString(locale);
  const readShort = formatCountDuration(v.cReadingSeconds, t);

  return (
    <div className="animate-pt-in">
      <div className="mb-[19px]">
        <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
          {t("heading")}
          <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
        </h1>
        <p className="mt-[9px] mb-0 max-w-[64ch] text-[#55514A]">{t("subheading")}</p>
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
        columns="minmax(0, 1.55fr) minmax(310px, .85fr)"
        mTab={shell.mTab}
        main={
          <Card elevation="lg" data-editor-card className="min-w-0">
            <div className="flex flex-wrap items-center gap-[11px] border-b border-[rgba(20,18,15,.07)] px-5 py-[13px]">
              <span className="whitespace-nowrap text-[13.5px] font-semibold">{t("yourText")}</span>
              <span className="flex-1" />
              <Button
                variant="outline"
                className="rounded-[9px] px-[11px] py-1.5 text-[12.5px] font-medium text-[#4A4741]"
                onClick={v.cClear}
              >
                {t("clear")}
              </Button>
            </div>
            <Textarea
              data-grow="1"
              value={v.cText}
              onChange={(e) => v.setCText(e.target.value)}
              placeholder={t("placeholder")}
              className="block w-full resize-y overflow-hidden rounded-b-[15px] border-0 bg-transparent px-6 py-[21px] text-[15px] leading-[1.85] text-[#14120F]"
              style={{ minHeight: "max(392px, calc(100dvh - 330px))" }}
            />
          </Card>
        }
        aside={
          <>
            <CountStats
              words={v.cWords}
              chars={v.cChars}
              charsNoSpace={v.cCharsNoSpace}
              sentences={v.cSentences}
              paragraphs={v.cParagraphs}
              readingSeconds={v.cReadingSeconds}
              spokenSeconds={v.cSpokenSeconds}
            />
            <Card elevation="sm" className="p-[17px]">
              <p className="m-0 mb-3 text-[12.5px] leading-[1.55] text-pretty text-[#55514A]">
                {t("readabilityHint")}
              </p>
              <Button variant="accent-outline" size="sm" onClick={v.cGoRead}>
                {t("testReadability")}
              </Button>
            </Card>
          </>
        }
      >
        <LiveCountBar
          visible={shell.mTabIsText}
          words={wordsLabel}
          wordsLabel={t("wordsUnit", { n: v.cWords })}
          charsShort={charsShort}
          readShort={readShort}
          onDetails={shell.setMTabRes}
        />
      </TabColumns>
    </div>
  );
}
