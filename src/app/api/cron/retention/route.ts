import { getDb } from "@/db";
import { sql } from "drizzle-orm";
import { safeEqual } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Data retention. Raw analytics is pruned on a schedule so the database holds
 * "what happened recently", not an ever-growing archive of individual
 * browsing — which is both cheaper and easier to defend.
 *
 * What is pruned, and what deliberately isn't:
 *  - `analytics_events` and `analytics_sessions` older than
 *    ANALYTICS_RETENTION_DAYS (default 180) are deleted.
 *  - Visitors not seen for twice that window are deleted.
 *  - `contacts`, their notes and the outreach log are **kept**: those are
 *    records of a relationship, not tracking, and deleting them would lose the
 *    unsubscribe history.
 *  - `analytics_consent` is kept as evidence of the choice that was made.
 *
 * Protect it with CRON_SECRET and call it from Vercel Cron (see DEPLOY.md):
 *
 *     curl -H "Authorization: Bearer $CRON_SECRET" https://ledgr.mw/api/cron/retention
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("authorization") || "";
    const token = header.replace(/^Bearer\s+/i, "").trim();
    if (!token || !safeEqual(token, secret)) {
      return Response.json({ ok: false, error: "Unauthorised" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // No secret configured in production: refuse rather than expose an
    // endpoint that deletes data to anyone who finds the URL.
    return Response.json(
      { ok: false, error: "Set CRON_SECRET to enable this endpoint." },
      { status: 503 },
    );
  }

  const days = Math.max(
    30,
    Number(process.env.ANALYTICS_RETENTION_DAYS ?? 180) || 180,
  );
  const window = sql.raw(`interval '${days} days'`);
  const visitorWindow = sql.raw(`interval '${days * 2} days'`);
  // Bound each run so a long-neglected database can't hold a transaction open.
  const batch = 20_000;

  try {
    const db = getDb();

    const events = await db.execute(sql`
      delete from analytics_events
      where id in (
        select id from analytics_events
        where created_at < now() - ${window}
        limit ${batch}
      )
    `);
    const sessions = await db.execute(sql`
      delete from analytics_sessions
      where id in (
        select id from analytics_sessions
        where last_seen_at < now() - ${window}
        limit ${batch}
      )
    `);
    const visitors = await db.execute(sql`
      delete from analytics_visitors v
      where v.last_seen_at < now() - ${visitorWindow}
        and not exists (
          select 1 from contact_visitors cv where cv.visitor_id = v.visitor_id
        )
    `);

    const count = (result: unknown) =>
      (result as { rowCount?: number }).rowCount ?? 0;

    return Response.json({
      ok: true,
      retentionDays: days,
      deleted: {
        events: count(events),
        sessions: count(sessions),
        visitors: count(visitors),
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Unavailable" }, { status: 503 });
  }
}
