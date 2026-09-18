import { getDb } from "@/db";
import {
  analyticsConsent,
  analyticsEvents,
  analyticsSessions,
  analyticsVisitors,
  contactVisitors,
  type NewAnalyticsEvent,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  COOKIE_CONSENT,
  COOKIE_SESSION,
  COOKIE_VISITOR,
  CONSENT_VERSION,
  attribute,
  clientIp,
  consentState,
  geoFromHeaders,
  hashIp,
  isConversion,
  isEventType,
  looksLikeBot,
  newSessionId,
  newVisitorId,
  parseUserAgent,
  readCookie,
  serializeCookie,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * The one endpoint the browser tracker talks to.
 *
 * Contract, in order of importance:
 *  1. Nothing identifying is stored without consent. When the visitor has
 *     accepted, we set a first-party visitor id and join events to it. When
 *     they've declined — or haven't chosen yet — the pageview is recorded with
 *     no id and no cookie at all, so aggregate traffic stays honest and nobody
 *     is identified. Set NEXT_PUBLIC_ANALYTICS_ANONYMOUS_BEFORE_CONSENT=false
 *     to drop those too.
 *  2. A tracking failure must never break the site. Every path returns 204 and
 *     swallows errors; the worst case is a missing pageview.
 *  3. No raw IP is ever written — only a salted hash, for rate limiting.
 */

const MAX_BATCH = 25;
const SESSION_IDLE_SECONDS = 30 * 60;
const RATE_LIMIT_PER_MINUTE = 240;

/** In-memory rate limit. Per instance, which is plenty for abuse control. */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string | null): boolean {
  if (!key) return false;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MINUTE;
}

type IncomingEvent = {
  type?: unknown;
  name?: unknown;
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  props?: unknown;
  durationMs?: unknown;
};

type TrackBody = {
  events?: IncomingEvent[];
  /** Session attribution snapshot; the tracker owns it in sessionStorage. */
  attribution?: Record<string, unknown>;
  /** "mobile" | "tablet" | "desktop", stored on the first pageview's props. */
  viewport?: unknown;
};

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function num(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(Math.round(value), max));
}

/** Keep only small, JSON-safe props — a raw client blob is never stored. */
function sanitizeProps(props: unknown): Record<string, unknown> | null {
  if (!props || typeof props !== "object" || Array.isArray(props)) return null;
  const out: Record<string, unknown> = {};
  let keys = 0;
  for (const [key, value] of Object.entries(props as Record<string, unknown>)) {
    if (keys >= 12) break;
    const name = key.slice(0, 40);
    if (typeof value === "string") out[name] = value.slice(0, 200);
    else if (typeof value === "number" && Number.isFinite(value)) out[name] = value;
    else if (typeof value === "boolean") out[name] = value;
    else continue;
    keys += 1;
  }
  return keys ? out : null;
}

/** Which contact (if any) this browser has already been linked to. */
async function linkedContactId(
  db: ReturnType<typeof getDb>,
  visitorId: string,
): Promise<number | null> {
  const [row] = await db
    .select({ contactId: contactVisitors.contactId })
    .from(contactVisitors)
    .where(eq(contactVisitors.visitorId, visitorId))
    .orderBy(sql`${contactVisitors.lastSeenAt} desc`)
    .limit(1);
  return row?.contactId ?? null;
}

