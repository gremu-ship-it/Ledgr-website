import { getDb } from "@/db";
import { sql, type SQL } from "drizzle-orm";

/**
 * Read-side queries for the admin dashboard.
 *
 * Written as plain SQL against the analytics tables: window functions and
 * `filter (where …)` aggregates express these reports far more directly than
 * an ORM chain would, and everything here is read-only.
 *
 * Days are bucketed in Africa/Blantyre time. A visitor at 01:00 in Lilongwe
 * should appear on the day they'd say it is, not the previous UTC day.
 */

/**
 * Day buckets are cut in Malawi time (CAT = UTC+2, no daylight saving).
 *
 * Expressed as a fixed offset rather than `at time zone 'Africa/Blantyre'`:
 * named zones depend on the server's tz database, which slim Postgres builds
 * (and some containers) don't ship — and for a country without DST the offset
 * is exactly equivalent.
 */
const CAT_OFFSET = sql.raw("interval '2 hours'");

/** A timestamptz column as a Malawi-local calendar date. */
function localDay(column: SQL): SQL {
  return sql`((${column} at time zone 'UTC') + ${CAT_OFFSET})::date`;
}

/** Today's date in Malawi. */
const todayCat = sql`(((now() at time zone 'UTC') + ${CAT_OFFSET})::date)`;

async function rows<T extends Record<string, unknown>>(query: SQL): Promise<T[]> {
  const result = await getDb().execute<T>(query);
  return (result as unknown as { rows: T[] }).rows ?? [];
}

/* -------------------------------- overview -------------------------------- */

export type Overview = {
  visitors: number;
  sessions: number;
  pageviews: number;
  anonymousPageviews: number;
  pageviewsPerSession: number;
  bounceRate: number;
  avgSeconds: number;
  conversions: number;
  conversionRate: number;
  newContacts: number;
  optedIn: number;
  unsubscribed: number;
  messagesSent: number;
};

export type Period = { days: number };

/** `days` buckets ending today, e.g. 7 = today plus the previous six. */
function since(days: number): SQL {
  return sql`now() - ${sql.raw(`interval '${Math.max(1, Math.min(days, 365))} days'`)}`;
}

export async function getOverview(days = 7): Promise<Overview> {
  const [current] = await rows<{
    visitors: number;
    sessions: number;
    pageviews: number;
    anonymous_pageviews: number;
    event_pageviews: number;
    bounced: number;
    avg_seconds: number | null;
    conversions: number;
  }>(sql`
    with ev as (
      select * from analytics_events where created_at >= ${since(days)}
    ),
    sess as (
      select * from analytics_sessions where started_at >= ${since(days)}
    )
    select
      (select count(*) from analytics_visitors where last_seen_at >= ${since(days)})::int as visitors,
      (select count(*) from sess)::int as sessions,
      (select count(*) from ev where type = 'pageview' and visitor_id is null)::int as anonymous_pageviews,
      (select count(*) from ev where type = 'pageview' and visitor_id is not null)::int as event_pageviews,
      (select count(*) from ev where type = 'pageview')::int as pageviews,
      (select count(*) from sess where is_bounce)::int as bounced,
      (select avg(engaged_seconds) from sess)::float as avg_seconds,
      (select count(distinct visitor_id) from ev
        where visitor_id is not null
          and type in ('form_submit','newsletter_signup','signup_click'))::int as conversions
  `);

  const [contacts] = await rows<{
    new_contacts: number;
    opted_in: number;
    unsubscribed: number;
  }>(sql`
    select
      count(*) filter (where created_at >= ${since(days)})::int        as new_contacts,
      count(*) filter (where marketing_opt_in and unsubscribed_at is null)::int as opted_in,
      count(*) filter (where unsubscribed_at is not null)::int         as unsubscribed
    from contacts
  `);

  const [messages] = await rows<{ sent: number }>(sql`
    select count(*)::int as sent from campaign_messages
    where created_at >= ${since(days)}
  `);

  const sessions = current?.sessions ?? 0;
  const pageviews = current?.pageviews ?? 0;
  const conversions = current?.conversions ?? 0;
  const identifiedPageviews = current?.event_pageviews ?? 0;

  return {
    visitors: current?.visitors ?? 0,
    sessions,
    pageviews,
    anonymousPageviews: current?.anonymous_pageviews ?? 0,
    pageviewsPerSession: sessions ? Math.round((pageviews / sessions) * 10) / 10 : 0,
    bounceRate: sessions ? Math.round(((current?.bounced ?? 0) / sessions) * 100) : 0,
    avgSeconds: Math.round(current?.avg_seconds ?? 0),
    conversions,
    conversionRate: identifiedPageviews
      ? Math.round((conversions / identifiedPageviews) * 1000) / 10
      : 0,
    newContacts: contacts?.new_contacts ?? 0,
    optedIn: contacts?.opted_in ?? 0,
    unsubscribed: contacts?.unsubscribed ?? 0,
    messagesSent: messages?.sent ?? 0,
  };
}

