"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { Sheet, SheetHandle } from "@/components/ui";
import { INTENSITY_KEYS, type IntensityOption, type ToneGroupVM } from "@/lib/store/selectors/humanize";
import { StudioLockBadge } from "./StudioLockBadge";

export interface TuneSheetProps {
  open: boolean;
  onClose: () => void;
  toneGroups: ToneGroupVM[];
  intensityOptions: IntensityOption[];
  intensityIndex: 0 | 1 | 2;
  hasResult: boolean;
}

/**
 * Mobile "Ton et intensité" sheet (markup.html:1305-1343): the full tone list
 * scrolls, the intensity segments sit in a pinned footer with the note that
 * explains the current one.
 */
export function TuneSheet({
  open,
  onClose,
  toneGroups,
  intensityOptions,
  intensityIndex,
  hasResult,
}: TuneSheetProps) {
  const t = useTranslations("studio.humanize");
  const router = useRouter();
  const key = INTENSITY_KEYS[intensityIndex];

  const choose = (item: { locked: boolean; pick: () => void }) => () => {
    if (item.locked) router.push("/tarifs");
    else item.pick();
  };

  return (
    <Sheet open={open} onClose={onClose} label={t("sheetTitle")} className="flex max-h-[86vh] flex-col">
      <div className="flex-none px-4 pt-2.5">
        <SheetHandle className="mb-[13px]" />
        <div className="flex items-center gap-2.5 border-b border-[rgba(20,18,15,.08)] pb-[11px]">
          <span className="text-[15px] font-semibold">{t("sheetTitle")}</span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent px-0.5 py-1.5 font-sans text-[13.5px] font-semibold text-[#049FDE]"
          >
            {t("done")}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pt-1 pb-1.5">
        {toneGroups.map((group) => (
          <div key={group.name}>
            <div className="px-2 pt-[11px] pb-[5px] text-[10px] font-bold uppercase tracking-[.1em] text-[#049FDE]">
              {t(`toneGroups.${group.name}`)}
            </div>
            {group.items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={choose(item)}
                style={{ background: item.bg }}
                className="block min-h-12 w-full cursor-pointer rounded-[11px] border-0 px-[9px] pt-[9px] pb-2.5 text-left font-sans"
              >
                <span
                  className="flex items-center gap-[7px] text-[14px] text-[#14120F]"
                  style={{ fontWeight: item.weight }}
                >
                  {t(`tones.${item.label}.label`)}
                  {item.locked && <StudioLockBadge />}
                  <span className="flex-1" />
                  <span className="text-[12px] text-[#049FDE]">{item.check}</span>
                </span>
                <span className="mt-0.5 block text-[12px] leading-[1.45] text-[#8A857C]">{t(`tones.${item.label}.desc`)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="flex-none border-t border-[rgba(20,18,15,.08)] bg-[#FCFBF9] px-3.5 pt-[13px] pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#8A857C]">
          {t("intensityPickerLabel")}
        </div>
        <div
          role="tablist"
          aria-label={t("intensityPickerLabel")}
          className="flex gap-[3px] rounded-[11px] bg-[#EFEDE7] p-[3px]"
        >
          {intensityOptions.map((o) => (
            <button
              key={o.index}
              type="button"
              role="tab"
              aria-selected={o.active}
              onClick={choose(o)}
              style={{ color: o.color }}
              className="relative min-h-[44px] flex-1 cursor-pointer rounded-[9px] border-0 bg-transparent px-1 py-[9px] font-sans text-[12.5px] font-semibold"
            >
              {o.active && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-[9px] bg-white shadow-[0_1px_3px_rgba(20,18,15,.12)]"
                />
              )}
              <span className="relative inline-flex flex-wrap items-center justify-center gap-1">
                {t(`intensity.${INTENSITY_KEYS[o.index]}`)}
                {o.locked && (
                  <StudioLockBadge className="rounded-full bg-[rgba(4,159,222,.12)] px-[5px] py-0.5 text-[8.5px] font-bold tracking-[.08em] text-[#049FDE]" />
                )}
              </span>
            </button>
          ))}
        </div>
        <p className="mx-0.5 mt-[9px] mb-0 text-[12px] leading-[1.5] text-pretty text-[#55514A]">
          {t(`intensityNote.${key}`)}{" "}
          <span className="text-[#A8A29A]">· {hasResult ? t("tuneHintShort.recalculated") : t("tuneHintShort.onLaunch")}</span>
        </p>
      </div>
    </Sheet>
  );
}
