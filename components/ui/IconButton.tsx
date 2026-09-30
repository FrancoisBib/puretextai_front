"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type IconButtonVariant = "outline" | "ghost";
export type IconButtonShape = "square" | "circle";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Edge length in px. Source uses 23/24/25 for nav-arrow style icon buttons. */
  size?: number;
  /** Corner radius in px. Defaults to a value proportional to `size` (6-7px). */
  radius?: number;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
}

/**
 * Small square (or circular) icon-only button: prev/next arrows, popover
 * pagination, close (✕) buttons. Two looks:
 *  - "outline" (default): white bg, 1px rgba(20,18,15,.12) border, hover
 *    border+text turn accent blue. Used for ← → nav arrows.
 *  - "ghost": no border/bg, faint text, hover to ink black. Used for ✕ close.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 25, radius, variant = "outline", shape = "square", className, type = "button", style, children, ...props },
  ref
) {
  const r = radius ?? (size <= 23 ? 6 : 7);
  return (
    <button
      ref={ref}
      type={type}
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? "50%" : r,
        ...style,
      }}
      className={cn(
        "grid place-items-center flex-none font-sans cursor-pointer transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "outline"
          ? "bg-white border border-[rgba(20,18,15,.12)] text-[13px] text-[#4A4741] hover:border-[#049FDE] hover:text-[#049FDE]"
          : "bg-transparent border-0 text-[13px] text-[#A8A29A] hover:text-[#14120F]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
