"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Popover, PopoverHeader, Button, mobileSheetClasses } from "@/components/ui";

export interface InlineFixPopoverProps {
  /** Absolute positioning (top/bottom/left/right) resolved by the caller from the segment's flip flags. */
  style?: React.CSSProperties;
  cat: string;
  catColor: string;
  rule: string;
  from: string;
  to: string;
  why: string;
  onApply: () => void;
  onIgnore: () => void;
  onClose: () => void;
}

/**
 * The per-segment fix popover that opens inline in the document editor when a
 * flagged word is clicked: category label, rule title, from → to diff, the
 * explanation, and Appliquer / Ignorer.
 *
 * Below 760px it becomes a bottom sheet; its dimmer is a separate element
 * (`SheetScrim`, rendered by `CorrectionTab`) rather than a shadow spread,
 * because this popover lives inside the scrolling document.
 */
export function InlineFixPopover({
  style,
  cat,
  catColor,
  rule,
  from,
  to,
  why,
  onApply,
  onIgnore,
  onClose,
}: InlineFixPopoverProps) {
  const t = useTranslations("studio.correction");

  return (
    <Popover
      open
      width={295}
      style={{ position: "absolute", pointerEvents: "auto", zIndex: 12, whiteSpace: "normal", ...style }}
      className={mobileSheetClasses({ scrim: false, touchTargets: false })}
    >
      <div className="px-4 pt-[14px] pb-[13px]">
        <PopoverHeader
          label={cat}
          labelColor={catColor}
          onClose={onClose}
          className="mb-2 [&_button]:max-mob:h-10 [&_button]:max-mob:w-10 [&_button]:max-mob:rounded-full [&_button]:max-mob:text-[15px]"
        />

        <div className="mb-2 text-[14px] font-semibold leading-[1.45]">{rule}</div>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-[13.5px]">
          <span className="line-through text-[#8A857C]" style={{ textDecorationColor: "rgba(178,58,46,.55)" }}>
            {from}
          </span>
          <span className="text-[#C4BEB4]">→</span>
          <span className="font-semibold text-[#049FDE]">{to}</span>
        </div>

        <div className="mb-[13px] text-[13px] leading-[1.6] text-[#55514A]">{why}</div>

        <div className="flex flex-wrap items-center gap-2 max-mob:gap-2.5 max-mob:pt-0.5 max-mob:[&>button]:flex-1">
          <Button
            variant="accent"
            className="rounded-[8px] px-[14px] py-2 text-[13px] font-semibold shadow-none max-mob:min-h-[50px] max-mob:rounded-[12px] max-mob:text-[14.5px]"
            onClick={onApply}
          >
            {t("apply")}
          </Button>
          <Button
            variant="outline"
            className="rounded-[8px] px-[13px] py-2 text-[13px] font-medium text-[#55514A] max-mob:min-h-[50px] max-mob:rounded-[12px] max-mob:text-[14.5px]"
            onClick={onIgnore}
          >
            {t("ignore")}
          </Button>
        </div>
      </div>
    </Popover>
  );
}
