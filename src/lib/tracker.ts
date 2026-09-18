/**
 * The browser half of the analytics: a ~4KB, dependency-free tracker.
 *
 * Design rules it sticks to:
 *  - It never *identifies* anyone. The visitor id is minted and set by the
 *    server on first contact after consent; this file only sends events.
 *  - Before a choice is made (and if the visitor declines), only plain
 *    pageviews leave the browser, and the server stores those with no id.
 *  - Nothing here may throw into the page. Every entry point is wrapped.
 *
 * Consent flow: `ConsentBanner` calls `setConsent()`, which writes the cookie
 * via the API and then flushes whatever the page has been holding.
 */

import { site } from "@/lib/site";

export type TrackType =
  | "pageview"
  | "pageleave"
  | "cta_click"
  | "demo_click"
  | "signup_click"
  | "signin_click"
  | "whatsapp_click"
  | "email_click"
  | "outbound_click"
  | "plan_select"
  | "calculator_use"
  | "form_start"
  | "scroll_depth";

export type TrackPayload = {
  type: TrackType;
  /** What exactly was clicked, e.g. "hero-demo" or "scroll_50". */
  name?: string;
  props?: Record<string, unknown>;
  durationMs?: number;
};

export type ConsentChoice = "granted" | "denied";

const COLLECT_URL = "/api/analytics/collect";
const ATTR_KEY = "ledgr_attr_v1";
const CONSENT_COOKIE = "ledgr_consent";

/** Master switch: set NEXT_PUBLIC_ANALYTICS_ENABLED=false to ship nothing. */
export const ANALYTICS_ENABLED =
  (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED ?? "true").trim().toLowerCase() !== "false";

/**
 * Whether a pageview is still counted when the visitor hasn't answered the
 * banner. Server-side these are stored with no identifier at all.
 */
export const COUNT_ANONYMOUS_BEFORE_CONSENT =
  (process.env.NEXT_PUBLIC_ANALYTICS_ANONYMOUS_BEFORE_CONSENT ?? "true")
    .trim()
    .toLowerCase() !== "false";

/* ------------------------------- consent -------------------------------- */

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

let cachedConsent: ConsentChoice | null | undefined;

export function getConsent(): ConsentChoice | null {
  if (cachedConsent !== undefined) return cachedConsent;
  const raw = readCookie(CONSENT_COOKIE);
  cachedConsent = raw === "granted" || raw === "denied" ? raw : null;
  return cachedConsent;
}

/** True when full (identified) tracking may run. */
export function canIdentify(): boolean {
  return getConsent() === "granted";
}

/** True when *any* event at all may be sent — identified or anonymous. */
export function canSendAnything(): boolean {
  return canIdentify() || COUNT_ANONYMOUS_BEFORE_CONSENT;
}

const consentListeners = new Set<(choice: ConsentChoice) => void>();

export function onConsentChange(listener: (choice: ConsentChoice) => void): () => void {
  consentListeners.add(listener);
  return () => consentListeners.delete(listener);
}

/**
 * `useSyncExternalStore` plumbing for the React components.
 *
 * A cookie can't be read during server rendering, so the components subscribe
 * here: the server snapshot is always "undecided", the client snapshot is the
 * real cached choice, and React reconciles the two after hydration without a
 * mismatch.
 */
const storeListeners = new Set<() => void>();

export function subscribeConsent(listener: () => void): () => void {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

/** Never changes: used purely to run "am I on the client yet?" detection. */
export function subscribeNever(): () => void {
  return () => {};
}

function notifyStore(): void {
  for (const listener of storeListeners) {
    try {
      listener();
    } catch {
      /* one bad listener must not stop the rest */
    }
  }
}

/** Records the choice server-side (cookie + audit row), then flushes. */
export async function setConsent(choice: ConsentChoice): Promise<void> {
  cachedConsent = choice;
  try {
    await fetch(COLLECT_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: choice }),
      keepalive: true,
    });
  } catch {
    // The cookie may not have been written; the banner can be re-answered.
  }
  for (const listener of consentListeners) {
    try {
      listener(choice);
    } catch {
      /* a listener must never break the others */
    }
  }
  notifyStore();
  if (choice === "granted") void flush();
}

