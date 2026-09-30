"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { mobileSheetClasses } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export interface AnchoredPopoverProps {
  /** Viewport coordinates from `anchorXY`. */
  left: number;
  top: number;
  /** Category pill: label plus its colour and tint. */
  cat: string;
  color: string;
  tint: string;
  /** "3 / 7" position within the findings list. */
  pos: string;
  onPrev: (event: React.MouseEvent<HTMLElement>) => void;
  onNext: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
}

/**
 * The finding popover shared by Vérification and Lisibilité: a fixed card
 * anchored to the run that was clicked, with a category pill and prev/next
 * through the findings (markup.html:799-834).
 *
 * Below 760px it becomes a self-scrimming bottom sheet.
 */
export function AnchoredPopover({
  left,
  top,
  cat,
  color,
  tint,
  pos,
  onPrev,
  onNext,
  children,
}: AnchoredPopoverProps) {
  const t = useTranslations("common");

  return (
    <div
      style={{ left, top }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "animate-pt-pop fixed z-[90] w-[334px] max-w-[86vw] rounded-[13px] border border-[rgba(20,18,15,.1)]",
        "bg-white text-left text-[13px] text-[#14120F] shadow-[0_18px_44px_rgba(20,18,15,.17)]",
        mobileSheetClasses({ touchTargets: false }),
      )}
    >
      <div className="flex items-center gap-2 border-b border-[rgba(20,18,15,.07)] px-3 pt-2.5 pb-[9px]">
        <span
          style={{ color, background: tint }}
          className="rounded-full px-[9px] py-1 text-[10px] font-bold uppercase tracking-[.1em]"
        >
          {cat}
        </span>
        <span className="flex-1" />
        <span className="text-[11.5px] tabular-nums text-[#8A857C]">{pos}</span>
        <button
          type="button"
          onClick={onPrev}
          aria-label={t("findingPrev")}
          className="grid h-6 w-6 cursor-pointer place-items-center rounded-[7px] border border-[rgba(20,18,15,.12)] bg-transparent font-sans text-[11px] text-[#4A4741] hover:border-[#049FDE] hover:text-[#049FDE]"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={t("findingNext")}
          className="grid h-6 w-6 cursor-pointer place-items-center rounded-[7px] border border-[rgba(20,18,15,.12)] bg-transparent font-sans text-[11px] text-[#4A4741] hover:border-[#049FDE] hover:text-[#049FDE]"
        >
          ›
        </button>
      </div>
      <div className="px-[13px] pt-3 pb-[13px]">{children}</div>
    </div>
  );
}
