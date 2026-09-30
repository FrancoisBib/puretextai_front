import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ProgressBarProps {
  /** 0-100 */
  percent: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

/** Thin 4px rounded progress track with an animated accent-blue fill. */
export function ProgressBar({ percent, className, trackClassName, barClassName }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={cn("h-[4px] rounded-[3px] bg-[#EDEAE4] overflow-hidden", trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-[3px] bg-[#049FDE] transition-[width] duration-300 ease-in-out", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
