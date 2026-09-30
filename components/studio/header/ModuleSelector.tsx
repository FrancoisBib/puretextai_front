"use client";

/**
 * Mobile-only replacement for the top nav: a button showing the active
 * module's name that opens the module bottom sheet
 * (markup.html:101 and :1345-1363).
 */
export interface ModuleSelectorProps {
  moduleLabel: string;
  openModSheet: () => void;
}

export function ModuleSelector({ moduleLabel, openModSheet }: ModuleSelectorProps) {
  return (
    <button
      type="button"
      onClick={openModSheet}
      aria-haspopup="dialog"
      className="hidden min-h-[42px] flex-none items-center gap-[7px] whitespace-nowrap rounded-[10px] border border-[rgba(20,18,15,.1)] bg-white px-3 py-[9px] font-sans text-[13.5px] font-semibold text-[#14120F] shadow-[0_1px_2px_rgba(20,18,15,.06)] cursor-pointer max-mob:inline-flex"
    >
      {moduleLabel}
      <span aria-hidden className="text-[9px] leading-none text-[#8A857C]">
        ▾
      </span>
    </button>
  );
}
