import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SignalBarProps {
  name: React.ReactNode;
  metric: React.ReactNode;
  /** 0-100 */
  pct: number;
  color: string;
  note: React.ReactNode;
  className?: string;
}

/**
 * Labeled horizontal signal row: name + metric header, a colored bar sized
 * by `pct`, and a note line below. Matches the Lisibilité "Ce qui coûte au
 * lecteur" signal rows; kept generic so Vérification's AI-likelihood signals
 * can reuse the same visual later.
 */
export function SignalBar({ name, metric, pct, color, note, className }: SignalBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={cn("px-[17px] py-[13px] border-b border-[rgba(20,18,15,.06)]", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-semibold">{name}</span>
        <span className="flex-1" />
        <span className="text-[12px] text-[#55514A] tabular-nums">{metric}</span>
      </div>
      <div className="h-[4px] rounded-full bg-[rgba(20,18,15,.07)] my-[8px] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <p className="m-0 text-[12px] leading-[1.55] text-[#55514A]">{note}</p>
    </div>
  );
}