function noContent(cookies: string[] = []): Response {
  const response = new Response(null, { status: 204 });
  for (const cookie of cookies) response.headers.append("set-cookie", cookie);
  return response;
}

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return noContent();
  }

  const userAgent = request.headers.get("user-agent");
  if (looksLikeBot(userAgent)) return noContent();

  const ipHash = hashIp(clientIp(request));
  if (rateLimited(ipHash)) return noContent();

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_BATCH) : [];
  if (!events.length) return noContent();

  // "undecided" behaves like declined for identity: aggregate counts only.
  const canIdentify = consentState(request) === "granted";

  const headerCookies: string[] = [];
  const geo = geoFromHeaders(request);
  const ua = parseUserAgent(userAgent);
  const language =
    (request.headers.get("accept-language") || "").split(",")[0]?.trim() || null;
  const selfHost = (() => {
    try {
      return new URL(request.url).hostname;
    } catch {
      return null;
    }
  })();

  const attribution = attribute(
    {
      referrer: str(body.attribution?.referrer, 2000),
      utmSource: str(body.attribution?.utmSource, 160),
      utmMedium: str(body.attribution?.utmMedium, 160),
      utmCampaign: str(body.attribution?.utmCampaign, 160),
      utmContent: str(body.attribution?.utmContent, 160),
      utmTerm: str(body.attribution?.utmTerm, 160),
    },
    selfHost,
  );

  try {
    const db = getDb();

    let visitorId: string | null = null;
    let sessionId: string | null = null;

    if (canIdentify) {
      visitorId = readCookie(request, COOKIE_VISITOR);
      const known = visitorId
        ? await db
            .select({ id: analyticsVisitors.id })
            .from(analyticsVisitors)
            .where(eq(analyticsVisitors.visitorId, visitorId))
            .limit(1)
        : [];

      if (!visitorId || known.length === 0) {
        // A cookie we never issued, or one whose row was pruned: start clean.
        visitorId = newVisitorId();
        await db
          .insert(analyticsVisitors)
          .values({
            visitorId,
            firstLandingPath: str(events[0]?.path, 300),
            firstReferrer: str(body.attribution?.referrer, 2000),
            firstReferrerHost: attribution.referrerHost,
            firstChannel: attribution.channel,
            utmSource: attribution.utmSource,
            utmMedium: attribution.utmMedium,
            utmCampaign: attribution.utmCampaign,
            utmContent: attribution.utmContent,
            utmTerm: attribution.utmTerm,
            ...geo,
            ...ua,
            language,
            ipHash,
          })
          .onConflictDoNothing({ target: analyticsVisitors.visitorId });
      }

      headerCookies.push(
        serializeCookie(COOKIE_VISITOR, visitorId, { maxAge: 60 * 60 * 24 * 365 }),
      );

      // ---- session: 30-minute idle window, tracked server-side ----
      const cookieSession = readCookie(request, COOKIE_SESSION);
      sessionId = cookieSession || newSessionId();

      if (!cookieSession) {
        await db
          .insert(analyticsSessions)
          .values({
            sessionId,
            visitorId,
            landingPath: str(events[0]?.path, 300),
            exitPath: str(events[events.length - 1]?.path, 300),
            referrer: str(body.attribution?.referrer, 2000),
            referrerHost: attribution.referrerHost,
            channel: attribution.channel,
            utmSource: attribution.utmSource,
            utmMedium: attribution.utmMedium,
            utmCampaign: attribution.utmCampaign,
            utmContent: attribution.utmContent,
            utmTerm: attribution.utmTerm,
            ...geo,
            ...ua,
            language,
            ipHash,
          })
          .onConflictDoNothing({ target: analyticsSessions.sessionId });

        await db
          .update(analyticsVisitors)
          .set({
            sessionCount: sql`${analyticsVisitors.sessionCount} + 1`,
            lastSeenAt: new Date(),
          })
          .where(eq(analyticsVisitors.visitorId, visitorId));
      }

      // Refreshed on every hit, so it expires 30 minutes after the *last*
      // action rather than at a fixed time.
      headerCookies.push(
        serializeCookie(COOKIE_SESSION, sessionId, { maxAge: SESSION_IDLE_SECONDS }),
      );
    }

    // ---- events ----
    const rows: NewAnalyticsEvent[] = [];
    let pageviews = 0;
    let conversions = 0;
    let engagedSeconds = 0;

    for (const event of events) {
      if (!isEventType(event.type)) continue;
      const type = event.type;
      const durationMs = num(event.durationMs, 24 * 60 * 60 * 1000);
      const props = sanitizeProps(event.props);

      if (type === "pageview") pageviews += 1;
      if (isConversion(type)) conversions += 1;
      if (type === "pageleave" && durationMs) {
        // Cap a single page at 30 minutes: a forgotten tab isn't engagement.
        engagedSeconds += Math.round(Math.min(durationMs, 30 * 60 * 1000) / 1000);
      }

      rows.push({
        visitorId,
        sessionId,
        type,
        name: str(event.name, 160),
        path: str(event.path, 300) || str(events[0]?.path, 300),
        title: str(event.title, 200),
        referrer: str(event.referrer, 2000),
        channel: attribution.channel,
        props:
          type === "pageview" && !props
            ? { viewport: str(body.viewport, 20) ?? "unknown" }
            : props,
        durationMs,
        createdAt: new Date(),
      });
    }

    if (rows.length) {
      // Events inherit contactId once a person is identified, which keeps the
      // contact timeline a single indexed query.
      const contactId = visitorId ? await linkedContactId(db, visitorId) : null;
      for (const row of rows) row.contactId = contactId;
      await db.insert(analyticsEvents).values(rows);
    }

    if (visitorId && pageviews) {
      await db
        .update(analyticsVisitors)
        .set({
          lastSeenAt: new Date(),
          pageviewCount: sql`${analyticsVisitors.pageviewCount} + ${pageviews}`,
        })
        .where(eq(analyticsVisitors.visitorId, visitorId));
    }

    if (sessionId && rows.length) {
      const exitPath = [...rows].reverse().find((r) => r.path)?.path ?? null;
      await db
        .update(analyticsSessions)
        .set({
          lastSeenAt: new Date(),
          exitPath,
          pageviewCount: sql`${analyticsSessions.pageviewCount} + ${pageviews}`,
          eventCount: sql`${analyticsSessions.eventCount} + ${rows.length}`,
          engagedSeconds: sql`${analyticsSessions.engagedSeconds} + ${engagedSeconds}`,
          // A bounce is a single pageview and under 10 seconds of attention.
          isBounce: sql`NOT ((${analyticsSessions.pageviewCount} + ${pageviews}) > 1 OR (${analyticsSessions.engagedSeconds} + ${engagedSeconds}) >= 10)`,
          converted: conversions ? true : sql`${analyticsSessions.converted}`,
        })
        .where(eq(analyticsSessions.sessionId, sessionId));
    }

    return noContent(headerCookies);
  } catch {
    // Analytics is never allowed to surface an error to a visitor.
    return noContent();
  }
}

