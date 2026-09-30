/** `POST /v1/correct` — see `puretextai_api/src/modules/correct`. */

import { apiJson, type ApiCallOptions } from "./client";

export interface UsageInfo {
  runsLeft: number | null;
  wordsLeft: number | null;
  periodEnd: string;
}

export interface CorrectFlagResponse {
  id: number;
  cat: "Orthographe" | "Grammaire" | "Style" | "Ponctuation";
  rule: string;
  from: string;
  to: string;
  why: string;
  offset: number;
  length: number;
  confidence: number;
}

export interface CorrectResponse {
  flags: CorrectFlagResponse[];
  usage: UsageInfo;
}

export async function correctText(text: string, lang: string, opts: ApiCallOptions = {}): Promise<CorrectResponse> {
  return apiJson<CorrectResponse>(
    "/v1/correct",
    { method: "POST", body: JSON.stringify({ text, lang }) },
    opts,
  );
}
