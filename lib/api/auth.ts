/**
 * Auth calls (§4/§5 of the backend spec). Sessions live half here, half in
 * the browser: the refresh token is an httpOnly cookie the backend sets and
 * reads on its own (never touched here), the access token is returned in
 * the JSON body and kept in memory by the store — never persisted.
 */

import { apiFetch, apiJson, API_BASE, refreshAccessToken } from "./client";

export interface AuthTokens {
  accessToken: string;
}

/** Creates the account and emails a 6-digit code — no session until `verifyEmailCode`. */
export async function signup(email: string, password: string): Promise<void> {
  await apiJson<{ pendingVerification: true }>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Confirms the email with the emailed code and opens the session. */
export async function verifyEmailCode(email: string, code: string): Promise<AuthTokens> {
  return apiJson<AuthTokens>("/v1/auth/email/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resendEmailCode(email: string): Promise<void> {
  await apiJson<{ ok: true }>("/v1/auth/email/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return apiJson<AuthTokens>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/v1/auth/logout", { method: "POST" });
}

/** Silent session restore from the refresh cookie — returns null without throwing if there is none. */
export async function refresh(): Promise<AuthTokens | null> {
  const accessToken = await refreshAccessToken();
  return accessToken ? { accessToken } : null;
}

/** Full-page redirect — Google OAuth isn't a fetch call, the backend does the round trip. */
export function googleLoginUrl(): string {
  return `${API_BASE}/v1/auth/google`;
}
