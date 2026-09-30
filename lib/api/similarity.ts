/** `POST /v1/similarity` — see `puretextai_api/src/modules/similarity`. */

import { apiJson, type ApiCallOptions } from "./client";
import type { UsageInfo } from "./correct";

export interface SimilaritySourceResponse {
  title: string;
  url: string;
  host: string;
  matchedExcerpt: string;
  similarityPercent: number;
}

export interface SimilarityResponse {
  score: number;
  sources: SimilaritySourceResponse[];
  modelVersion: string;
  usage: UsageInfo;
}

export async function checkSimilarity(text: string, opts: ApiCallOptions = {}): Promise<SimilarityResponse> {
  return apiJson<SimilarityResponse>("/v1/similarity", { method: "POST", body: JSON.stringify({ text }) }, opts);
}
