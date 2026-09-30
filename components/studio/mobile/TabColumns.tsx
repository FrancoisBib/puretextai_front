"use client";

import type { CSSProperties } from "react";

import type { MobileTab } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";

export interface TabColumnsProps {
  /** Desktop grid template, e.g. "minmax(0, 1.7fr) minmax(264px, .9fr)". */
  columns: string;
  mTab: MobileTab;
  /** The editor column — normally the tab's `<section>` card. */
  main: React.ReactNode;
  /** The results column; rendered as an `<aside>`. */
  aside: React.ReactNode;
  /** Sticky offset of the aside, in px (86 on Correction/Humanisation, 78 elsewhere). */
  asideTop?: number;
  /** Extra node placed inside the grid, e.g. the Compteur's fixed live bar. */
  children?: React.ReactNode;
  asideClassName?: string;
}

/**
 * The two-column module layout: side by side above 1023px, stacked below it,
 * and below 760px only the half the mobile tab selects
 * (markup.html:31-50, `[data-r="cols"]`).
 *
 * The per-tab template and sticky offset travel as CSS variables rather than
 * inline `grid-template-columns` / `top`, so the responsive classes can
 * override them — an inline style would win over a media query.
 */
export function TabColumns({
  columns,
  mTab,
  main,
  aside,
  asideTop = 78,
  children,
  asideClassName,
}: TabColumnsProps) {
  return (
    <div
      style={{ "--pt-cols": columns } as CSSProperties}
      className="grid grid-cols-[var(--pt-cols)] items-start gap-5 [&>*]:min-w-0 max-tab:grid-cols-[minmax(0,1fr)]"
    >
      <div className={cn("min-w-0", mTab === "res" && "max-mob:hidden")}>{main}</div>
      <aside
        style={{ "--pt-aside-top": `${asideTop}px` } as CSSProperties}
        className={cn(
          "sticky top-[var(--pt-aside-top)] flex min-w-0 flex-col gap-[18px] max-tab:static max-tab:top-auto",
          mTab === "text" && "max-mob:hidden",
          asideClassName,
        )}
      >
        {aside}
      </aside>
      {children}
    </div>
  );
}
