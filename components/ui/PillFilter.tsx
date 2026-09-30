"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PillFilterProps {
  label: React.ReactNode;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  /**
   * Border/text color used when inactive (e.g. a category color). Defaults
   * to the neutral look the source actually uses for the Correction filters
   * (border rgba(20,18,15,.12), text #55514A) — active state is always a
   * solid #14120F pill with white text regardless of this prop.
   */
  color?: string;
  /** Category swatch shown before the label; "transparent" renders a ring instead. */
  dot?: string;
  dotRing?: string;
  className?: string;
}

/** Outlined/filled toggle pill with a trailing, dimmed count badge. */
export function PillFilter({ label, count, active = false, onClick, color, dot, dotRing, className }: PillFilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={!active ? { borderColor: color ?? "rgba(20,18,15,.12)", color: color ?? "#55514A" } : undefined}
      className={cn(
        "relative rounded-full border px-2.5 py-[5px] font-sans text-[12px] font-semibold cursor-pointer transition-colors duration-150",
        active
          ? "border-[#14120F] bg-[#14120F] text-white"
          : "bg-transparent hover:border-[rgba(20,18,15,.3)]",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {dot && (
          <span
            aria-hidden
            style={{ background: dot, boxShadow: dotRing }}
            className="h-[7px] w-[7px] flex-none rounded-full"
          />
        )}
        {label}
        {count !== undefined && <span className="tabular-nums opacity-65">{count}</span>}
      </span>
    </button>
  );
}
