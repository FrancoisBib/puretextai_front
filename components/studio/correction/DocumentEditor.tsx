"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, Textarea, Button } from "@/components/ui";
import { InlineFixPopover } from "./InlineFixPopover";
import type { CorrectionView, CorrectionSegmentVM } from "@/lib/store/selectors/correction";

export interface DocumentEditorProps {
  view: CorrectionView;
  /** "412 / 1 000 mots" on the free plan; empty on Studio. */
  budget: string;
  budgetColor: string;
}

/**
 * The layered document editor: an `aria-hidden` div renders the marked-up
 * text (plain runs + colored-underline flagged runs, with an inline fix
 * popover for the active/open segment) UNDERNEATH a transparent-text real
 * `<textarea>` positioned `absolute inset-0` on top. The textarea is what
 * actually receives typing/selection (its text is invisible — only the
 * caret/selection show); the div underneath supplies the colored markup and
 * hosts the click-to-fix popover.
 *
 * `data-growmirror` lets `useAutogrowTextareas` give the mirror a viewport-
 * derived minimum height on phones.
 */
export function DocumentEditor({ view, budget, budgetColor }: DocumentEditorProps) {
  const t = useTranslations("studio.correction");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    view.onText(e.target.value);
  };

  const handleCaret = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    view.onCaret(e.currentTarget.selectionStart ?? 0);
  };

  const statusLabel = view.cBusy
    ? t("analyzing")
    : !view.analyzed
      ? t("status.notRun")
      : view.suggestionCount
        ? t("status.suggestionCount", { count: view.suggestionCount })
        : t("status.noSuggestion");

  return (
    <Card elevation="lg" data-editor-card>
      <div className="flex flex-wrap items-center gap-[11px] rounded-t-[16px] border-b border-[rgba(20,18,15,.07)] px-5 py-[13px]">
        <span className="text-[13.5px] font-semibold">{t("yourText")}</span>
        {budget && (
          <span style={{ color: budgetColor }} className="text-[12px] tabular-nums">
            {budget}
          </span>
        )}
        <span className="flex-1" />
        <span className="inline-flex items-center gap-[7px] text-[12px] text-[#8A857C]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: view.statusDot }} />
          {statusLabel}
        </span>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          data-growmirror="1"
          style={{
            position: "relative",
            padding: "23px 25px",
            fontFamily: "inherit",
            fontSize: "15.5px",
            lineHeight: 1.85,
            letterSpacing: 0,
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            color: "transparent",
            minHeight: "max(306px, calc(100dvh - 330px))",
            pointerEvents: "none",
          }}
        >
          {view.segments.map((seg) => (
            <Segment key={seg.key} seg={seg} onClosePop={view.closePop} />
          ))}
        </div>

        <Textarea
          value={view.text}
          onChange={handleChange}
          onClick={handleCaret}
          onKeyUp={handleCaret}
          spellCheck={false}
          className="absolute inset-0 z-[2] h-full overflow-hidden"
        />
      </div>

      <div className="relative z-[1] flex items-center gap-[11px] rounded-b-[16px] border-t border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-5 py-[11px]">
        <span className="flex-1" />
        <Button
          variant="outline"
          hoverAccent
          className="rounded-[8px] px-[13px] py-2 text-[13px] font-medium text-[#14120F]"
          onClick={view.clearText}
        >
          {t("clear")}
        </Button>
        <Button
          variant="dark"
          className="rounded-[8px] px-[13px] py-2 text-[13px] font-semibold"
          onClick={view.copyText}
        >
          {view.copied ? t("copied") : t("copy")}
        </Button>
      </div>
    </Card>
  );
}

/** Renders one plain or flagged run, plus its inline fix popover when open. */
function Segment({ seg, onClosePop }: { seg: CorrectionSegmentVM; onClosePop: () => void }) {
  const t = useTranslations("studio.correction");

  if (seg.id === "") {
    return <span>{seg.text}</span>;
  }

  return (
    <span
      data-flag={seg.id}
      style={{
        position: "relative",
        borderRadius: 3,
        background: seg.bg,
        textDecorationLine: seg.deco,
        textDecorationColor: seg.decoColor,
        textDecorationThickness: "2px",
        textUnderlineOffset: "4px",
        textDecorationSkipInk: "none",
      }}
    >
      {seg.text}
      {seg.open && (
        <InlineFixPopover
          style={{
            top: seg.popTop,
            bottom: seg.popBottom,
            left: seg.popLeft,
            right: seg.popRight,
          }}
          cat={seg.cat ? t(`categories.${seg.cat}`) : ""}
          catColor={seg.catColor ?? "#049FDE"}
          rule={seg.rule ?? ""}
          from={seg.from ?? ""}
          to={seg.to ?? ""}
          why={seg.why ?? ""}
          onApply={seg.apply}
          onIgnore={seg.ignore}
          onClose={onClosePop}
        />
      )}
    </span>
  );
}
