"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Closes an open menu/dropdown when a `mousedown` lands outside the
 * returned ref's element. Ported from the source DCLogic component's
 * `componentDidMount` global `mousedown` listener (it closed the lang
 * menu on a click outside `[data-lang-menu]` and the avatar menu on a
 * click outside `[data-avatar-menu]`).
 *
 * Reusable for any trigger+dropdown pair (lang menu, avatar menu, the
 * Humanisation tone menu, …): pass `active` (whether the dropdown is
 * currently open) and `onOutside` (called once on the first outside
 * `mousedown`), and attach the returned ref to the menu's outermost
 * wrapper (the element containing both the trigger button and the
 * dropdown panel).
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  active: boolean,
  onOutside: () => void
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;

    function handleMouseDown(event: MouseEvent) {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        onOutside();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [active, onOutside]);

  return ref;
}
