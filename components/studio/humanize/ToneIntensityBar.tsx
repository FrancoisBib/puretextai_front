"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { DropdownMenu } from "@/components/ui";
import { useClickOutside } from "@/lib/hooks/use-click-outside";
import { INTENSITY_KEYS, type ToneGroupVM, type IntensityOption } from "@/lib/store/selectors/humanize";
import { StudioLockBadge } from "./StudioLockBadge";

export interface ToneIntensityBarProps {
  tone: string;
  toneMenu: boolean;
  toggleToneMenu: () => void;
  toneGroups: ToneGroupVM[];
  intensityOptions: IntensityOption[];
  tuneHint: string;
}

/**
 * "Ton" dropdown trigger + grouped tone menu, divider, "Intensité" 3-way
 * segmented control, and the trailing tune hint.
 *
 * Tones outside "Généraux" and the "Maximale" intensity are Studio-only: on
 * the free plan they carry a STUDIO badge and send the user to /tarifs rather
 * than applying. Hidden below 760px, where `TuneRow` opens a sheet instead.
 */
export function ToneIntensityBar({
  tone,
  toneMenu,
  toggleToneMenu,
  toneGroups,
  intensityOptions,
  tuneHint,
}: ToneIntensityBarProps) {
  // Mirrors LangMenu's convention: toggleToneMenu flips the boolean, so
  // calling it unconditionally on an outside click (only wired while the
  // menu is open) closes it.
  const menuRef = useClickOutside<HTMLDivElement>(toneMenu, toggleToneMenu);
  const t = useTranslations("studio.humanize");

  const router = useRouter();

  const choose = (item: { locked: boolean; pick: () => void }) => () => {
    if (item.locked) router.push("/tarifs");
    else item.pick();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(20,18,15,.07)] bg-[#FCFBF9] px-[18px] py-[9px] max-mob:hidden">
      <span className="text-[11.5px] font-semibold text-[#8A857C]">{t("tonePickerLabel")}</span>

      <div ref={menuRef} data-tone-menu="1" className="relative">
        <button
          type="button"
          onClick={toggleToneMenu}
          className="inline-flex items-center gap-[7px] whitespace-nowrap rounded-[8px] border border-[rgba(20,18,15,.12)] bg-white px-[10px] py-[6px] font-sans text-xs font-semibold text-[#14120F] shadow-[0_1px_2px_rgba(20,18,15,.06)] cursor-pointer hover:border-[#049FDE]"
        >
          {t(`tones.${tone}.label`)}
          <span className="text-[8px] text-[#A8A29A]">▾</span>
        </button>

        <DropdownMenu open={toneMenu} align="left" width={272} className="max-h-[338px] overflow-y-auto">
          {toneGroups.map((group) => (
            <div key={group.name}>
              <div className="px-[9px] pt-[9px] pb-[5px] text-[10px] font-bold uppercase tracking-[.1em] text-[#049FDE]">
                {t(`toneGroups.${group.name}`)}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={choose(item)}
                  style={{ background: item.bg }}
                  className="block w-full rounded-[9px] border-0 px-[9px] py-2 text-left font-sans cursor-pointer hover:bg-[rgba(20,18,15,.05)]"
                >
                  <span
                    className="flex items-center gap-[7px] text-[13px] text-[#14120F]"
                    style={{ fontWeight: item.weight }}
                  >
                    {t(`tones.${item.label}.label`)}
                    {item.locked && <StudioLockBadge />}
                    <span className="flex-1" />
                    <span className="text-[11px] text-[#049FDE]">{item.check}</span>
                  </span>
                  <span className="mt-[2px] block text-[11.5px] leading-[1.45] text-[#8A857C]">{t(`tones.${item.label}.desc`)}</span>
                </button>
              ))}
            </div>
          ))}
        </DropdownMenu>
      </div>

      <span className="mx-[3px] h-[18px] w-px bg-[rgba(20,18,15,.1)]" />
      <span className="text-[11.5px] font-semibold text-[#8A857C]">{t("intensityPickerLabel")}</span>

      <div role="tablist" aria-label={t("intensityPickerLabel")} className="flex rounded-[8px] bg-[#EFEDE7] p-[3px]">
        {intensityOptions.map((o) => (
          <button
            key={o.index}
            type="button"
            role="tab"
            aria-selected={o.active}
            onClick={choose(o)}
            style={{ color: o.color }}
            className="relative cursor-pointer rounded-[7px] border-0 bg-transparent px-[11px] py-1.5 font-sans text-xs font-semibold"
          >
            {o.active && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-[7px] bg-white shadow-[0_1px_3px_rgba(20,18,15,.12)]"
              />
            )}
            <span className="relative inline-flex items-center gap-[5px]">
              {t(`intensity.${INTENSITY_KEYS[o.index]}`)}
              {o.locked && <StudioLockBadge />}
            </span>
          </button>
        ))}
      </div>

      <span className="flex-1" />
      <span className="text-[11.5px] text-[#A8A29A]">{tuneHint}</span>
    </div>
  );
}
