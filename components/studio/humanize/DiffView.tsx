"use client";

import { useTranslations } from "next-intl";
import type { DiffRow } from "@/lib/store/selectors/humanize";

export interface DiffViewProps {
  diffs: DiffRow[];
  noDiffs: boolean;
}

/**
 * "Différences" view: one left-bordered block per rewritten sentence
 * (header/tag, struck-through before, new after, why), or an empty-state
 * message when nothing was rewritten. Ported from design.html lines
 * 362-376.
 */
export function DiffView({ diffs, noDiffs }: DiffViewProps) {
  const t = useTranslations("studio.humanize");

  return (
    <div className="flex flex-col gap-[18px] px-[23px] pb-[22px] pt-5">
      {diffs.map((d, i) => (
        <div key={i} style={{ borderLeftColor: d.bar }} className="border-l-2 pl-[14px]">
          <div className="mb-[7px] text-[10px] font-bold uppercase tracking-[.1em] text-[#A8A29A]">
            {t("diff.head", { n: d.n, tag: d.tag })}
            {d.reverted && t("diff.originalRestored")}
          </div>
          <p className="m-0 mb-[7px] text-sm leading-[1.75] text-[#8A857C] line-through decoration-[rgba(20,18,15,.22)]">
            {d.before ?? t("diff.noSentenceHere")}
          </p>
          <p className="m-0 mb-2 text-[14.5px] leading-[1.8] text-[#14120F]">
            {d.after ?? t("diff.rewriteDiscarded")}
          </p>
          <p className="m-0 text-[12.5px] leading-[1.6] text-[#8A857C]">{d.why}</p>
        </div>
      ))}
      {noDiffs && <p className="m-0 py-[54px] text-center text-[13px] text-[#8A857C]">{t("noDiffs")}</p>}
    </div>
  );
}
