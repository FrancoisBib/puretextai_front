import type { BrowserOverride } from "@/lib/store/types";

/**
 * Browser detection for the header's "Ajouter à [navigateur]" button — a
 * literal port of `detectBrowser()` / `browserVals()` in PureText AI.dc.html.
 * Pure (takes the navigator as an argument) so it can be called only on the
 * client, after mount, without an SSR/hydration mismatch.
 */

export type BrowserName = "Chrome" | "Edge" | "Brave" | "Opera" | "Firefox" | "Safari" | "Autre";

interface NavigatorLike {
  userAgent?: string;
  userAgentData?: { brands?: { brand: string }[] };
  brave?: unknown;
}

const CHROME_WEB_STORE = "https://chromewebstore.google.com/";
const FIREFOX_ADDONS = "https://addons.mozilla.org/fr/firefox/";

export function detectBrowser(nav: NavigatorLike, override: BrowserOverride): BrowserName {
  if (override !== "Auto") return override;
  const ua = nav.userAgent || "";
  const brands = (nav.userAgentData?.brands || []).map((b) => b.brand).join(" ");
  if (/Firefox\//.test(ua)) return "Firefox";
  if (nav.brave) return "Brave";
  if (/Edg\//.test(ua) || /Edge/.test(brands)) return "Edge";
  if (/OPR\//.test(ua) || /Opera/.test(brands)) return "Opera";
  if (/Chrome\//.test(ua) || /Chrom/.test(brands)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Autre";
}

export interface BrowserStoreLink {
  name: BrowserName;
  logo: "/assets/chrome.png" | "/assets/firefox.png";
  href: string;
}

/** Store link for the detected browser, or null on Safari, mobile or anything else (no button). */
export function browserStoreLink(nav: NavigatorLike, override: BrowserOverride): BrowserStoreLink | null {
  const name = detectBrowser(nav, override);
  const mobile = override === "Auto" && /Android|iPhone|iPad|Mobile/.test(nav.userAgent || "");
  if (mobile) return null;
  if (name === "Firefox") return { name, logo: "/assets/firefox.png", href: FIREFOX_ADDONS };
  if (name === "Chrome" || name === "Edge" || name === "Brave" || name === "Opera") {
    return { name, logo: "/assets/chrome.png", href: CHROME_WEB_STORE };
  }
  return null;
}