/** Same numbers for the preceding window, so the dashboard can show change. */
export async function getPreviousOverview(days = 7): Promise<Overview> {
  const [row] = await rows<{
    visitors: number;
    sessions: number;
    pageviews: number;
    conversions: number;
  }>(sql`
    select
      (select count(distinct visitor_id) from analytics_events
        where visitor_id is not null
          and created_at >= ${since(days * 2)} and created_at < ${since(days)})::int as visitors,
      (select count(*) from analytics_sessions
        where started_at >= ${since(days * 2)} and started_at < ${since(days)})::int as sessions,
      (select count(*) from analytics_events
        where type = 'pageview'
          and created_at >= ${since(days * 2)} and created_at < ${since(days)})::int as pageviews,
      (select count(distinct visitor_id) from analytics_events
        where visitor_id is not null
          and type in ('form_submit','newsletter_signup','signup_click')
          and created_at >= ${since(days * 2)} and created_at < ${since(days)})::int as conversions
  `);

  return {
    visitors: row?.visitors ?? 0,
    sessions: row?.sessions ?? 0,
    pageviews: row?.pageviews ?? 0,
    anonymousPageviews: 0,
    pageviewsPerSession: 0,
    bounceRate: 0,
    avgSeconds: 0,
    conversions: row?.conversions ?? 0,
    conversionRate: 0,
    newContacts: 0,
    optedIn: 0,
    unsubscribed: 0,
    messagesSent: 0,
  };
}

/* ------------------------------- timeseries ------------------------------- */

export type DayPoint = {
  day: string;
  visitors: number;
  sessions: number;
  pageviews: number;
};

export async function getDailySeries(days = 30): Promise<DayPoint[]> {
  return rows<DayPoint>(sql`
    with buckets as (
      select generate_series(
        ${todayCat} - ${sql.raw(`interval '${Math.max(1, Math.min(days, 365)) - 1} days'`)},
        ${todayCat},
        interval '1 day'
      )::date as day
    ),
    ev as (
      select ${localDay(sql.raw("created_at"))} as day, * from analytics_events
    ),
    sess as (
      select ${localDay(sql.raw("started_at"))} as day, visitor_id from analytics_sessions
    )
    select
      to_char(b.day, 'YYYY-MM-DD') as day,
      coalesce((select count(distinct e.visitor_id) from ev e
        where e.day = b.day and e.visitor_id is not null), 0)::int as visitors,
      coalesce((select count(*) from sess s where s.day = b.day), 0)::int as sessions,
      coalesce((select count(*) from ev e where e.day = b.day and e.type = 'pageview'), 0)::int as pageviews
    from buckets b
    order by b.day asc
  `);
}

/* --------------------------------- detail -------------------------------- */

export type PageRow = { path: string; views: number; visitors: number };
export type SourceRow = { label: string; visitors: number; sessions: number };
export type BreakdownRow = { label: string; visitors: number };

export async function getTopPages(days = 7, limit = 10): Promise<PageRow[]> {
  return rows<PageRow>(sql`
    select path, count(*)::int as views, count(distinct visitor_id)::int as visitors
    from analytics_events
    where type = 'pageview' and path is not null and created_at >= ${since(days)}
    group by path
    order by views desc
    limit ${limit}
  `);
}

/** Where visitors came from: the channel, plus the referrer host when known. */
export async function getTopSources(days = 7, limit = 10): Promise<SourceRow[]> {
  return rows<SourceRow>(sql`
    select
      coalesce(nullif(referrer_host, ''), channel) as label,
      count(*)::int as visitors,
      count(*)::int as sessions
    from analytics_sessions
    where started_at >= ${since(days)}
    group by 1
    order by visitors desc
    limit ${limit}
  `);
}

export async function getChannels(days = 7): Promise<BreakdownRow[]> {
  return rows<BreakdownRow>(sql`
    select channel as label, count(*)::int as visitors
    from analytics_sessions
    where started_at >= ${since(days)}
    group by channel
    order by visitors desc
  `);
}

