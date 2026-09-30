import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type CardElevation = "none" | "sm" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shadow strength found in the source:
   *  - "none": border only (e.g. the "Intensité" note card).
   *  - "sm" (default): `0 1px 2px rgba(20,18,15,.05)` — sidebar panels
   *    (Révision, Réécritures, Similarité).
   *  - "lg": `0 1px 2px rgba(20,18,15,.05), 0 14px 34px rgba(20,18,15,.045)` —
   *    the main document panels (Correction/Humanize/Verify/Lisibilité editors).
   */
  elevation?: CardElevation;
  /** Shorthand for elevation="lg". Ignored if `elevation` is also passed. */
  elevated?: boolean;
  surface?: "white" | "alt";
}

const elevationClasses: Record<CardElevation, string> = {
  none: "",
  sm: "shadow-[0_1px_2px_rgba(20,18,15,.05)]",
  lg: "shadow-[0_1px_2px_rgba(20,18,15,.05),0_14px_34px_rgba(20,18,15,.045)]",
};

/** Base white/off-white rounded-16px bordered surface used for every panel. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevation, elevated = false, surface = "white", className, children, ...props },
  ref
) {
  const resolvedElevation: CardElevation = elevation ?? (elevated ? "lg" : "sm");
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[16px] border border-[rgba(20,18,15,.08)]",
        surface === "white" ? "bg-white" : "bg-[#FCFBF9]",
        elevationClasses[resolvedElevation],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
