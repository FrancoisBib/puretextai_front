"use client";

import { Textarea } from "@/components/ui";

export interface SourceViewProps {
  text: string;
  onChange: (text: string) => void;
}

/**
 * Plain source-text editor shown by the "Source" segment. `data-grow` opts it
 * into the auto-height + mobile viewport-floor behaviour.
 */
export function SourceView({ text, onChange }: SourceViewProps) {
  return (
    <Textarea
      data-grow="1"
      value={text}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      className="block w-full resize-y overflow-hidden px-[23px] py-[22px]"
      style={{ minHeight: "max(306px, calc(100dvh - 400px))" }}
    />
  );
}
