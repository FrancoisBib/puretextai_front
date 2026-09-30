import * as React from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@/lib/utils/cn";

export interface ProgressButtonProps extends ButtonProps {
  /** While true the button dims and a light bar sweeps along its bottom edge. */
  busy?: boolean;
}

/**
 * The primary "run" button of Correction, Humanisation and Lisibilité: a
 * normal accent button that grows an indeterminate progress sweep while its
 * simulated pass is running.
 */
export const ProgressButton = React.forwardRef<HTMLButtonElement, ProgressButtonProps>(
  function ProgressButton({ busy = false, className, children, style, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="accent"
        aria-busy={busy || undefined}
        style={{ cursor: busy ? "default" : "pointer", opacity: busy ? 0.85 : 1, ...style }}
        className={cn("relative overflow-hidden whitespace-nowrap", className)}
        {...props}
      >
        {children}
        {busy && (
          <span
            aria-hidden
            className="animate-pt-bar absolute bottom-0 left-0 h-[2px] w-[38%] rounded-[2px] bg-[rgba(255,255,255,.9)]"
          />
        )}
      </Button>
    );
  },
);
