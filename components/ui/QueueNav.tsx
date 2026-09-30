"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./IconButton";

export interface QueueNavProps {
  pos: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  /** Icon button edge length. Source uses 25px (Correction/Humanize) and 23px (Similarité/Lisibilité). */
  size?: number;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
}

/** Recurring "← n/N →" queue header row: two square nav IconButtons plus a tabular-nums counter. */
export function QueueNav({
  pos,
  total,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  size = 25,
  prevLabel = "Précédent",
  nextLabel = "Suivant",
  className,
}: QueueNavProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconButton size={size} onClick={onPrev} disabled={prevDisabled} aria-label={prevLabel}>
        ←
      </IconButton>
      <IconButton size={size} onClick={onNext} disabled={nextDisabled} aria-label={nextLabel}>
        →
      </IconButton>
      <span className="flex-1" />
      <span className="text-[12px] font-semibold text-[#55514A] tabular-nums">
        {pos} / {total}
      </span>
    </div>
  );
}