export async function getDeviceBreakdown(days = 7): Promise<BreakdownRow[]> {
  return rows<BreakdownRow>(sql`
    select coalesce(device, 'unknown') as label, count(*)::int as visitors
    from analytics_sessions
    where started_at >= ${since(days)}
    group by 1
    order by visitors desc
  `);
}

export async function getGeoBreakdown(days = 7, limit = 8): Promise<BreakdownRow[]> {
  return rows<BreakdownRow>(sql`
    select coalesce(city, country, 'Unknown') as label, count(*)::int as visitors
    from analytics_sessions
    where started_at >= ${since(days)}
    group by 1
    order by visitors desc
    limit ${limit}
  `);
}

/* --------------------------------- funnel -------------------------------- */

export type FunnelStep = { label: string; visitors: number; hint: string };

export async function getFunnel(days = 30): Promise<FunnelStep[]> {
  const [row] = await rows<{
    arrived: number;
    engaged: number;
    intent: number;
    started: number;
    converted: number;
  }>(sql`
    select
      count(distinct visitor_id)::int as arrived,
      count(distinct visitor_id) filter (
        where type in ('scroll_depth','calculator_use','cta_click')
      )::int as engaged,
      count(distinct visitor_id) filter (
        where type = 'demo_click' or (type = 'pageview' and path like '/pricing%')
      )::int as intent,
      count(distinct visitor_id) filter (where type = 'form_start')::int as started,
      count(distinct visitor_id) filter (
        where type in ('form_submit','newsletter_signup','signup_click')
      )::int as converted
    from analytics_events
    where visitor_id is not null and created_at >= ${since(days)}
  `);

  return [
    { label: "Visited the site", visitors: row?.arrived ?? 0, hint: "any identified visitor" },
    { label: "Actually read something", visitors: row?.engaged ?? 0, hint: "scrolled, clicked or used the calculator" },
    { label: "Showed buying intent", visitors: row?.intent ?? 0, hint: "opened the demo or read pricing" },
    { label: "Started a form", visitors: row?.started ?? 0, hint: "began filling in a form" },
    { label: "Got in touch or signed up", visitors: row?.converted ?? 0, hint: "submitted a form or clicked to register" },
  ];
}

/* -------------------------------- visitors ------------------------------- */

export type VisitorRow = {
  visitor_id: string;
  last_seen_at: string;
  first_channel: string;
  first_landing_path: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  city: string | null;
  country: string | null;
  pageviews: number;
  sessions: number;
  seconds: number;
  contact_name: string | null;
  contact_email: string | null;
  contact_id: number | null;
  last_path: string | null;
};

/**
 * Recent visitors, newest activity first, with the person attached when the
 * browsing has been stitched to a contact.
 */
export async function getRecentVisitors(limit = 40): Promise<VisitorRow[]> {
  return rows<VisitorRow>(sql`
    select
      v.visitor_id,
      v.last_seen_at,
      v.first_channel,
      v.first_landing_path,
      v.first_referrer_host as referrer_host,
      v.utm_source,
      v.device, v.os, v.browser, v.city, v.country,
      v.pageview_count as pageviews,
      v.session_count as sessions,
      coalesce((select sum(s.engaged_seconds) from analytics_sessions s
        where s.visitor_id = v.visitor_id), 0)::int as seconds,
      (select (array_agg(e.path order by e.created_at desc) filter (where e.path is not null))[1]
        from analytics_events e where e.visitor_id = v.visitor_id) as last_path,
      c.name  as contact_name,
      c.email as contact_email,
      c.id    as contact_id
    from analytics_visitors v
    left join contact_visitors cv on cv.visitor_id = v.visitor_id
    left join contacts c on c.id = cv.contact_id
    order by v.last_seen_at desc
    limit ${limit}
  `);
}

export type LiveVisitor = {
  session_id: string;
  last_seen_at: string;
  landing_path: string | null;
  exit_path: string | null;
  channel: string;
  device: string | null;
  city: string | null;
  pageviews: number;
  seconds: number;
  contact_email: string | null;
};

/** Sessions active in the last five minutes. */
export async function getLiveVisitors(limit = 15): Promise<LiveVisitor[]> {
  return rows<LiveVisitor>(sql`
    select
      s.session_id, s.last_seen_at, s.landing_path, s.exit_path, s.channel,
      s.device, s.city, s.pageview_count as pageviews, s.engaged_seconds as seconds,
      c.email as contact_email
    from analytics_sessions s
    left join contacts c on c.id = s.contact_id
    where s.last_seen_at >= now() - interval '5 minutes'
    order by s.last_seen_at desc
    limit ${limit}
  `);
}

