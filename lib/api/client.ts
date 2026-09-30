/**
 * Base HTTP client for the PureText AI backend. Framework/store-free (same
 * discipline as `lib/engines/*`) — the store owns the access token and
 * passes it in per call via `ApiCallOptions.token`, and reacts to a
 * refreshed token via `onTokenRefreshed` rather than this module holding
 * any mutable session state itself.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Mirrors the backend's `{ error: { code, message, details } }` envelope (§5). */
export class ApiError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(code: string, message: string, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export interface ApiCallOptions {
  /** Bearer access token, if the caller has one (omit for anonymous calls). */
  token?: string | null;
  signal?: AbortSignal;
}

async function rawRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { accessToken?: string } | null;
    return body?.accessToken ?? null;
  } catch {
    return null;
  }
}

function withAuth(init: RequestInit, token: string | null | undefined): RequestInit {
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return { ...init, headers, credentials: "include" };
}

/** Raw fetch against the backend — same origin rules, JSON envelope untouched. */
export async function apiFetch(path: string, init: RequestInit = {}, opts: ApiCallOptions = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, { ...withAuth(init, opts.token), signal: opts.signal });
}

/** `apiFetch` + JSON parsing + `{error:{...}}` → `ApiError`. */
export async function apiJson<T>(path: string, init: RequestInit = {}, opts: ApiCallOptions = {}): Promise<T> {
  const res = await apiFetch(path, init, opts);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(err?.code ?? "internal_error", err?.message ?? "Erreur réseau.", err?.details ?? null);
  }

  return body as T;
}

/** Every backend error code with a matching `common.errors.<code>` message key. */
export const KNOWN_ERROR_CODES = new Set([
  "invalid_code",
  "disposable_email",
  "unauthorized",
  "conflict",
  "validation_error",
  "quota_exceeded",
  "text_too_long",
  "plan_required",
  "provider_unavailable",
  "rate_limited",
  "internal_error",
]);

/** `code` if it has a matching `common.errors.<code>` message key, `"generic"` otherwise. */
export function knownErrorCode(code: string): string {
  return KNOWN_ERROR_CODES.has(code) ? code : "generic";
}

/**
 * Normalizes any thrown error to a stable `common.errors.<code>` key, never
 * the raw `error.message` — that text comes straight from the backend or the
 * browser's fetch failure and isn't governed by next-intl, so it could be in
 * the wrong locale (or just not meant for end users at all).
 */
export function apiErrorCode(error: unknown): string {
  return error instanceof ApiError ? knownErrorCode(error.code) : "generic";
}

export { rawRefresh as refreshAccessToken };
