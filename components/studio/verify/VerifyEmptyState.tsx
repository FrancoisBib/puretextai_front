"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui";

export interface VerifyEmptyStateProps {
  vDemo: (text: string) => void;
}

/**
 * Dashed-border placeholder shown in the sidebar before the first
 * verification run — "the similarity result arrives here."
 */
export function VerifyEmptyState({ vDemo }: VerifyEmptyStateProps) {
  const t = useTranslations("studio.verify");

  return (
    <EmptyState
      variant="pending"
      className="px-5 py-10"
      title={t("emptyState.title")}
      note={t("emptyState.note")}
      action={{ label: t("emptyState.action"), onClick: () => vDemo(t("demoText")) }}
    />
  );
}
