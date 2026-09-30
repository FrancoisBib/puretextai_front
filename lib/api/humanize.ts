/**
 * `POST /v1/humanize` — Server-Sent Events, consumed via `fetch`'s streaming
 * body rather than `EventSource`: `EventSource` supports neither POST bodies
 * nor an `Authorization` header, both of which this endpoint needs.
 */

import { API_BASE } from "./client";
import type { UsageInfo } from "./correct";

export interface HumanizeSegmentEvent {
  before: string;
  after: string;
  tag: string;
  why: string;
}

export interface HumanizeDoneEvent {
  usage: UsageInfo;
  aiScoreBefore: number;
  aiScoreAfter: number;
  provider: string;
  model: string;
}

export interface HumanizeErrorEvent {
  code: string;
  message: string;
  details: unknown;
}

export interface StreamHumanizeParams {
  text: string;
  tone: string;
  intensity: 0 | 1 | 2;
  lang: string;
}

export interface StreamHumanizeHandlers {
  onSegment: (segment: HumanizeSegmentEvent) => void;
  onDone: (done: HumanizeDoneEvent) => void;
  onError: (error: HumanizeErrorEvent) => void;
}

/** Parses one `event: X\ndata: JSON\n\n` frame per call to `onFrame`. */
function parseSseFrame(raw: string): { event: string; data: string } {
  let event = "message";
  let data = "";
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  return { event, data };
}

export async function streamHumanize(
  params: StreamHumanizeParams,
  handlers: StreamHumanizeHandlers,
  token?: string | null,
): Promise<void> {
  const headers = new Headers({ "content-type": "application/json" });
  if (token) headers.set("authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/v1/humanize`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(params),
    });
  } catch {
    handlers.onError({ code: "provider_unavailable", message: "Impossible de joindre le serveur.", details: null });
    return;
  }

  if (!res.body) {
    handlers.onError({ code: "internal_error", message: "Réponse en flux indisponible.", details: null });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const { event, data } = parseSseFrame(raw);
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        if (event === "segment") handlers.onSegment(parsed as HumanizeSegmentEvent);
        else if (event === "done") handlers.onDone(parsed as HumanizeDoneEvent);
        else if (event === "error") handlers.onError(parsed as HumanizeErrorEvent);
      } catch {
        // Trame malformée : on l'ignore plutôt que de couper tout le flux.
      }
    }
  }
}
