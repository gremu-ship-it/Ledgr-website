import Link from "next/link";
import { BarList, FunnelChart, Stat, TrafficChart } from "@/components/admin/Charts";
import { CHANNEL_LABELS } from "@/lib/analytics";
import { countLabel, delta, formatDuration, timeAgo } from "@/lib/format";
import { SEGMENTS, filterBySegment, listAudience } from "@/lib/marketing";
import {
  getChannels,
  getDailySeries,
  getDeviceBreakdown,
  getFunnel,
  getGeoBreakdown,
  getLiveVisitors,
  getOverview,
  getPreviousOverview,
  getRecentEvents,
  getTableSizes,
  getTopPages,
  getTopSources,
} from "@/lib/reporting";
import { providerStatus } from "@/lib/esp";

export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90] as const;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = (PERIODS as readonly number[]).includes(Number(params.days))
    ? Number(params.days)
    : 7;

  // One round of queries, in parallel — the dashboard is a live view, so it
  // always reads fresh rather than caching somebody else's numbers.
  const [
    overview,
    previous,
    series,
    funnel,
    pages,
    sources,
    channels,
    devices,
    geo,
    live,
    events,
    sizes,
    audience,
  ] = await Promise.all([
    getOverview(days),
    getPreviousOverview(days),
    getDailySeries(Math.max(days, 30)),
    getFunnel(Math.max(days, 30)),
    getTopPages(days, 8),
    getTopSources(days, 8),
    getChannels(days),
    getDeviceBreakdown(days),
    getGeoBreakdown(days, 6),
    getLiveVisitors(),
    getRecentEvents(25),
    getTableSizes(),
    listAudience(),
  ]);

  const hotLeads = filterBySegment(audience, "hot");
  const demoNoSignup = filterBySegment(audience, "demo-no-signup");
  const provider = providerStatus();

  const periodLabel = days === 7 ? "last 7 days" : `last ${days} days`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            First-party numbers for {periodLabel}
            {sizes?.oldest_event
              ? ` · recording since ${new Date(sizes.oldest_event).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm">
          {PERIODS.map((option) => (
            <Link
              key={option}
              href={`/admin?days=${option}`}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                option === days
                  ? "bg-brand-700 text-white"
                  : "text-ink-soft hover:bg-slate-50"
              }`}
            >
              {option}d
            </Link>
          ))}
        </div>
      </div>

      {/* ── Numbers ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Visitors"
          value={overview.visitors}
          delta={delta(overview.visitors, previous.visitors)}
          hint="identified browsers"
        />
        <Stat
          label="Page views"
          value={overview.pageviews}
          delta={delta(overview.pageviews, previous.pageviews)}
          hint={`${overview.pageviewsPerSession} per visit`}
        />
        <Stat
          label="Visits"
          value={overview.sessions}
          delta={delta(overview.sessions, previous.sessions)}
          hint={`${overview.bounceRate}% bounced`}
        />
        <Stat
          label="Got in touch"
          value={overview.conversions}
          delta={delta(overview.conversions, previous.conversions)}
          hint={`${overview.conversionRate}% of visitors`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Avg. time on site" value={formatDuration(overview.avgSeconds)} />
        <Stat label="New contacts" value={overview.newContacts} hint="from all forms" />
        <Stat
          label="Opted in to marketing"
          value={overview.optedIn}
          hint="can be emailed"
        />
        <Stat
          label="Messages sent"
          value={overview.messagesSent}
          hint={provider.ready ? provider.label : "composer mode"}
        />
      </div>

      {/* ── Things to act on ────────────────────────────────────────── */}
      {(hotLeads.length > 0 || !provider.ready) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {hotLeads.length > 0 ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm font-semibold text-ink">
                {countLabel(hotLeads.length, "person", "people")} worth following up with
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                High intent — demo, pricing and calculator activity — and nobody has
                reached out in over a week.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Link
                  href="/admin/campaigns?segment=hot"
                  className="rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white transition hover:bg-brand-800"
                >
                  Start a follow-up
                </Link>
                <Link
                  href="/admin/contacts?segment=hot"
                  className="rounded-xl border border-brand-200 bg-white px-4 py-2 font-semibold text-ink-soft transition hover:bg-brand-100"
                >
                  See who they are
                </Link>
              </div>
            </div>
          ) : null}

          {demoNoSignup.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-ink">
                {countLabel(demoNoSignup.length, "person", "people")} tried the demo but didn&apos;t register
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Usually a question, not a rejection. A short email with one clear answer
                converts these best.
              </p>
              <Link
                href="/admin/campaigns?segment=demo-no-signup"
                className="mt-3 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-slate-50"
              >
                Draft the follow-up
              </Link>
            </div>
          ) : null}

          {!provider.ready ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-ink">Email sending: {provider.label}</p>
              <p className="mt-1 text-sm text-ink-soft">{provider.hint}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Traffic ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Traffic, day by day</h2>
          <p className="text-xs text-slate-500">Africa/Blantyre days</p>
        </div>
        <TrafficChart data={series} />
        {overview.anonymousPageviews > 0 ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {countLabel(overview.anonymousPageviews, "page view")} in this period came from
            visitors who declined cookies. They&apos;re counted in the totals but have no
            visitor profile and no history — by design.
          </p>
        ) : null}
      </section>

      {/* ── Funnel + where they came from ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            From visitor to lead ({Math.max(days, 30)} days)
          </h2>
          <FunnelChart steps={funnel} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Where they came from</h2>
          <BarList
            items={sources.map((row) => ({
              label:
                CHANNEL_LABELS[row.label] ||
                row.label.charAt(0).toUpperCase() + row.label.slice(1),
              value: row.visitors,
            }))}
            emptyText="No visits recorded in this period."
          />
          {channels.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs">
              {channels.map((channel) => (
                <span
                  key={channel.label}
                  className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-ink-soft"
                >
                  {CHANNEL_LABELS[channel.label] || channel.label}: {channel.visitors}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* ── Pages, devices, geography ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Most-read pages</h2>
          <BarList
            items={pages.map((row) => ({
              label: row.path || "/",
              value: row.views,
              sub: `${row.visitors} visitors`,
            }))}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Devices</h2>
          <BarList items={devices.map((row) => ({ label: row.label, value: row.visitors }))} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Places</h2>
          <BarList items={geo.map((row) => ({ label: row.label, value: row.visitors }))} />
        </section>
      </div>

      {/* ── Live + stream ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">On the site right now</h2>
            <Link href="/admin/visitors" className="text-xs font-medium text-brand-700 hover:underline">
              All visitors →
            </Link>
          </div>
          {live.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Nobody active in the last 5 minutes.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {live.map((session) => (
                <li key={session.session_id} className="flex items-center gap-3 py-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {session.contact_email || session.exit_path || session.landing_path || "—"}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {session.device || "?"} · {formatDuration(session.seconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Latest activity</h2>
          {events.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nothing recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {events.map((event) => (
                <li key={event.id} className="flex items-baseline gap-3">
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(event.created_at)}</span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-ink">{event.type.replace(/_/g, " ")}</span>
                    {event.name ? <span className="text-slate-500"> · {event.name}</span> : null}
                    {event.path ? <span className="text-slate-400"> · {event.path}</span> : null}
                  </span>
                  {event.contact_email ? (
                    <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-800">
                      known
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── What this costs / what's in the database ────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink">Where the numbers come from</h2>
        <p className="mt-1 text-sm text-slate-500">
          {sizes?.events ?? 0} events, {sizes?.sessions ?? 0} visits and {sizes?.visitors ?? 0}{" "}
          visitor profiles stored in your own database. Segments available for follow-up:{" "}
          {SEGMENTS.length}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/contacts"
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-ink-soft transition hover:bg-slate-50"
          >
            Contacts
          </Link>
          <Link
            href="/admin/campaigns"
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-ink-soft transition hover:bg-slate-50"
          >
            Campaigns
          </Link>
          <Link
            href="/admin/contacts/export"
            prefetch={false}
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-ink-soft transition hover:bg-slate-50"
          >
            Export contacts (CSV)
          </Link>
        </div>
      </section>
    </div>
  );
}
