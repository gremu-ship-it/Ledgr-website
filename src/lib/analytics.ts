import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Shared analytics vocabulary + helpers, imported by both the browser tracker
 * (via the small, dependency-free parts) and the server collector.
 *
 * Server-only helpers live in this file too, but nothing here reads
 * `process.env` at module scope, so importing it from a client component is
 * safe. Cookies, event types and channel rules are defined once, in one place,
 * because the collector validates against exactly this list.
 */

/** Cookie names. Exported so the client tracker and the collector agree. */
export const COOKIE_VISITOR = "ledgr_vid";
export const COOKIE_SESSION = "ledgr_sid";
export const COOKIE_CONSENT = "ledgr_consent";

/** Bump when the analytics/privacy wording changes; stored with each consent. */
export const CONSENT_VERSION = "1";

/** Consent cookie values. Anything else (or a missing cookie) = undecided. */
export const CONSENT_GRANTED = "granted";
export const CONSENT_DENIED = "denied";

/**
 * Every event type the collector will accept. An allowlist rather than free
 * text, so a stray client can't fill the table with junk — and so the
 * dashboard's funnels can name every step.
 */
export const EVENT_TYPES = [
  "pageview",
  "pageleave",
  "cta_click",
  "demo_click",
  "signup_click",
  "signin_click",
  "whatsapp_click",
  "email_click",
  "outbound_click",
  "plan_select",
  "calculator_use",
  "form_start",
  "form_submit",
  "newsletter_signup",
  "scroll_depth",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

const EVENT_TYPE_SET = new Set<string>(EVENT_TYPES);

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && EVENT_TYPE_SET.has(value);
}

/**
 * Events that mean "this visitor did something worth following up". Used for
 * the funnel, the conversion rate and the `converted` flag on a session.
 */
export const CONVERSION_EVENTS: EventType[] = [
  "form_submit",
  "newsletter_signup",
  "demo_click",
  "signup_click",
  "whatsapp_click",
  "email_click",
];

const CONVERSION_EVENT_SET = new Set<string>(CONVERSION_EVENTS);

export function isConversion(type: string): boolean {
  return CONVERSION_EVENT_SET.has(type);
}

/**
 * Search/social/referral lookup. Deliberately small: an unknown host is a
 * referrer, which is honest, rather than a wrong guess.
 */
const SEARCH_HOSTS = [
  "google.",
  "bing.",
  "duckduckgo.",
  "yahoo.",
  "yandex.",
  "ecosia.",
  "brave.",
  "ask.",
  "baidu.",
];

const SOCIAL_HOSTS = [
  "facebook.",
  "fb.",
  "instagram.",
  "linkedin.",
  "lnkd.in",
  "twitter.",
  "x.com",
  "t.co",
  "tiktok.",
  "youtube.",
  "youtu.be",
  "whatsapp.",
  "wa.me",
  "reddit.",
  "pinterest.",
  "threads.",
  "telegram.",
  "t.me",
];

export type Channel =
  | "direct"
  | "search"
  | "paid"
  | "social"
  | "email"
  | "referral"
  | "internal";

/** Human labels for the dashboard. */
export const CHANNEL_LABELS: Record<string, string> = {
  direct: "Direct",
  search: "Organic search",
  paid: "Paid ads",
  social: "Social",
  email: "Email",
  referral: "Referral",
  internal: "Internal",
};

export type Attribution = {
  channel: Channel;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
};

export type AttributionInput = {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
};

