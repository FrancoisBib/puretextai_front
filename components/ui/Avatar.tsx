import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  /** Initials to render, e.g. "CL". */
  initials: React.ReactNode;
  /** Diameter in px. Source uses 31 (header trigger) and 33 (avatar-menu header). */
  size?: number;
  /** Width in px of the accent focus/open ring (box-shadow), 0 to omit. */
  ringWidth?: number;
  ringColor?: string;
  className?: string;
}

/** Circular black avatar with white initials, used for the account trigger and menu header. */
export function Avatar({ initials, size = 31, ringWidth = 0, ringColor = "rgba(4,159,222,.25)", className }: AvatarProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        fontSize: size >= 33 ? 12.5 : 12,
        boxShadow: ringWidth ? `0 0 0 ${ringWidth}px ${ringColor}` : undefined,
      }}
      className={cn(
        "inline-grid place-items-center flex-none rounded-full bg-[#14120F] text-[#F6F5F2] font-sans font-semibold",
        className
      )}
    >
      {initials}
    </span>
  );
}