/* ----------------------------- attribution ------------------------------ */

type Attribution = {
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
};

let attributionCache: Attribution | null = null;

/**
 * Campaign + referrer snapshot, captured once per tab session and reused for
 * every later pageview, so the channel doesn't change as the visitor browses.
 *
 * `?ref=` is this site's own light-weight campaign tag (the demo links use it),
 * so it doubles as `utm_source` when no explicit UTM is present.
 */
export function getAttribution(): Attribution {
  if (attributionCache) return attributionCache;
  if (typeof window === "undefined") {
    return {
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    };
  }

  const empty: Attribution = {
    referrer: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
  };

  try {
    const stored = sessionStorage.getItem(ATTR_KEY);
    if (stored) {
      attributionCache = JSON.parse(stored) as Attribution;
      return attributionCache;
    }
  } catch {
    /* private mode, storage disabled — fall through and capture fresh */
  }

  let captured: Attribution = { ...empty };
  try {
    const params = new URLSearchParams(window.location.search);
    const pick = (key: string) => {
      const value = params.get(key)?.trim();
      return value ? value.slice(0, 160) : null;
    };

    // document.referrer is only useful for an *external* arrival; an internal
    // page-to-page hop would otherwise relabel the whole session "internal".
    let referrer = params.get("ref") ? null : document.referrer || null;
    if (referrer) {
      const host = new URL(referrer).hostname;
      if (host === window.location.hostname) referrer = null;
    }

    captured = {
      referrer,
      utmSource: pick("utm_source") || pick("ref"),
      utmMedium: pick("utm_medium"),
      utmCampaign: pick("utm_campaign"),
      utmContent: pick("utm_content"),
      utmTerm: pick("utm_term"),
    };
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(captured));
  } catch {
    /* capture is best-effort */
  }

  attributionCache = captured;
  return captured;
}

/* ------------------------------- transport ------------------------------- */

let queue: TrackPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function viewportBucket(): string {
  const width = typeof window === "undefined" ? 0 : window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function send(events: TrackPayload[], beacon: boolean): void {
  if (!ANALYTICS_ENABLED || typeof window === "undefined" || !events.length) return;

  const payload = JSON.stringify({
    events: events.map((event) => ({
      ...event,
      path: window.location.pathname + window.location.search,
      title: document.title,
    })),
    attribution: getAttribution(),
    viewport: viewportBucket(),
  });

  try {
    if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      // sendBeacon survives the page being torn down (unload/visibilitychange).
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(COLLECT_URL, blob)) return;
    }
    void fetch(COLLECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    /* never let analytics throw into the page */
  }
}

function scheduleFlush(delay = 800): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, delay);
}

export async function flush(beacon = false): Promise<void> {
  if (!queue.length) return;
  const events = queue;
  queue = [];
  send(events, beacon);
}

/** The only public way to record something. */
export function track(payload: TrackPayload): void {
  if (!ANALYTICS_ENABLED || typeof window === "undefined") return;
  try {
    // Pageviews are allowed pre-consent (counted anonymously server-side).
    // Everything else waits until the visitor has agreed.
    if (payload.type !== "pageview" && !canIdentify()) return;
    if (payload.type === "pageview" && !canSendAnything()) return;

    queue.push(payload);
    if (queue.length >= 10) void flush();
    else scheduleFlush();
  } catch {
    /* ignore */
  }
}

/** Flushes immediately when the tab is going away, with the exit duration. */
export function trackPageLeave(durationMs: number): void {
  if (!canIdentify()) return;
  try {
    queue.push({ type: "pageleave", durationMs });
    flush(true);
  } catch {
    /* ignore */
  }
}

/* --------------------------- automatic tracking -------------------------- */

/**
 * One delegated click listener covers every link and button on the site —
 * including ones added later — and classifies it by destination. Plain links
 * need no code; anything ambiguous gets a `data-track` attribute.
 */
