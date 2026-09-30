/**
 * Historique view-model — reads `GET /v1/history` (fetched by
 * `loadHistory()`/`loadMoreHistory()`, triggered from `HistoryTab`). Read
 * only for now: deletion (`DELETE /v1/history/:id`, bulk clear) isn't
 * wired yet.
 *
 * Exposes raw values only (module key, ISO date, numbers) — no formatted
 * text: a selector has no access to the site's locale, so
 * `components/studio/history/HistoryTab.tsx` resolves display strings via
 * `useTranslations`/`useLocale`.
 */

import { useStudioStore } from "@/lib/store/studio-store";
import type { StudioState } from "@/lib/store/types";
import type { HistoryItem } from "@/lib/api/history";
import { memoizeLast } from "./memoize-last";

export interface HistoryView {
  loading: boolean;
  loadingMore: boolean;
  loaded: boolean;
  /** A `common.errors.<code>` key, or null. */
  error: string | null;
  items: HistoryItem[];
  hasMore: boolean;
  retry: () => void;
  loadMore: () => void;
}

function computeHistoryView(s: StudioState): HistoryView {
  return {
    loading: s.historyLoading,
    loadingMore: s.historyLoadingMore,
    loaded: s.historyLoaded,
    error: s.historyError,
    items: s.historyItems,
    hasMore: !!s.historyCursor,
    retry: () => useStudioStore.getState().loadHistory(),
    loadMore: () => useStudioStore.getState().loadMoreHistory(),
  };
}

export const selectHistoryView = memoizeLast(computeHistoryView);
