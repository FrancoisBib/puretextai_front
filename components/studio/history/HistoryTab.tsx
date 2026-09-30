"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectHistoryView } from "@/lib/store/selectors/history";
import { Button, Card, EmptyState } from "@/components/ui";

const GRID_COLS = "1.1fr 3fr 1fr 1fr .8fr";

/**
 * "Historique" screen, reachable only via the header account menu (not a
 * top-nav tab): a read-only table of past treatments. Reads
 * `GET /v1/history` (`loadHistory()`, triggered on mount; `loadMoreHistory()`
 * for subsequent pages via cursor). Deletion isn't wired yet.
 *
 * Below 760px the column headers drop out and each row restacks — the excerpt
 * becomes a wrapping title above its own metadata (markup.html:84-86).
 */
export function HistoryTab() {
  const v = useStudioStore(selectHistoryView);
  const t = useTranslations("history");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  useEffect(() => {
    if (!v.loaded && !v.loading) v.retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-pt-in">
      <h1 className="m-0 mb-[6px] font-serif font-normal text-[34px]">{t("title")}</h1>
      <p className="m-0 mb-[23px] text-[#55514A]">{t("subtitle")}</p>

      {!v.loaded && v.loading && <p className="text-[#55514A]">{t("loading")}</p>}

      {!v.loaded && v.error && (
        <EmptyState variant="pending" title={tCommon(`errors.${v.error}`)} action={{ label: t("retry"), onClick: v.retry }} />
      )}

      {v.loaded && v.items.length === 0 && !v.error && <EmptyState variant="pending" title={t("empty")} />}

      {v.loaded && v.items.length > 0 && (
        <Card elevation="sm" className="overflow-hidden">
          <div
            className="grid gap-[13px] items-center text-[11px] font-bold tracking-[.08em] uppercase text-[#8A857C] max-mob:hidden"
            style={{
              gridTemplateColumns: GRID_COLS,
              padding: "12px 20px",
              borderBottom: "1px solid rgba(20,18,15,.07)",
              background: "#FCFBF9",
            }}
          >
            <span>{t("columns.date")}</span>
            <span>{t("columns.excerpt")}</span>
            <span>{t("columns.module")}</span>
            <span>{t("columns.words")}</span>
            <span>{t("columns.ai")}</span>
          </div>

          {v.items.map((h) => (
            <div
              key={h.id}
              className="grid items-center gap-[13px] text-[13px] max-mob:grid-cols-[1fr_auto] max-mob:gap-x-3 max-mob:gap-y-1 max-mob:px-4 max-mob:py-[13px]"
              style={{
                gridTemplateColumns: GRID_COLS,
                padding: "14px 20px",
                borderBottom: "1px solid rgba(20,18,15,.06)",
              }}
            >
              <span className="text-[#8A857C] tabular-nums">
                {new Date(h.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric" })}
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap max-mob:order-first max-mob:col-span-full max-mob:whitespace-normal max-mob:font-semibold">
                {h.excerpt ?? ""}
              </span>
              <span className="text-[11.5px] font-semibold text-[#049FDE]">{t(`modules.${h.module}`)}</span>
              <span className="tabular-nums text-[#55514A]">
                {h.wordCount !== null ? h.wordCount.toLocaleString(locale) : "—"}
              </span>
              <span className="tabular-nums font-semibold">
                {h.aiScoreAfter !== null ? `${Math.round(h.aiScoreAfter)}%` : "—"}
              </span>
            </div>
          ))}

          {v.hasMore && (
            <div className="flex justify-center p-[14px]">
              <Button variant="outline" size="sm" onClick={v.loadMore} disabled={v.loadingMore}>
                {v.loadingMore ? t("loadingMore") : t("loadMore")}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
