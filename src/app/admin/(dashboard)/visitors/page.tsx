import Link from "next/link";
import { CHANNEL_LABELS } from "@/lib/analytics";
import { formatDuration, timeAgo } from "@/lib/format";
import { getLiveVisitors, getRecentVisitors } from "@/lib/reporting";

export const dynamic = "force-dynamic";

/**
 * Everyone who has visited, newest activity first. Anonymous pageviews can't
 * appear here — with no identifier there is nothing to list, which is the
 * point of the consent design.
 */
export default async function VisitorsPage() {
  const [visitors, live] = await Promise.all([getRecentVisitors(50), getLiveVisitors()]);
  const liveIds = new Set(live.map((s) => s.session_id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Visitors</h1>
        <p className="mt-1 text-sm text-slate-500">
          The 50 most recent identified browsers, with the person attached once they&apos;ve
          been in touch. {liveIds.size > 0 ? `${liveIds.size} active right now.` : ""}
        </p>
      </div>

      {visitors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-ink">No visitors recorded yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Visitors appear here after they accept the cookie banner and load a page. If the
            numbers stay at zero, run <code className="rounded bg-slate-100 px-1">npm run db:migrate</code> and
            check that <code className="rounded bg-slate-100 px-1">DATABASE_URL</code> is set.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Visitor</th>
                  <th className="px-4 py-3 font-medium">Came from</th>
                  <th className="px-4 py-3 font-medium">Last page</th>
                  <th className="px-4 py-3 text-right font-medium">Pages</th>
                  <th className="px-4 py-3 text-right font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((visitor) => (
                  <tr key={visitor.visitor_id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      {visitor.contact_id ? (
                        <Link
                          href={`/admin/contacts/${visitor.contact_id}`}
                          className="font-medium text-brand-800 hover:underline"
                        >
                          {visitor.contact_name || visitor.contact_email}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Anonymous visitor</span>
                      )}
                      <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {visitor.visitor_id.slice(0, 12)}…
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-ink">
                        {visitor.utm_source ||
                          visitor.referrer_host ||
                          CHANNEL_LABELS[visitor.first_channel] ||
                          "Direct"}
                      </span>
                      {visitor.first_landing_path ? (
                        <div className="text-xs text-slate-400">
                          landed on {visitor.first_landing_path}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{visitor.last_path || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                      {visitor.pageviews}
                      <span className="ml-1 text-xs text-slate-400">
                        / {visitor.sessions} visit{visitor.sessions === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                      {formatDuration(visitor.seconds)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {visitor.device || "—"}
                      <div className="text-xs text-slate-400">
                        {[visitor.browser, visitor.os].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {timeAgo(visitor.last_seen_at)}
                      {visitor.city || visitor.country ? (
                        <div className="text-xs text-slate-400">
                          {[visitor.city, visitor.country].filter(Boolean).join(", ")}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Visitor ids are random and first-party — they aren&apos;t derived from the IP address
        or the browser fingerprint. IP addresses themselves are never stored; only a salted
        hash, used to rate-limit the collector.
      </p>
    </div>
  );
}
