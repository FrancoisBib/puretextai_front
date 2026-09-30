/** `GET /v1/me` — see `puretextai_api/src/modules/me`. */

import { apiJson, type ApiCallOptions } from "./client";
import type { UsageInfo } from "./correct";

export interface MeResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  locale: string;
  defaultLang: string;
  defaultTone: string | null;
  defaultIntensity: number;
  plan: "free" | "studio";
  planSince: string | null;
  quotas: {
    correct: UsageInfo;
    humanize: UsageInfo;
    verify: UsageInfo;
  };
}

export async function getMe(opts: ApiCallOptions = {}): Promise<MeResponse> {
  return apiJson<MeResponse>("/v1/me", { method: "GET" }, opts);
}