/**
 * PUT /api/analytics/collect — records a cookie-banner choice, writes the
 * consent cookie and (on accept) mints the visitor id. Kept on the same route
 * so there is exactly one analytics endpoint to reason about.
 */
export async function PUT(request: Request) {
  let body: { decision?: unknown };
  try {
    body = (await request.json()) as { decision?: unknown };
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const decision = body.decision === "granted" ? "granted" : "denied";
  const existingVisitor = readCookie(request, COOKIE_VISITOR);
  const visitorId =
    decision === "granted" ? existingVisitor || newVisitorId() : null;

  try {
    await getDb()
      .insert(analyticsConsent)
      .values({
        visitorId,
        action: decision,
        policyVersion: CONSENT_VERSION,
        ipHash: hashIp(clientIp(request)),
        userAgent: request.headers.get("user-agent")?.slice(0, 500) || null,
      });
  } catch {
    // A failed audit write must not block the visitor's choice.
  }

  const response = Response.json({ ok: true, decision });
  response.headers.append(
    "set-cookie",
    serializeCookie(COOKIE_CONSENT, decision, { maxAge: 60 * 60 * 24 * 180 }),
  );
  if (visitorId) {
    response.headers.append(
      "set-cookie",
      serializeCookie(COOKIE_VISITOR, visitorId, { maxAge: 60 * 60 * 24 * 365 }),
    );
  }
  return response;
}
