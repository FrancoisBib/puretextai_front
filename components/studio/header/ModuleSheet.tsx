"use client";

import { useTranslations } from "next-intl";
import { Sheet, SheetHandle } from "@/components/ui";
import type { ModuleItem } from "@/lib/store/selectors/shell";

export interface ModuleSheetProps {
  open: boolean;
  onClose: () => void;
  modules: ModuleItem[];
}

/**
 * Mobile module picker (markup.html:1345-1363): one row per module with its
 * one-line description and its live finding count.
 */
export function ModuleSheet({ open, onClose, modules }: ModuleSheetProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={tCommon("modulesHeading")}
      className="px-3.5 pt-[18px] pb-[calc(18px+env(safe-area-inset-bottom,0px))]"
    >
      <SheetHandle className="-mt-2 mb-[15px]" />
      <div className="px-2 pb-[9px] text-[10.5px] font-bold uppercase tracking-[.1em] text-[#8A857C]">
        {tCommon("modulesHeading")}
      </div>
      <div className="flex flex-col gap-0.5">
        {modules.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={m.pick}
            style={{ background: m.bg }}
            className="flex min-h-[50px] w-full cursor-pointer items-center gap-[11px] rounded-[12px] border-0 px-3 py-2.5 text-left font-sans"
          >
            <span className="min-w-0 flex-1">
              <span style={{ color: m.ink }} className="block text-[14.5px] font-semibold">
                {t(m.key)}
              </span>
              <span className="block text-[12px] leading-[1.45] text-[#8A857C]">{t(`notes.${m.key}`)}</span>
            </span>
            <span className="flex-none text-[12px] font-bold tabular-nums text-[#049FDE]">{m.count}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