export type RawEvent = {
  id: number;
  type: string;
  name: string | null;
  path: string | null;
  created_at: string;
  visitor_id: string | null;
  contact_email: string | null;
};

export async function getRecentEvents(limit = 60): Promise<RawEvent[]> {
  return rows<RawEvent>(sql`
    select e.id, e.type, e.name, e.path, e.created_at, e.visitor_id, c.email as contact_email
    from analytics_events e
    left join contacts c on c.id = e.contact_id
    order by e.created_at desc
    limit ${limit}
  `);
}

/** Everything one contact did, newest first — the follow-up briefing. */
export async function getContactTimeline(contactId: number, limit = 200) {
  const events = await rows<{
    kind: string;
    type: string;
    name: string | null;
    path: string | null;
    created_at: string;
  }>(sql`
    select
      'event' as kind, e.type, e.name, e.path, e.created_at
    from analytics_events e
    where e.contact_id = ${contactId}
       or e.visitor_id in (
         select visitor_id from contact_visitors where contact_id = ${contactId}
       )
    union all
    select
      case when channel = 'whatsapp' then 'whatsapp' else 'email' end as kind,
      coalesce(status, 'queued') as type,
      coalesce(template_key, campaign) as name,
      null as path,
      created_at
    from campaign_messages
    where contact_id = ${contactId}
    order by created_at desc
    limit ${limit}
  `);
  return events;
}

export type ContactVisitorRow = {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  device: string | null;
  os: string | null;
  city: string | null;
  country: string | null;
};

/** The browsers stitched to one person — usually a phone and a laptop. */
export async function getContactVisitors(contactId: number): Promise<ContactVisitorRow[]> {
  return rows<ContactVisitorRow>(sql`
    select v.visitor_id, v.first_seen_at, v.last_seen_at, v.device, v.os, v.city, v.country
    from contact_visitors cv
    join analytics_visitors v on v.visitor_id = cv.visitor_id
    where cv.contact_id = ${contactId}
    order by v.last_seen_at desc
  `);
}

/** Per-day pageviews for a contact's stitched browsers (sparkline). */
export async function getContactTrend(contactId: number, days = 30) {
  return rows<{ day: string; views: number }>(sql`
    select to_char(${localDay(sql.raw("e.created_at"))}, 'YYYY-MM-DD') as day,
           count(*)::int as views
    from analytics_events e
    where e.type = 'pageview'
      and e.created_at >= ${since(days)}
      and e.visitor_id in (
        select visitor_id from contact_visitors where contact_id = ${contactId}
      )
    group by 1
    order by 1 asc
  `);
}

/* --------------------------- campaign reporting --------------------------- */

export type CampaignStat = {
  segment: string | null;
  channel: string;
  status: string;
  count: number;
};

export async function getCampaignStats(days = 30): Promise<CampaignStat[]> {
  return rows<CampaignStat>(sql`
    select segment, channel, status, count(*)::int as count
    from campaign_messages
    where created_at >= ${since(days)}
    group by 1, 2, 3
    order by count desc
  `);
}

export type MessageRow = {
  id: number;
  contact_id: number;
  email: string;
  name: string | null;
  channel: string;
  status: string;
  provider: string;
  subject: string | null;
  body: string;
  template_key: string | null;
  segment: string | null;
  error: string | null;
  created_at: string;
  sent_at: string | null;
};

export async function getRecentMessages(limit = 50): Promise<MessageRow[]> {
  return rows<MessageRow>(sql`
    select m.id, m.contact_id, c.email, c.name, m.channel, m.status, m.provider,
           m.subject, m.body, m.template_key, m.segment, m.error, m.created_at, m.sent_at
    from campaign_messages m
    join contacts c on c.id = m.contact_id
    order by m.created_at desc
    limit ${limit}
  `);
}

/** Counts used by the dashboard footer / retention report. */
export async function getTableSizes() {
  const [row] = await rows<{
    events: number;
    sessions: number;
    visitors: number;
    oldest_event: string | null;
  }>(sql`
    select
      (select count(*) from analytics_events)::int as events,
      (select count(*) from analytics_sessions)::int as sessions,
      (select count(*) from analytics_visitors)::int as visitors,
      (select min(created_at) from analytics_events)::text as oldest_event
  `);
  return row;
}
