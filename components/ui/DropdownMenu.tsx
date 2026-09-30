import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** Which side of the trigger the menu hangs from. Assumes a `position: relative` ancestor. */
  align?: "left" | "right";
  /** Pixel width. Source uses 209 (lang menu), 228 (avatar menu), 272 (tone menu). */
  width?: number;
}

/**
 * Absolute-positioned white rounded-13px dropdown shell shared by the Lang
 * menu, Avatar menu and Tone menu. Same shadow family and pop-in animation
 * as `Popover`, but owns its own anchored positioning (top-full, left/right
 * 0) since every real usage sits inside a `position: relative` trigger wrapper.
 */
export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  { open, align = "right", width = 228, className, style, children, ...props },
  ref
) {
  if (!open) return null;
  return (
    <div
      ref={ref}
      style={{ width, ...style }}
      className={cn(
        "absolute top-[calc(100%+8px)] z-[60] animate-pt-pop bg-white border border-[rgba(20,18,15,.09)] rounded-[13px]",
        "shadow-[0_16px_40px_rgba(20,18,15,.14)] p-[6px]",
        align === "right" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Leading icon/flag slot. */
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** Trailing slot (checkmark, code, count…). */
  trailing?: React.ReactNode;
}

/** Repeated dropdown row pattern: icon/flag — label — trailing slot. */
export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { icon, label, trailing, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "flex items-center gap-2.5 w-full text-left bg-transparent border-0 rounded-[8px] px-2.5 py-2 cursor-pointer",
        "font-sans text-[13px] font-medium text-[#14120F] hover:bg-[rgba(20,18,15,.05)]",
        className
      )}
      {...props}
    >
      {icon}
      <span className="flex-1 min-w-0">{label}</span>
      {trailing}
    </button>
  );
});
