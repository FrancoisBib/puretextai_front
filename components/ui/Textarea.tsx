"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Styled textarea matching the consistent editor look shared across
 * Correction/Humanize/Verify/Lisibilité: 15.5px/1.85 type, accent caret,
 * transparent background, no default border. Positioning (e.g. Correction's
 * `absolute inset-0` overlay) is left entirely to `className`.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "block w-full border-0 bg-transparent resize-none",
        "px-[25px] py-[23px]",
        "font-sans text-[15.5px] leading-[1.85] tracking-normal",
        "text-[#14120F] caret-[#049FDE]",
        className
      )}
      {...props}
    />
  );
});
