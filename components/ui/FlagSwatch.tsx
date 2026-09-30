import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface FlagSwatchProps {
  /** CSS `background` value (solid color or gradient string), e.g. from a FLAGS[lang] map. */
  gradient: string;
  className?: string;
}

/**
 * Small 20x14px rounded rectangle rendering a language flag as a CSS
 * gradient. Runtime gradients can't be expressed as Tailwind classes, so the
 * `background` is applied inline.
 */
export function FlagSwatch({ gradient, className }: FlagSwatchProps) {
  return (
    <span
      style={{ background: gradient }}
      className={cn(
        "inline-block w-[20px] h-[14px] flex-none rounded-[3px] shadow-[inset_0_0_0_1px_rgba(20,18,15,.16)]",
        className
      )}
    />
  );
}
