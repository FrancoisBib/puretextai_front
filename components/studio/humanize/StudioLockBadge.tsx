/** The small "STUDIO" pill marking a tone or intensity the free plan cannot use. */
export function StudioLockBadge({ className }: { className?: string }) {
  return (
    <span
      className={
        className ??
        "rounded-full bg-[rgba(4,159,222,.12)] px-[5px] py-0.5 text-[9px] font-bold tracking-[.08em] text-[#049FDE]"
      }
    >
      STUDIO
    </span>
  );
}
