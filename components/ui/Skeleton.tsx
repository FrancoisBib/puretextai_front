import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AnalysisSkeletonProps {
  /** Line shown next to the pulsing dot, e.g. "Analyse de votre texte…". */
  label: React.ReactNode;
  /**
   * Skeleton line widths, grouped: a hairline separates one group from the
   * next, the way the design's loading blocks are laid out.
   */
  groups: string[][];
  /** The Correction sidebar uses tighter type and spacing than the main panels. */
  dense?: boolean;
  className?: string;
}

/**
 * The "…en cours" placeholder shared by Correction, Humanisation and
 * Lisibilité while their simulated pass runs.
 */
export function AnalysisSkeleton({ label, groups, dense = false, className }: AnalysisSkeletonProps) {
  return (
    <div className={className}>
      <span
        className={cn(
          "mb-[14px] flex items-center gap-2 text-[#55514A]",
          dense ? "text-[12.5px]" : "mb-[18px] text-[13px]",
        )}
      >
        <span className="animate-pt-pulse h-[7px] w-[7px] flex-none rounded-full bg-[#049FDE]" />
        {label}
      </span>
      <span className={cn("flex flex-col", dense ? "gap-[9px]" : "gap-3")}>
        {groups.map((widths, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && (
              <span
                className={cn(
                  "block h-px bg-[rgba(20,18,15,.07)]",
                  dense ? "my-[6px]" : "my-2",
                )}
              />
            )}
            {widths.map((w, i) => (
              <span
                key={`${gi}-${i}`}
                style={{ width: w }}
                className="animate-pt-skel block h-[11px] rounded-[6px] bg-[rgba(20,18,15,.09)]"
              />
            ))}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}