export function classifyClick(
  href: string,
  dataTrack?: string | null,
): { type: TrackType; name: string } | null {
  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const appHost = (() => {
    try {
      return new URL(site.appUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  if (url.protocol === "mailto:") {
    return { type: "email_click", name: dataTrack || "mailto" };
  }
  if (host.includes("wa.me") || host.includes("whatsapp.com")) {
    return { type: "whatsapp_click", name: dataTrack || "whatsapp" };
  }
  if (host === appHost) {
    const ref = url.searchParams.get("ref");
    if (url.pathname.startsWith("/demo")) {
      return { type: "demo_click", name: ref || dataTrack || "demo" };
    }
    if (/register|signup|sign-up/.test(url.pathname)) {
      return { type: "signup_click", name: ref || dataTrack || "register" };
    }
    if (/login|signin|sign-in/.test(url.pathname)) {
      return { type: "signin_click", name: ref || dataTrack || "login" };
    }
    return { type: "outbound_click", name: dataTrack || url.pathname };
  }
  if (host !== window.location.hostname.replace(/^www\./, "")) {
    return { type: "outbound_click", name: dataTrack || host };
  }
  // Same-origin: only interesting when the site says so explicitly.
  return dataTrack ? { type: "cta_click", name: dataTrack } : null;
}

let autoTrackingInstalled = false;

/**
 * Installs the delegated listeners: link clicks, scroll depth, and the
 * form_start signal that powers the "started a form and vanished" segment.
 * Idempotent, so a re-mount is harmless.
 */
export function installAutoTracking(): () => void {
  if (typeof window === "undefined" || autoTrackingInstalled) return () => {};
  autoTrackingInstalled = true;

  const onClick = (event: MouseEvent) => {
    try {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.("a,[data-track]") as HTMLElement | null;
      if (!el) return;

      const dataTrack = el.getAttribute("data-track");
      const href = el.getAttribute("href");

      // Explicit data-track on a non-link (a button, say) wins outright.
      if (!href && dataTrack) {
        track({ type: "cta_click", name: dataTrack });
        return;
      }
      if (!href) return;

      const classified = classifyClick(href, dataTrack);
      if (classified) track({ type: classified.type, name: classified.name });

      // Plan pickers get a second, funnel-friendly event. The href is resolved
      // first, so a relative "/register" link counts the same as an absolute one.
      const plan = el.getAttribute("data-plan") || dataTrack?.replace(/^plan-/, "");
      if (plan) {
        let absolute = "";
        try {
          absolute = new URL(href, window.location.origin).href;
        } catch {
          absolute = href;
        }
        if (absolute.includes(site.appUrl)) {
          track({ type: "plan_select", name: plan, props: { plan } });
        }
      }
    } catch {
      /* ignore */
    }
  };

  const scrollMarks = new Set<number>();
  const onScroll = () => {
    try {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 240) return; // short pages say nothing about depth
      const percent = Math.round((window.scrollY / scrollable) * 100);
      for (const mark of [50, 90]) {
        if (percent >= mark && !scrollMarks.has(mark)) {
          scrollMarks.add(mark);
          track({ type: "scroll_depth", name: `scroll_${mark}`, props: { percent: mark } });
        }
      }
    } catch {
      /* ignore */
    }
  };

  const onFocusIn = (event: Event) => {
    try {
      const form = (event.target as HTMLElement | null)?.closest?.("form");
      if (!form) return;
      const key = form.getAttribute("aria-label") || form.id || "form";
      const trackerKey = `ledgr_form_${key}`;
      if (sessionStorage.getItem(trackerKey)) return;
      sessionStorage.setItem(trackerKey, "1");
      track({ type: "form_start", name: key });
    } catch {
      /* ignore */
    }
  };

  window.addEventListener("click", onClick, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("focusin", onFocusIn, true);

  return () => {
    window.removeEventListener("click", onClick, true);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("focusin", onFocusIn, true);
    autoTrackingInstalled = false;
  };
}