function clean(value: string | null | undefined, max = 160): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Lowercase host without `www.`, or null when the referrer is unusable. */
export function referrerHost(referrer: string | null | undefined): string | null {
  if (typeof referrer !== "string" || !referrer.trim()) return null;
  try {
    const url = new URL(referrer.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Turn a referrer + UTM tags into one channel. Order matters: an explicit
 * `utm_medium` always wins, because a campaign link is a deliberate claim;
 * host sniffing is only a fallback for untagged traffic.
 */
export function attribute(
  input: AttributionInput,
  selfHost?: string | null,
): Attribution {
  const utmSource = clean(input.utmSource);
  const utmMedium = clean(input.utmMedium);
  const utmCampaign = clean(input.utmCampaign);
  const host = referrerHost(input.referrer);
  const medium = (utmMedium || "").toLowerCase();

  const base: Omit<Attribution, "channel" | "referrerHost"> = {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent: clean(input.utmContent),
    utmTerm: clean(input.utmTerm),
  };

  // Our own pages (e.g. app → site, or a demo link back) aren't a channel.
  if (host && selfHost && host === selfHost.replace(/^www\./i, "")) {
    return { ...base, channel: "internal", referrerHost: host };
  }

  if (medium) {
    if (medium === "email" || medium === "newsletter") {
      return { ...base, channel: "email", referrerHost: host };
    }
    if (
      medium.includes("cpc") ||
      medium.includes("ppc") ||
      medium === "paid" ||
      medium === "paidsearch" ||
      medium === "display" ||
      medium === "paidsocial"
    ) {
      return { ...base, channel: "paid", referrerHost: host };
    }
    if (medium === "social" || medium === "social-media") {
      return { ...base, channel: "social", referrerHost: host };
    }
    if (medium === "referral") {
      return { ...base, channel: "referral", referrerHost: host };
    }
    if (medium === "organic") {
      return { ...base, channel: "search", referrerHost: host };
    }
  }

  if (!host) {
    // No referrer at all: direct, unless a campaign tag says otherwise.
    if (utmSource) {
      const source = utmSource.toLowerCase();
      if (source.includes("mail") || source.includes("newsletter")) {
        return { ...base, channel: "email", referrerHost: null };
      }
      if (SOCIAL_HOSTS.some((s) => source.includes(s.replace(/\.$/, "")))) {
        return { ...base, channel: "social", referrerHost: null };
      }
      if (source.includes("google") || source.includes("bing")) {
        return { ...base, channel: "search", referrerHost: null };
      }
      return { ...base, channel: "referral", referrerHost: null };
    }
    return { ...base, channel: "direct", referrerHost: null };
  }

  if (SEARCH_HOSTS.some((s) => host.includes(s))) {
    return { ...base, channel: "search", referrerHost: host };
  }
  if (SOCIAL_HOSTS.some((s) => host.includes(s.replace(/\.$/, "")))) {
    return { ...base, channel: "social", referrerHost: host };
  }
  return { ...base, channel: "referral", referrerHost: host };
}

/**
 * A readable label for where a visitor came from, shown in the visitors list:
 * "google.com", "instagram.com" or "Direct".
 */
export function sourceLabel(row: {
  channel?: string | null;
  referrerHost?: string | null;
  utmSource?: string | null;
}): string {
  if (row.utmSource) return row.utmSource;
  if (row.referrerHost) return row.referrerHost;
  return CHANNEL_LABELS[row.channel || "direct"] || "Direct";
}

/* ----------------------------- bot filtering ----------------------------- */

const BOT_RE =
  /(bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|headlesschrome|phantomjs|lighthouse|pagespeed|pingdom|uptimerobot|gtmetrix|semrush|ahrefs|screaming ?frog|dataprovider|preview|monitoring|curl\/|wget\/|python-requests|axios\/|go-http-client|node-fetch|scrapy)/i;

/**
 * Returns true for anything that shouldn't land in analytics. Cheap and
 * deliberately broad: a false positive on an exotic user agent costs one
 * missing pageview, a false negative pollutes every number on the dashboard.
 */
export function looksLikeBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // no UA at all is a script, not a browser
  if (BOT_RE.test(userAgent)) return true;
  if (userAgent.length < 12) return true;
  return false;
}

/** `true` when the visitor's browser says "don't track me" (DNT/GPC). */
export function respectingPrivacySignals(request: Request): boolean {
  const dnt =
    request.headers.get("dnt") ||
    request.headers.get("x-do-not-track") ||
    request.headers.get("sec-gpc");
  return dnt === "1";
}

/* ------------------------------ device sniff ----------------------------- */

export type Device = {
  device: string;
  os: string;
  browser: string;
};

/** Coarse UA parsing — enough to answer "are they on a phone?" */
export function parseUserAgent(userAgent: string | null | undefined): Device {
  const ua = userAgent || "";

  let os = "Other";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/chrome\/|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox\/|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let device = "desktop";
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) device = "mobile";

  return { device, os, browser };
}

/** Coarse geo from the hosting edge, when the platform provides it. */
export function geoFromHeaders(request: Request): {
  country: string | null;
  region: string | null;
  city: string | null;
} {
  const get = (...names: string[]) => {
    for (const name of names) {
      const value = request.headers.get(name);
      if (value && value.trim() && value !== "unknown") {
        return value.trim().slice(0, 120);
      }
    }
    return null;
  };
  return {
    country: get("x-vercel-ip-country", "cf-ipcountry", "x-country"),
    region: get("x-vercel-ip-country-region", "x-vercel-ip-city-region"),
    city: decodeURIComponent(get("x-vercel-ip-city", "cf-ipcity") || "") || null,
  };
}

/* --------------------------------- hashing -------------------------------- */

/**
 * A salted, truncated hash of the IP. Used only to rate-limit abuse and to
 * spot a burst from one place — never stored as an address, and never joined
 * back to a person. Falls back to a per-process random salt when no secret is
 * configured, which is weaker but still better than storing the raw IP.
 */
const FALLBACK_SALT = randomBytes(16).toString("hex");

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_SALT || process.env.ADMIN_PASSWORD || FALLBACK_SALT;
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/** The visitor's IP as the platform reports it (first hop in XFF). */
export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim() || null;
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

/* --------------------------------- ids ----------------------------------- */

export function newVisitorId(): string {
  return `v_${randomBytes(16).toString("hex")}`;
}

export function newSessionId(): string {
  return `s_${randomBytes(12).toString("hex")}`;
}

export function newUnsubscribeToken(): string {
  return randomBytes(24).toString("hex");
}

/** Constant-time string compare, for password checks. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* ------------------------------ cookie utils ----------------------------- */

/**
 * Minimal cookie reader for route handlers. `next/headers` would work, but the
 * collector is happier staying a plain Request/Response handler, and this is
 * smaller than the import.
 */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export type CookieOptions = {
  maxAge?: number;
  httpOnly?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  path?: string;
  secure?: boolean;
};

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const {
    maxAge = 60 * 60 * 24 * 365,
    httpOnly = false, // the tracker reads the id in the browser
    sameSite = "Lax",
    path = "/",
    secure = process.env.NODE_ENV === "production",
  } = options;

  const bits = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (maxAge) bits.push(`Max-Age=${maxAge}`);
  if (httpOnly) bits.push("HttpOnly");
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

/** Consent state from the cookie jar, plus the DNT/GPC signals. */
export type ConsentState = "granted" | "denied" | "undecided";

export function consentState(request: Request): ConsentState {
  const value = readCookie(request, COOKIE_CONSENT);
  if (value === CONSENT_GRANTED) return respectingPrivacySignals(request) ? "denied" : "granted";
  if (value === CONSENT_DENIED) return "denied";
  return "undecided";
}

/** Short, stable fingerprint of a page title for dedupe/debug logging. */
export function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
