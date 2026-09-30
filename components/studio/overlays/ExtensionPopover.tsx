"use client";

import { useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectShellView } from "@/lib/store/selectors/shell";
import { DEFAULT_STUDIO_CONFIG, resolveTone } from "@/lib/store/types";
import { mobileSheetClasses } from "@/components/ui";

/**
 * Global fixed bottom-right "browser extension" popover, rendered outside
 * the tab `sc-if` chain so it can appear on top of any tab. Only rendered
 * when the resolved `extOpen` (from `resolveExtOpen` via the shell
 * selector's `extOpen`) is true. Ported verbatim (copy/colors/spacing/
 * radii) from the `extOpen` block in `design.html`.
 */
export function ExtensionPopover() {
  const v = useStudioStore(selectShellView);
  const t = useTranslations("overlays.extension");
  const tHumanize = useTranslations("studio.humanize");
  const tone = useStudioStore((s) => resolveTone(s, DEFAULT_STUDIO_CONFIG));

  if (!v.extOpen) return null;

  return (
    <div
      className={`animate-pt-up fixed overflow-hidden bg-white ${mobileSheetClasses({ touchTargets: false })}`}
      style={{
        right: 23,
        bottom: 23,
        width: 335,
        border: "1px solid rgba(20,18,15,.1)",
        borderRadius: 18,
        boxShadow: "0 24px 60px rgba(20,18,15,.2)",
        zIndex: 40,
      }}
    >
      <div
        className="flex items-center gap-[9px]"
        style={{ padding: "12px 14px", borderBottom: "1px solid rgba(20,18,15,.07)" }}
      >
        <span
          className="grid place-items-center rounded-[7px] text-white font-serif text-[12.5px]"
          style={{ width: 20, height: 20, background: "#049FDE" }}
        >
          P
        </span>
        <span className="text-[13px] font-semibold">{t("title")}</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={v.toggleExt}
          aria-label={t("close")}
          className="bg-transparent border-0 cursor-pointer text-[#8A857C] text-[14.5px] leading-none p-1 hover:text-[#14120F]"
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "13px 14px", background: "#FCFBF9", borderBottom: "1px solid rgba(20,18,15,.07)" }}>
        <div className="text-[10.5px] font-bold tracking-[.1em] uppercase text-[#8A857C] mb-[6px]">
          {t("selectionLabel")}
        </div>
        <p className="m-0 text-[13px] leading-[1.65] text-[#55514A]">{t("selectionDemo")}</p>
      </div>

      <div className="flex gap-2" style={{ padding: "13px 14px" }}>
        <button
          type="button"
          onClick={() => v.extCorrect(t("demoOutput.correct"), t("label.correct"), t("metaRules"))}
          className="flex-1 rounded-[9px] border-0 cursor-pointer font-sans text-[12.5px] font-semibold text-[#14120F] hover:bg-[#E8E5DE]"
          style={{ background: "#F1EFEA", padding: "9px 6px" }}
        >
          {t("correct")}
        </button>
        <button
          type="button"
          onClick={() =>
            v.extHumanize(
              t("demoOutput.humanize"),
              t("label.humanize"),
              t("metaTone", { tone: tHumanize(`tones.${tone}.label`).toLowerCase() }),
            )
          }
          className="flex-1 rounded-[9px] border-0 cursor-pointer font-sans text-[12.5px] font-semibold text-white hover:bg-[#0378A9]"
          style={{ background: "#049FDE", padding: "9px 6px" }}
        >
          {t("humanize")}
        </button>
        <button
          type="button"
          onClick={() =>
            v.extTone(
              t("demoOutput.tone"),
              t("labelTone", { tone: tHumanize(`tones.${tone}.label`) }),
              t("metaReformulated"),
            )
          }
          className="flex-1 rounded-[9px] border-0 cursor-pointer font-sans text-[12.5px] font-semibold text-[#14120F] hover:bg-[#E8E5DE]"
          style={{ background: "#F1EFEA", padding: "9px 6px" }}
        >
          {t("tone")}
        </button>
      </div>

      {v.extHasOut && (
        <div>
          <div style={{ padding: "0 14px 13px" }}>
            <div className="flex items-baseline gap-2 mb-[6px]">
              <span className="text-[10.5px] font-bold tracking-[.1em] uppercase text-[#049FDE]">{v.extLabel}</span>
              <span className="text-[11px] text-[#8A857C]">{v.extMeta}</span>
            </div>
            <p className="m-0 text-[13px] leading-[1.7]">{v.extOut}</p>
          </div>
          <div
            className="flex gap-2"
            style={{ padding: "11px 14px", borderTop: "1px solid rgba(20,18,15,.07)", background: "#FCFBF9" }}
          >
            <button
              type="button"
              onClick={v.extCopy}
              className="flex-1 rounded-[9px] border border-[rgba(20,18,15,.12)] bg-transparent cursor-pointer font-sans text-[12.5px] font-medium text-[#14120F] hover:border-[#049FDE] hover:text-[#049FDE]"
              style={{ padding: "8px 6px" }}
            >
              {t(v.extCopied ? "copied" : "copy")}
            </button>
            <button
              type="button"
              onClick={v.extReplace}
              className="flex-1 rounded-[9px] border-0 cursor-pointer font-sans text-[12.5px] font-semibold text-white hover:bg-[#049FDE]"
              style={{ background: "#14120F", padding: "8px 6px" }}
            >
              {t("replace")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
