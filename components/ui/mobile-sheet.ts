/**
 * Below 760px the design turns every floating surface — inline popovers, the
 * account menu, the extension panel — into a bottom sheet: full-width, pinned
 * to the bottom edge, rounded at the top, with a grab handle and a scrim.
 *
 * These are the class lists for that transform, kept in one place because four
 * different surfaces share them (source: markup.html:53-81).
 *
 * The geometry utilities are marked `!important` on purpose. These surfaces are
 * positioned at runtime — an anchored popover carries inline `left`/`top`, a
 * menu an inline `width` — and inline styles otherwise win over a media query.
 * The source does the same thing for the same reason.
 */

import { cn } from "@/lib/utils/cn";

/** Geometry: pin to the bottom edge, full width, scrollable, safe-area padded. */
const SHEET_BOX = [
  "max-mob:fixed! max-mob:inset-x-0! max-mob:top-auto! max-mob:bottom-0!",
  "max-mob:w-auto! max-mob:max-w-none! max-mob:z-[60]!",
  "max-mob:rounded-t-[20px]! max-mob:rounded-b-none!",
  "max-mob:max-h-[90dvh] max-mob:overflow-y-auto max-mob:overscroll-contain",
  "max-mob:pt-[22px]! max-mob:pb-[calc(18px+env(safe-area-inset-bottom,0px))]!",
  "max-mob:animate-pt-sheet",
].join(" ");

/** The 38×4 grab handle centred at the top of the sheet. */
const SHEET_HANDLE = [
  "max-mob:before:content-[''] max-mob:before:absolute max-mob:before:top-[9px]",
  "max-mob:before:left-1/2 max-mob:before:-translate-x-1/2",
  "max-mob:before:w-[38px] max-mob:before:h-[4px] max-mob:before:rounded-full",
  "max-mob:before:bg-[rgba(20,18,15,.18)]",
].join(" ");

/** Touch targets inside a sheet grow to 50px — the design's phone minimum. */
const SHEET_TOUCH = [
  "max-mob:[&_button]:min-h-[50px] max-mob:[&_button]:text-[14.5px]",
  "max-mob:[&_button]:px-[18px] max-mob:[&_button]:py-[13px] max-mob:[&_button]:rounded-[12px]",
].join(" ");

/** A self-scrimming sheet: the shadow spread paints the whole viewport. */
const SHEET_SCRIM = "max-mob:shadow-[0_0_0_100vmax_rgba(20,18,15,.38)]!";

/** A sheet whose scrim is a separate element (the Correction popover). */
const SHEET_SHADOW = "max-mob:shadow-[0_-10px_34px_rgba(20,18,15,.18)]!";

export interface MobileSheetOptions {
  /** false when a separate scrim element is rendered behind the sheet. */
  scrim?: boolean;
  /** false to keep the surface's own button sizing (e.g. icon-only rows). */
  touchTargets?: boolean;
}

export function mobileSheetClasses({ scrim = true, touchTargets = true }: MobileSheetOptions = {}): string {
  return cn(SHEET_BOX, SHEET_HANDLE, touchTargets && SHEET_TOUCH, scrim ? SHEET_SCRIM : SHEET_SHADOW);
}
