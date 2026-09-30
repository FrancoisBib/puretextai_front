"use client";

import { useEffect, useRef } from "react";

/**
 * Port of the source's `_fit` / `_floorFit` / `_fitAll` block
 * (script_block.txt:747-796). Mount once, at the shell level.
 *
 * Two jobs:
 *
 * 1. **Auto-height** — every `textarea[data-grow]` grows to fit its content
 *    instead of scrolling. If the user drags the resize handle, that height
 *    becomes a floor the textarea never shrinks below again.
 * 2. **Viewport floor (mobile only)** — below 760px the editor should fill what
 *    is left of the screen, so `min-height` is recomputed from the viewport
 *    minus the rest of its card (`[data-editor-card]`) below it, and minus any
 *    bottom bar pinned over it (`[data-fixed-bar]`: the tab's action bar, or
 *    the Compteur live count).
 *
 * The mirror div behind the Correction editor carries `data-growmirror` and is
 * measured too — it sizes the textarea layered on top of it.
 */

/** The design's 760px breakpoint — the viewport floor only applies below it. */
const MOBILE_MAX = 760;
/** Smallest editor height the floor may produce, and the gap kept under it. */
const MIN_FLOOR = 170;
const BOTTOM_GAP = 14;

type GrowTextarea = HTMLTextAreaElement & { _autoH?: number };
type FloorElement = HTMLElement & { _mh0?: string };

export function useAutogrowTextareas() {
  const floors = useRef(new WeakMap<HTMLTextAreaElement, number>());
  const refit = useRef<() => void>(() => {});

  useEffect(() => {
    const fit = (t: GrowTextarea) => {
      if (!t.isConnected) return;
      const floor = floors.current.get(t) ?? 0;
      t.style.height = "auto";
      const h = Math.max(t.scrollHeight, floor);
      t.style.height = `${h}px`;
      t._autoH = h;
    };

    const floorFit = () => {
      const mobile = window.innerWidth <= MOBILE_MAX;

      // Tallest bottom bar currently pinned over the content.
      let barH = 0;
      document.querySelectorAll<HTMLElement>("[data-fixed-bar]").forEach((bar) => {
        const c = getComputedStyle(bar);
        if (c.position === "fixed" && c.display !== "none") {
          barH = Math.max(barH, bar.getBoundingClientRect().height);
        }
      });

      document
        .querySelectorAll<FloorElement>("textarea[data-grow], [data-growmirror]")
        .forEach((el) => {
          if (el._mh0 === undefined) el._mh0 = el.style.minHeight || "";
          if (!mobile) {
            el.style.minHeight = el._mh0;
            return;
          }
          const rect = el.getBoundingClientRect();
          // The card is tagged rather than found by tag name: our Card
          // primitive renders a div, so `closest("section")` would miss it and
          // the editor would grow far enough to hide its own footer.
          const card = el.closest("[data-editor-card]");
          const foot = card ? Math.max(0, card.getBoundingClientRect().bottom - rect.bottom) : 0;
          const avail = window.innerHeight - rect.top - foot - barH - BOTTOM_GAP;
          el.style.minHeight = `${Math.max(MIN_FLOOR, Math.round(avail))}px`;
        });
    };

    const fitAll = () => {
      floorFit();
      document.querySelectorAll<GrowTextarea>("textarea[data-grow]").forEach(fit);
    };
    refit.current = fitAll;

    const onInput = (e: Event) => {
      const t = e.target as GrowTextarea | null;
      if (t?.matches?.("textarea[data-grow]")) fit(t);
    };

    // A manual drag of the resize handle leaves a height that differs from the
    // one we computed — remember it as this textarea's new floor.
    const onMouseUp = () => {
      document.querySelectorAll<GrowTextarea>("textarea[data-grow]").forEach((t) => {
        const h = parseFloat(t.style.height || "0");
        if (h && t._autoH && Math.abs(h - t._autoH) > 2) {
          floors.current.set(t, h);
          t._autoH = h;
        }
      });
    };

    document.addEventListener("input", onInput);
    document.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", fitAll);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", fitAll);

    let moRaf: number | null = null;
    const mo = new MutationObserver(() => {
      if (moRaf !== null) return;
      moRaf = requestAnimationFrame(() => {
        moRaf = null;
        fitAll();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const initial = requestAnimationFrame(fitAll);

    return () => {
      document.removeEventListener("input", onInput);
      document.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", fitAll);
      vv?.removeEventListener("resize", fitAll);
      mo.disconnect();
      cancelAnimationFrame(initial);
      if (moRaf !== null) cancelAnimationFrame(moRaf);
    };
  }, []);

  // The source refits in componentDidUpdate: state changes swap editors in and
  // out without necessarily touching the child list the observer watches.
  useEffect(() => {
    const id = requestAnimationFrame(() => refit.current());
    return () => cancelAnimationFrame(id);
  });
}
