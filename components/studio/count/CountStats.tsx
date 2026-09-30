"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui";
import { formatCountDuration } from "./format-duration";

export interface CountStatsProps {
  words: number;
  chars: number;
  charsNoSpace: number;
  sentences: number;
  paragraphs: number;
  readingSeconds: number;
  spokenSeconds: number;
}

/** The big word count and the six-tile breakdown grid (markup.html:1028-1041). */
export function CountStats({ words, chars, charsNoSpace, sentences, paragraphs, readingSeconds, spokenSeconds }: CountStatsProps) {
  const t = useTranslations("studio.count");
  const locale = useLocale();

  const stats = [
    { key: "chars", value: chars.toLocaleString(locale), label: t("stats.chars") },
    { key: "charsNoSpace", value: charsNoSpace.toLocaleString(locale), label: t("stats.charsNoSpace") },
    { key: "sentences", value: sentences.toLocaleString(locale), label: t("stats.sentences", { n: sentences }) },
    { key: "paragraphs", value: paragraphs.toLocaleString(locale), label: t("stats.paragraphs", { n: paragraphs }) },
    { key: "readingTime", value: formatCountDuration(readingSeconds, t), label: t("stats.readingTime") },
    { key: "spokenTime", value: formatCountDuration(spokenSeconds, t), label: t("stats.spokenTime") },
  ];

  return (
    <Card elevation="sm" className="p-[19px]">
      <div className="flex items-baseline gap-[7px]">
        <span className="font-serif text-[44px] leading-none text-[#049FDE]">{words.toLocaleString(locale)}</span>
        <span className="text-[13px] text-[#8A857C]">{t("wordsUnit", { n: words })}</span>
      </div>
      <div className="mt-[17px] grid grid-cols-2 gap-px overflow-hidden rounded-[11px] border border-[rgba(20,18,15,.07)] bg-[rgba(20,18,15,.07)]">
        {stats.map((st) => (
          <div key={st.key} className="bg-white px-3 py-[11px]">
            <div className="text-[17px] font-semibold leading-[1.2] tabular-nums">{st.value}</div>
            <div className="mt-px text-[11.5px] text-[#8A857C]">{st.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
