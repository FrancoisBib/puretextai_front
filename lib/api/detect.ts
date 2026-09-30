/** `POST /v1/detect` — see `puretextai_api/src/modules/detect`. */

import { apiJson, type ApiCallOptions } from "./client";
import type { UsageInfo } from "./correct";

export interface DetectPassage {
  text: string;
  offset: number;
  length: number;
  score: number;
}

export interface DetectResponse {
  score: number;
  scoreMin: number;
  scoreMax: number;
  verdict: "probablement_humain" | "incertain" | "probablement_ia";
  /** null quand le score vient du jugement LLM (moteur principal) plutôt que du repli heuristique. */
  signals: { burstiness: number; lexicalMarkers: number; perplexityProxy: number } | null;
  passages: DetectPassage[];
  modelVersion: string;
  disclaimer: string;
  usage: UsageInfo;
}

export async function detectText(text: string, opts: ApiCallOptions = {}): Promise<DetectResponse> {
  return apiJson<DetectResponse>("/v1/detect", { method: "POST", body: JSON.stringify({ text }) }, opts);
}
