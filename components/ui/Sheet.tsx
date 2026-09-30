"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the sheet dialog. */
  label: string;
  /** Extra classes for the panel (not the scrim). */
  className?: string;
  children: React.ReactNode;
}

/**
 * Full bottom sheet with its own scrim — used for the mobile module picker and
 * the Ton/Intensité settings sheet (markup.html:1305-1363).
 *
 * Surfaces that are a popover on desktop and a sheet only below 760px use
 * `mobileSheetClasses()` instead; this component is for sheets that have no
 * desktop counterpart.
 */
export function Sheet({ open, onClose, label, className, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="animate-pt-fade fixed inset-0 z-[70] bg-[rgba(20,18,15,.4)]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "animate-pt-sheet absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white",
          "shadow-[0_-16px_44px_rgba(20,18,15,.24)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** The 38×4 grab handle the design puts at the top of every sheet. */
export function SheetHandle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("mx-auto h-[4px] w-[38px] rounded-full bg-[rgba(20,18,15,.18)]", className)}
    />
  );
}

/** Dimmer rendered behind a popover that turns into a sheet below 760px. */
export function SheetScrim({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      aria-hidden
      className="animate-pt-fade fixed inset-0 z-50 hidden bg-[rgba(20,18,15,.42)] max-mob:block"
    />
  );
}
