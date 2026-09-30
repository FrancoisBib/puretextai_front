"use client";

import { useTranslations } from "next-intl";
import type { HumanSentenceVM } from "@/lib/store/selectors/humanize";

export interface ResultViewProps {
  sentences: HumanSentenceVM[];
}

/**
 * Humanized-result paragraph: each sentence is a hoverable/clickable
 * `<span>`; clicking a changed sentence expands an inline detail block
 * (label, alternate text, why, keep/revert toggle) that pushes the rest of
 * the paragraph down — it is `display: block` inside the sentence span in
 * design.html (lines 344-358), not an absolutely-positioned popover, so it
 * is built directly here rather than via the `Popover` primitive.
 *
 * The close (✕) and keep/revert buttons call `e.stopPropagation()` before
 * their action: in design.html the whole sentence `<span>` also carries
 * `onClick={{ s.toggle }}`, and without stopping propagation a click on
 * those inner buttons would bubble up and immediately re-toggle the panel
 * right after closing/acting on it.
 */
export function ResultView({ sentences }: ResultViewProps) {
  const t = useTranslations("studio.humanize");
  const tCommon = useTranslations("common");

  return (
    <p className="m-0 px-[25px] pb-[22px] pt-[23px] text-[15.5px] leading-[1.9]">
      {sentences.map((s, i) => (
        <span
          key={i}
          onMouseEnter={s.enter}
          onMouseLeave={s.leave}
          onClick={s.toggle}
          style={{ background: s.bg, boxShadow: s.ring, color: s.color, cursor: s.cursor }}
          className="rounded-[4px] py-px transition-[background] duration-[180ms] ease-in-out"
        >
          {s.text}
          {s.open && (
            <span className="my-[11px] mb-[14px] block cursor-default rounded-[11px] border border-[rgba(20,18,15,.1)] bg-[#FCFBF9] p-[13px_14px] shadow-[0_1px_2px_rgba(20,18,15,.04)]">
              <span className="mb-[7px] flex items-baseline gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#049FDE]">
                  {s.reverted ? t("sentence.originalPrefix") : t("sentence.proposedPrefix")}
                  {s.panelTag}
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    s.close();
                  }}
                  aria-label={tCommon("close")}
                  className="rounded-none border-0 bg-transparent p-[2px] font-sans text-[12.5px] leading-none text-[#A8A29A] cursor-pointer hover:text-[#14120F]"
                >
                  ✕
                </button>
              </span>
              <span className="mb-2 block text-[13.5px] leading-[1.7] text-[#14120F]">
                {s.panelText ?? t("sentence.originalFallback")}
              </span>
              <span className="mb-3 block text-[12.5px] leading-[1.6] text-[#8A857C]">{s.why}</span>
              <span className="flex items-center gap-[9px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    s.toggleKeep();
                  }}
                  style={{ background: s.actionBg, borderColor: s.actionBorder, color: s.actionColor }}
                  className="rounded-[8px] border px-[14px] py-2 font-sans text-[12.5px] font-semibold cursor-pointer"
                >
                  {s.reverted ? t("sentence.keepRewrite") : t("sentence.restoreOriginal")}
                </button>
                <span className="text-xs text-[#A8A29A]">
                  {s.reverted ? t("sentence.originalInPlace") : t("sentence.rewriteInPlace")}
                </span>
              </span>
            </span>
          )}
        </span>
      ))}
    </p>
  );
}
