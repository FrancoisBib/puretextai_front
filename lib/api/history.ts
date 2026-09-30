/** `GET /v1/history` — see `puretextai_api/src/modules/history`. */

import { apiJson, type ApiCallOptions } from "./client";

export type HistoryModule = "correct" | "humanize" | "detect" | "similarity";

export interface HistoryItem {
  id: string;
  module: HistoryModule;
  excerpt: string | null;
  wordCount: number | null;
  /** Only populated for `module: "detect"` jobs. */
  aiScoreAfter: number | null;
  createdAt: string;
}

export interface HistoryPage {
  items: HistoryItem[];
  nextCursor: string | null;
}

export async function getHistory(cursor: string | null, opts: ApiCallOptions = {}): Promise<HistoryPage> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiJson<HistoryPage>(`/v1/history${qs}`, { method: "GET" }, opts);
}
