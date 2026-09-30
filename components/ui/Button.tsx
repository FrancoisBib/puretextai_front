"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "accent" | "dark" | "outline" | "accent-outline" | "ghost";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Only meaningful on the "outline" variant. Some outline buttons in the
   * source (e.g. "Copier", "Remplacer la source") hover to the accent color
   * instead of darkening toward ink black (e.g. "Tout ignorer", "Ignorer").
   */
  hoverAccent?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-[12.5px]",
  md: "px-4 py-2.5 text-[13px]",
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium cursor-pointer " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

function variantClasses(variant: ButtonVariant, hoverAccent: boolean): string {
  switch (variant) {
    case "accent":
      return cn(
        "rounded-[10px] border border-[#049FDE] bg-[#049FDE] text-white font-semibold",
        "shadow-[0_2px_8px_rgba(4,159,222,.25)]",
        "hover:bg-[#0378A9] hover:border-[#0378A9]"
      );
    case "dark":
      return cn(
        "rounded-[9px] border-0 bg-[#14120F] text-white font-semibold",
        "hover:bg-[#049FDE]"
      );
    case "outline":
      return cn(
        "rounded-[9px] border border-[rgba(20,18,15,.12)] bg-transparent text-[#4A4741] font-medium",
        hoverAccent
          ? "hover:border-[#049FDE] hover:text-[#049FDE]"
          : "hover:border-[rgba(20,18,15,.3)] hover:text-[#14120F]"
      );
    case "accent-outline":
      return cn(
        "rounded-[9px] border border-[rgba(4,159,222,.4)] bg-transparent text-[#049FDE] font-semibold",
        "hover:bg-[rgba(4,159,222,.08)]"
      );
    case "ghost":
      return cn(
        "rounded-[8px] border-0 bg-transparent text-[#8A857C] font-medium",
        "hover:text-[#14120F]"
      );
    default:
      return "";
  }
}

/**
 * Base button primitive matching the PureText AI design's five recurring
 * button looks. Padding/font-size come from `size`; exact idle/hover colors,
 * borders, radii and shadows come from `variant`.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", size = "md", hoverAccent = false, className, type = "button", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, sizeClasses[size], variantClasses(variant, hoverAccent), className)}
      {...props}
    >
      {children}
    </button>
  );
});
