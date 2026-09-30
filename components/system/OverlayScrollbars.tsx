"use client";

import { useEffect } from "react";

/**
 * Port of the design's `ptscroll.js`: thin, app-blue overlay scrollbars that
 * replace the native ones on the page and on every scrollable element, present
 * or added later.
 *
 * Values (thickness, fade delay, minimum thumb length, the .45/.7 opacities) are
 * the design's — see CLAUDE.md's fidelity rule before changing any of them.
 */

const BLUE = "#049FDE";
const THICK = 4; // resting thickness
const THICK_HOVER = 7; // while hovered or dragging
const MIN = 28; // minimum thumb length
const FADE = 900; // ms of idle before fading out
const RESCAN = 900; // ms between rescans for newly scrollable elements

const CSS = `
*{scrollbar-width:none;-ms-overflow-style:none}
*::-webkit-scrollbar{width:0;height:0}
.ptsb{position:absolute;z-index:2147483000;border-radius:999px;background:${BLUE};opacity:0;pointer-events:auto;cursor:pointer;transition:opacity .22s ease,width .14s ease,height .14s ease;box-shadow:0 0 0 1px rgba(4,159,222,.18)}
.ptsb.on{opacity:.45}
.ptsb.hot{opacity:.7}
.ptsb-host{position:fixed;top:0;left:0;width:0;height:0;z-index:2147483000}
`;

type Axis = "x" | "y";

interface Bar {
  layout: () => void;
  el: HTMLDivElement;
  target: Element;
  destroy: () => void;
}

function createBar(host: HTMLDivElement, target: Element, axis: Axis): Bar {
  const isWin = target === document.scrollingElement || target === document.documentElement;
  const el = document.createElement("div");
  el.className = "ptsb";
  host.appendChild(el);

  let hot = false;
  let drag: { start: number; pos: number } | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function metrics() {
    if (isWin) {
      const scroller = document.scrollingElement ?? document.documentElement;
      return {
        pos: axis === "y" ? window.scrollY : window.scrollX,
        client: axis === "y" ? window.innerHeight : window.innerWidth,
        scroll: axis === "y" ? scroller.scrollHeight : scroller.scrollWidth,
        rect: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
      };
    }
    const rect = target.getBoundingClientRect();
    return {
      pos: axis === "y" ? target.scrollTop : target.scrollLeft,
      client: axis === "y" ? target.clientHeight : target.clientWidth,
      scroll: axis === "y" ? target.scrollHeight : target.scrollWidth,
      rect,
    };
  }

  function layout() {
    const m = metrics();
    if (m.scroll - m.client < 2 || m.client < 40) {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
    const t = hot || drag ? THICK_HOVER : THICK;
    const track = m.client - 8;
    const len = Math.max(MIN, Math.round(track * (m.client / m.scroll)));
    const max = track - len;
    const off = max <= 0 ? 0 : Math.round(max * (m.pos / (m.scroll - m.client)));
    if (axis === "y") {
      el.style.width = `${t}px`;
      el.style.height = `${len}px`;
      el.style.left = `${Math.round(m.rect.left + m.rect.width - t - 3)}px`;
      el.style.top = `${Math.round(m.rect.top + 4 + off)}px`;
    } else {
      el.style.height = `${t}px`;
      el.style.width = `${len}px`;
      el.style.top = `${Math.round(m.rect.top + m.rect.height - t - 3)}px`;
      el.style.left = `${Math.round(m.rect.left + 4 + off)}px`;
    }
  }

  function show(sticky: boolean) {
    layout();
    el.classList.add("on");
    clearTimeout(timer);
    if (!sticky && !drag) {
      timer = setTimeout(() => {
        if (!hot && !drag) el.classList.remove("on");
      }, FADE);
    }
  }

  const onEnter = () => {
    hot = true;
    el.classList.add("hot");
    show(true);
  };
  const onLeave = () => {
    hot = false;
    el.classList.remove("hot");
    show(false);
  };
  const onDown = (e: PointerEvent) => {
    e.preventDefault();
    drag = { start: axis === "y" ? e.clientY : e.clientX, pos: metrics().pos };
    el.setPointerCapture(e.pointerId);
    el.classList.add("hot");
    show(true);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const m = metrics();
    const track = m.client - 8;
    const len = Math.max(MIN, track * (m.client / m.scroll));
    const max = track - len;
    if (max <= 0) return;
    const d = (axis === "y" ? e.clientY : e.clientX) - drag.start;
    const next = drag.pos + d * ((m.scroll - m.client) / max);
    if (isWin) window.scrollTo(axis === "y" ? { top: next } : { left: next });
    else if (axis === "y") target.scrollTop = next;
    else target.scrollLeft = next;
  };
  const onUp = () => {
    drag = null;
    if (!hot) el.classList.remove("hot");
    show(false);
  };
  const onScroll = () => show(false);
  const onTargetEnter = () => show(false);

  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);

  const scrollSource: Window | Element = isWin ? window : target;
  scrollSource.addEventListener("scroll", onScroll, { passive: true });
  target.addEventListener("pointerenter", onTargetEnter);

  layout();

  return {
    layout,
    el,
    target,
    destroy() {
      clearTimeout(timer);
      scrollSource.removeEventListener("scroll", onScroll);
      target.removeEventListener("pointerenter", onTargetEnter);
      el.remove();
    },
  };
}

function scrollable(el: Element) {
  const s = getComputedStyle(el);
  return {
    y: (s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight - el.clientHeight > 2,
    x: (s.overflowX === "auto" || s.overflowX === "scroll") && el.scrollWidth - el.clientWidth > 2,
  };
}

export function OverlayScrollbars() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const host = document.createElement("div");
    host.className = "ptsb-host";
    document.body.appendChild(host);

    const bars: Bar[] = [];
    const seen = new WeakSet<Element>();
    let writing = false;
    let raf: number | null = null;

    function scan() {
      const all = document.querySelectorAll("div,section,main,aside,ul,ol,pre,textarea,nav");
      all.forEach((el) => {
        if (seen.has(el) || el.closest(".ptsb-host")) return;
        const f = scrollable(el);
        if (!f.x && !f.y) return;
        seen.add(el);
        if (f.y) bars.push(createBar(host, el, "y"));
        if (f.x) bars.push(createBar(host, el, "x"));
      });
      for (let j = bars.length - 1; j >= 0; j--) {
        const b = bars[j];
        if (b.target !== document.documentElement && !document.contains(b.target)) {
          b.destroy();
          bars.splice(j, 1);
        }
      }
    }

    function layoutAll() {
      writing = true;
      bars.forEach((b) => b.layout());
      writing = false;
    }

    function nudge() {
      if (raf !== null || writing) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        layoutAll();
      });
    }

    bars.push(createBar(host, document.documentElement, "y"));
    scan();

    window.addEventListener("scroll", nudge, { passive: true, capture: true });
    window.addEventListener("resize", nudge);

    // childList only, and never react to our own bars
    const mo = new MutationObserver((recs) => {
      if (writing) return;
      for (const rec of recs) {
        const n = rec.target as Element;
        if (!(n.closest && n.closest(".ptsb-host"))) {
          nudge();
          return;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const interval = window.setInterval(() => {
      scan();
      layoutAll();
    }, RESCAN);

    return () => {
      window.clearInterval(interval);
      mo.disconnect();
      window.removeEventListener("scroll", nudge, { capture: true });
      window.removeEventListener("resize", nudge);
      if (raf !== null) cancelAnimationFrame(raf);
      bars.forEach((b) => b.destroy());
      host.remove();
      style.remove();
    };
  }, []);

  return null;
}
