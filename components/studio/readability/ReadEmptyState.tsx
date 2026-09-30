"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui";

export interface ReadEmptyStateProps {
  rDemo: () => void;
}

/** Dashed placeholder shown before the first readability run (`rEmpty`). */
export function ReadEmptyState({ rDemo }: ReadEmptyStateProps) {
  const t = useTranslations("studio.readability");

  return (
    <EmptyState
      variant="pending"
      title={t("emptyState.title")}
      note={t("emptyState.note")}
      action={{ label: t("emptyState.action"), onClick: rDemo }}
    />
  );
}
