import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** Pixel width of the shell. Source varies per use (295 fix popover, 330 verify finding popover). */
  width?: number;
}

/**
 * Low-level visual shell for the small anchored popovers that appear inline
 * in text (Correction fix popover, Verify finding popover, Humanize
 * sentence panel): white rounded-13/14px card, strong drop shadow, pop-in
 * animation. This component only renders chrome — flip/anchor placement
 * logic belongs in a positioning hook elsewhere; pass `style`/`className`
 * for absolute placement.
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { open, width, className, style, children, ...props },
  ref
) {
  if (!open) return null;
  return (
    <div
      ref={ref}
      style={{ width, ...style }}
      className={cn(
        "animate-pt-pop bg-white border border-[rgba(20,18,15,.1)] rounded-[14px]",
        "shadow-[0_18px_44px_rgba(20,18,15,.16)]",
        "text-[#14120F] not-italic",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export interface PopoverHeaderProps {
  /** Small uppercase category/kind label shown at the left (e.g. "Orthographe"). */
  label: React.ReactNode;
  labelColor?: string;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}

/** Repeated "category label — spacer — ✕ close" header row used across every popover. */
export function PopoverHeader({ label, labelColor = "#8A857C", onClose, closeLabel = "Fermer", className }: PopoverHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        style={{ color: labelColor }}
        className="text-[10px] font-bold tracking-[.1em] uppercase"
      >
        {label}
      </span>
      <span className="flex-1" />
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="bg-transparent border-0 cursor-pointer text-[#A8A29A] text-[13px] leading-none p-[2px] hover:text-[#14120F]"
        >
          ✕
        </button>
      )}
    </div>
  );
}
