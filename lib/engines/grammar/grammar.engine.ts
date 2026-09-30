/**
 * Pure port of the Correction module's logic: `live()`, `queue()`,
 * `advance()`, `snapshot()` and the segment-building block inside
 * `renderVals()`. No React/Zustand imports — this module only takes
 * plain data in and returns plain data out.
 */

import { CAT, type Fix, type FixCategory } from "./fixes.data";

export type FixStatus = "applied" | "ignored";
export type HandledMap = Record<number, FixStatus>;
export type FixFilter = "Tout" | FixCategory;

export const FIX_FILTERS: FixFilter[] = ["Tout", "Orthographe", "Grammaire", "Style", "Vocabulaire", "Ponctuation"];

/** Fixes that still apply to `text` and haven't been handled or muted. */
export function liveFixes(text: string, handled: HandledMap, muted: string[], fixes: Fix[]): Fix[] {
  return fixes.filter((f) => !handled[f.id] && !muted.includes(f.rule) && text.indexOf(f.from) !== -1);
}

/** The live fixes narrowed down to the active category filter. */
export function queueFixes(live: Fix[], filter: FixFilter): Fix[] {
  return live.filter((x) => filter === "Tout" || x.cat === filter);
}

/** Counts of live fixes per filter bucket, for the filter-pill badges. */
export function countFixesByFilter(live: Fix[]): Record<FixFilter, number> {
  const counts: Record<FixFilter, number> = {
    Tout: live.length,
    Orthographe: 0,
    Grammaire: 0,
    Style: 0,
    Vocabulaire: 0,
    Ponctuation: 0,
  };
  live.forEach((f) => {
    counts[f.cat]++;
  });
  return counts;
}

/**
 * Which fix id should become active after `fromId` is resolved (applied,
 * ignored). Prefers the next item in the queue, falls back to the
 * previous, then the first; returns null if the queue only had that item.
 */
export function advanceFix(queue: Fix[], fromId: number): number | null {
  const i = queue.findIndex((x) => x.id === fromId);
  const nextFix = queue[i + 1] || queue[i - 1] || queue[0];
  return nextFix && nextFix.id !== fromId ? nextFix.id : null;
}

export interface FixSnapshot {
  text: string;
  handled: HandledMap;
  muted: string[];
}

/** Deep-ish snapshot used to power the "Annuler" (undo) toast action. */
export function snapshotOf(text: string, handled: HandledMap, muted: string[]): FixSnapshot {
  return { text, handled: { ...handled }, muted: muted.slice() };
}

/** Finds the fix whose `from` range contains the caret position, if any. */
export function findFixAtCaret(text: string, live: Fix[], caretPos: number): Fix | null {
  return (
    live.find((f) => {
      const i = text.indexOf(f.from);
      return i !== -1 && caretPos >= i && caretPos <= i + f.from.length;
    }) || null
  );
}

export interface CorrectionSegment {
  key: string;
  /** Empty string for plain-text runs, the fix id for flagged runs. */
  id: number | "";
  text: string;
  bg: string;
  deco: "underline" | "none";
  decoColor: string;
  cat?: FixCategory;
  catColor?: string;
  rule?: string;
  from?: string;
  to?: string;
  why?: string;
  open: boolean;
  popTop?: string;
  popBottom?: string;
  popLeft?: string;
  popRight?: string;
  /** The underlying fix, so a selector can wire apply/ignore/mute handlers. */
  fix?: Fix;
}

/**
 * Splits `text` into highlighted/plain runs around the live fixes found in
 * it, ported from the `segments` block of `renderVals()`. `flipUp`/
 * `flipRight` control which corner the popover expands from (computed by
 * the UI layer from DOM measurements, mirroring the original `place()`).
 */
export function buildCorrectionSegments(
  text: string,
  live: Fix[],
  activeId: number | null,
  popOpen: boolean,
  flipUp: boolean,
  flipRight: boolean
): CorrectionSegment[] {
  const marks = live
    .map((f) => ({ f, at: text.indexOf(f.from) }))
    .filter((m) => m.at !== -1)
    .sort((a, b) => a.at - b.at);

  const active = live.find((f) => f.id === activeId) || null;
  const segments: CorrectionSegment[] = [];
  let cursor = 0;

  marks.forEach((m, i) => {
    if (m.at > cursor) {
      segments.push({
        key: "p" + i,
        id: "",
        text: text.slice(cursor, m.at),
        bg: "transparent",
        deco: "none",
        decoColor: "transparent",
        open: false,
      });
    }
    const isActive = !!(active && m.f.id === active.id);
    segments.push({
      key: "f" + m.f.id,
      id: m.f.id,
      text: text.slice(m.at, m.at + m.f.from.length),
      bg: isActive ? "rgba(4,159,222,.13)" : "transparent",
      deco: "underline",
      decoColor: CAT[m.f.cat],
      cat: m.f.cat,
      catColor: CAT[m.f.cat],
      rule: m.f.rule,
      from: m.f.from,
      to: m.f.to,
      why: m.f.why,
      open: !!(isActive && popOpen),
      popTop: flipUp ? "auto" : "calc(100% + 10px)",
      popBottom: flipUp ? "calc(100% + 10px)" : "auto",
      popLeft: flipRight ? "auto" : "-10px",
      popRight: flipRight ? "-10px" : "auto",
      fix: m.f,
    });
    cursor = m.at + m.f.from.length;
  });

  segments.push({
    key: "tail",
    id: "",
    text: text.slice(cursor),
    bg: "transparent",
    deco: "none",
    decoColor: "transparent",
    open: false,
  });

  return segments;
}

/** Applies every currently-live fix to `text`, returning the new text + handled map. */
export function applyAllFixes(text: string, live: Fix[], handled: HandledMap): { text: string; handled: HandledMap } {
  let t = text;
  const h = { ...handled };
  live.forEach((f) => {
    t = t.replace(f.from, f.to);
    h[f.id] = "applied";
  });
  return { text: t, handled: h };
}

/** Marks every currently-live fix as ignored, returning the new handled map. */
export function ignoreAllFixes(live: Fix[], handled: HandledMap): HandledMap {
  const h = { ...handled };
  live.forEach((f) => {
    h[f.id] = "ignored";
  });
  return h;
}
