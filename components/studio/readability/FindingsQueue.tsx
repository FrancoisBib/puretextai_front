"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button, QueueNav } from "@/components/ui";
import type { ActiveReadabilityFinding } from "@/lib/store/selectors/readability";

export interface FindingsQueueProps {
  rQueueMulti: boolean;
  rQueuePos: number;
  rQueueCount: number;
  rPrev: () => void;
  rNext: () => void;
  rActive: ActiveReadabilityFinding | null;
  rQueueEmpty: boolean;
}

/**
 * The findings queue, rendered inside the signals card: the sentences to
 * lighten, one at a time. It mirrors Vérification's active-source card, but
 * points at a sentence in the reader's own text instead of an external source.
 */
export function FindingsQueue({
  rQueueMulti,
  rQueuePos,
  rQueueCount,
  rPrev,
  rNext,
  rActive,
  rQueueEmpty,
}: FindingsQueueProps) {
  const t = useTranslations("studio.readability");

  return (
    <div>
      <div className="flex items-center gap-2 px-[17px] py-3 border-y border-[rgba(20,18,15,.07)] bg-[#FCFBF9]">
        <span className="flex-1 text-[11px] font-bold tracking-[.09em] uppercase text-[#8A857C]">
          {rQueueCount ? t("queueLabel", { n: rQueueCount }) : t("queueLabelEmpty")}
        </span>
        {rQueueMulti && <QueueNav pos={rQueuePos} total={rQueueCount} onPrev={rPrev} onNext={rNext} size={23} />}
      </div>

      {rActive && (
        <div style={{ padding: "14px 17px 17px" }}>
          <div className="text-[10px] font-bold tracking-[.1em] uppercase mb-[7px]" style={{ color: rActive.color }}>
            {t(`categories.${rActive.key}`)}
          </div>
          <div
            className="text-[12.5px] leading-[1.55] text-[#4A4741] text-pretty"
            style={{ paddingLeft: 9, borderLeft: `2px solid ${rActive.color}` }}
          >
            « {rActive.quote} »
          </div>
          <p className="mt-[9px] mb-3 text-[12.5px] leading-[1.6] text-[#55514A] text-pretty">
            {t(`findingWhy.${rActive.key}`, rActive.whyParams)}
          </p>
          <Button variant="outline" size="sm" hoverAccent onClick={rActive.locate}>
            {t("seeInText")}
          </Button>
        </div>
      )}

      {rQueueEmpty && (
        <p className="m-0 text-[12.5px] text-[#55514A] text-pretty" style={{ padding: "14px 17px 17px" }}>
          {t("queueEmptyNote")}
        </p>
      )}
    </div>
  );
}
