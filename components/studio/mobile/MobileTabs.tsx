"use client";

/**
 * Below 760px the two-column layout collapses to one column and this control
 * chooses which half is shown: the text editor or the results panel
 * (markup.html:263-272). Hidden at wider widths, where both are visible.
 */
export interface MobileTabsProps {
  mTabIsText: boolean;
  mTabIsRes: boolean;
  setMTabText: () => void;
  setMTabRes: () => void;
  mResBadge: string;
  mResHasBadge: boolean;
}

export function MobileTabs({
  mTabIsText,
  mTabIsRes,
  setMTabText,
  setMTabRes,
  mResBadge,
  mResHasBadge,
}: MobileTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Affichage"
      className="mb-3.5 hidden gap-[3px] rounded-[12px] bg-[#EFEDE7] p-[3px] max-mob:flex"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mTabIsText}
        onClick={setMTabText}
        className="relative min-h-[44px] flex-1 cursor-pointer rounded-[10px] border-0 bg-transparent px-2 py-[11px] font-sans text-[13px] font-semibold text-[#14120F]"
      >
        {mTabIsText && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-[10px] bg-white shadow-[0_1px_3px_rgba(20,18,15,.12)]"
          />
        )}
        <span className="relative">Texte</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mTabIsRes}
        onClick={setMTabRes}
        className="relative min-h-[44px] flex-1 cursor-pointer rounded-[10px] border-0 bg-transparent px-2 py-[11px] font-sans text-[13px] font-semibold text-[#14120F]"
      >
        {mTabIsRes && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-[10px] bg-white shadow-[0_1px_3px_rgba(20,18,15,.12)]"
          />
        )}
        <span className="relative inline-flex items-center gap-1.5">
          Résultats
          {mResHasBadge && (
            <span className="rounded-full bg-[rgba(4,159,222,.12)] px-[7px] py-0.5 text-[11px] font-bold tabular-nums text-[#049FDE]">
              {mResBadge}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
