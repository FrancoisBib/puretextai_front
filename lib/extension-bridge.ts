/**
 * One-way bridge from this app to the PureText AI browser extension: the
 * extension's content script (`src/content/content-script.ts`) listens for
 * this exact `postMessage` shape on this app's own origin and relays the
 * token to the extension's background/side-panel, which never builds its
 * own auth UI — it only opens this app in a new tab and waits.
 *
 * Framework-free by the same discipline as `lib/api/*` — called from the
 * store, never imports it.
 */

const EXTENSION_BRIDGE_SOURCE = "puretextai-web";
const EXTENSION_BRIDGE_TYPE = "EXTENSION_AUTH_TOKEN";

export function broadcastAccessTokenToExtension(accessToken: string): void {
  if (typeof window === "undefined") return;
  window.postMessage({ source: EXTENSION_BRIDGE_SOURCE, type: EXTENSION_BRIDGE_TYPE, accessToken }, window.location.origin);
}
