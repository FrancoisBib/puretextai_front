import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

export interface EmptyStateAction {
  label: React.ReactNode;
  onClick: () => void;
}

export interface EmptyStateProps {
  /**
   * "done": solid card, light-blue-circle icon, used when a queue is
   * cleared (e.g. Correction's "Rien à signaler" / "Document purifié").
   * "pending": dashed-border placeholder shown before the first analysis
   * run (Vérification/Lisibilité "arrives here" states).
   */
  variant: "done" | "pending";
  /** Icon content. Defaults to "✓" for "done"; omitted by default for "pending" (source shows none). */
  icon?: React.ReactNode;
  title: React.ReactNode;
  note?: React.ReactNode;
  action?: EmptyStateAction;
  /** Replaces `action` when a state offers more than one call to action. */
  children?: React.ReactNode;
  /** Icon circle colours; default to the accent tint. */
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export function EmptyState({
  variant,
  icon,
  title,
  note,
  action,
  children,
  iconBg,
  iconColor,
  className,
}: EmptyStateProps) {
  if (variant === "done") {
    return (
      <div className={cn("px-[18px] pt-[27px] pb-[29px] text-center", className)}>
        <div
          style={{ background: iconBg, color: iconColor }}
          className="mx-auto mb-[11px] grid h-[36px] w-[36px] place-items-center rounded-full bg-[rgba(4,159,222,.11)] text-[15.5px] text-[#049FDE]"
        >
          {icon ?? "✓"}
        </div>
        <div className="text-[13.5px] font-semibold">{title}</div>
        {note && (
          <p className="mx-auto mt-[6px] mb-[14px] max-w-[30ch] text-[12.5px] text-[#8A857C]">{note}</p>
        )}
        {children ??
          (action && (
            <Button variant="accent-outline" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
      </div>
    );
  }

  return (
    <div className={cn("border border-dashed border-[rgba(20,18,15,.16)] rounded-[16px] px-5 py-10 text-center", className)}>
      {icon && (
        <div className="w-[36px] h-[36px] mx-auto mb-[11px] rounded-full bg-[rgba(4,159,222,.11)] text-[#049FDE] grid place-items-center text-[15.5px]">
          {icon}
        </div>
      )}
      <p className="m-0 mb-[5px] font-serif text-[21px]">{title}</p>
      {note && (
        <p className="mx-auto mb-[16px] max-w-[34ch] text-[12.5px] text-[#55514A]">{note}</p>
      )}
      {action && (
        <Button variant="accent-outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
