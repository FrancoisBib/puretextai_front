"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SegmentedControlOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
  /** Optional per-option text tint (used by the "Intensité" control). */
  color?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Track background. Source uses #F1EFEA (view toggle) or #EFEDE7 (Intensité). */
  trackClassName?: string;
  "aria-label"?: string;
}

/**
 * Pill-track segmented control: #F1EFEA/#EFEDE7 track, radius 8-9px, 3px
 * padding, active option gets an inset white pill with a soft shadow. Used
 * for Source/Résultat/Différences and Intensité.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  trackClassName,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-[9px] bg-[#F1EFEA] p-[3px]", trackClassName, className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            style={{ color: opt.color }}
            className={cn(
              "relative rounded-[7px] px-3 py-[6px] font-sans text-[12.5px] cursor-pointer whitespace-nowrap",
              opt.color ? "font-semibold" : "font-medium",
              !opt.color && "text-[#4A4741]",
              active ? "bg-white shadow-[0_1px_2px_rgba(20,18,15,.1)]" : "bg-transparent"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
