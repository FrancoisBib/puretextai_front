"use client";

import { cn } from "@/lib/utils/cn";

export interface ActionBarProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * A tab's primary action row. Inline next to the heading on desktop; below
 * 760px it detaches and pins itself over the bottom edge of the screen, its
 * buttons stretched to equal widths (markup.html:51-52, `[data-r="cta"]`).
 *
 * `data-fixed-bar` is what `useAutogrowTextareas` measures to keep the editor
 * from running underneath it.
 */
export function ActionBar({ className, children }: ActionBarProps) {
  return (
    <div
      data-fixed-bar
      className={cn(
        "flex flex-wrap items-center gap-[9px]",
        "max-mob:fixed max-mob:inset-x-0 max-mob:bottom-0 max-mob:z-[42] max-mob:m-0",
        "max-mob:border-t max-mob:border-[rgba(20,18,15,.09)] max-mob:bg-[rgba(246,245,242,.96)] max-mob:backdrop-blur-[10px]",
        "max-mob:px-[13px] max-mob:pt-[9px] max-mob:pb-[calc(9px+env(safe-area-inset-bottom,0px))]",
        "max-mob:[&>a]:min-h-[44px] max-mob:[&>button]:min-h-[44px] max-mob:[&>a]:flex-1 max-mob:[&>button]:flex-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
