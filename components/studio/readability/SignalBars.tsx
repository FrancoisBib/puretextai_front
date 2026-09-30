"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, SignalBar } from "@/components/ui";
import type { ReadabilitySignal } from "@/lib/engines/readability/readability.engine";

export interface SignalBarsProps {
  rSignals: ReadabilitySignal[];
  /** The findings queue shares this card, below the signals. */
  children?: React.ReactNode;
}

/** Sidebar card: the four readability signals, most-to-least penalizing. */
export function SignalBars({ rSignals, children }: SignalBarsProps) {
  const t = useTranslations("studio.readability");

  return (
    <Card className="overflow-hidden">
      <div className="px-[17px] pt-[13px] pb-[14px] border-b border-[rgba(20,18,15,.07)]">
        <span className="text-[13.5px] font-semibold">{t("signalsHeading")}</span>
        <p className="m-0 mt-[3px] text-[12px] text-[#8A857C]">{t("signalsSubheading")}</p>
      </div>
      <div className="flex flex-col">
        {rSignals.map((sg, i) => (
          <SignalBar
            key={sg.key}
            name={t(`signals.${sg.key}.name`)}
            metric={t(`signals.${sg.key}.metric`, sg.metricParams)}
            pct={sg.pct}
            color={sg.color}
            note={t(`signals.${sg.key}.note.${sg.noteLevel}`)}
            className={i === rSignals.length - 1 ? "border-b-0" : undefined}
          />
        ))}
      </div>
      {children}
    </Card>
  );
}
