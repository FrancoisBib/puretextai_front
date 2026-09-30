"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

export interface NavTab {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface NavTabsProps {
  isCorrect: boolean;
  isHuman: boolean;
  isVerify: boolean;
  isRead: boolean;
  isCount: boolean;
  goCorrect: () => void;
  goHuman: () => void;
  goVerify: () => void;
  goRead: () => void;
  goCount: () => void;
}

/**
 * The 5 top-nav pill buttons (Correction / Humanisation / Vérification /
 * Lisibilité / Compteur). The active tab renders an absolutely-positioned
 * white pill (`inset-0`) behind the label — ported verbatim from the
 * source's `<sc-if value="{{ isX }}"><span style="position:absolute;
 * inset:0; ...">` + `<span style="position:relative;">{{ label }}</span>`
 * structure.
 *
 * Hidden below 760px, where the module picker button replaces it.
 */
export function NavTabs({
  isCorrect,
  isHuman,
  isVerify,
  isRead,
  isCount,
  goCorrect,
  goHuman,
  goVerify,
  goRead,
  goCount,
}: NavTabsProps) {
  const t = useTranslations("nav");

  const tabs: Array<{ key: string; label: string; active: boolean; onClick: () => void }> = [
    { key: "correct", label: t("correct"), active: isCorrect, onClick: goCorrect },
    { key: "human", label: t("human"), active: isHuman, onClick: goHuman },
    { key: "verify", label: t("verify"), active: isVerify, onClick: goVerify },
    { key: "read", label: t("read"), active: isRead, onClick: goRead },
    { key: "count", label: t("count"), active: isCount, onClick: goCount },
  ];

  return (
    <nav className="ml-0.5 flex flex-none items-center gap-px max-mob:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={tab.onClick}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "relative flex-none whitespace-nowrap rounded-[9px] border-0 bg-transparent px-[9px] py-2",
            "font-sans text-[13px] font-medium text-[#4A4741] cursor-pointer",
            "hover:bg-[rgba(20,18,15,.05)] hover:text-[#14120F]",
          )}
        >
          {tab.active && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-[9px] border border-[rgba(20,18,15,.07)] bg-white shadow-[0_1px_2px_rgba(20,18,15,.08)]"
            />
          )}
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
