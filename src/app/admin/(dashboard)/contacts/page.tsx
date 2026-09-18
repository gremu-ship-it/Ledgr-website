import Link from "next/link";
import { CHANNEL_LABELS } from "@/lib/analytics";
import { timeAgo } from "@/lib/format";
import { SEGMENTS, canMessage, filterBySegment, listAudience } from "@/lib/marketing";

export const dynamic = "force-dynamic";

/** Score → colour, so the list is scannable at a glance. */
function scoreTone(score: number): string {
  if (score >= 50) return "bg-emerald-100 text-emerald-800";
  if (score >= 30) return "bg-amber-100 text-amber-800";
  if (score >= 10) return "bg-slate-100 text-slate-600";
  return "bg-slate-50 text-slate-400";
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; q?: string }>;
}) {
  const { segment: segmentId, q } = await searchParams;
  const audience = await listAudience();

  const segment = SEGMENTS.find((s) => s.id === segmentId) ?? null;
  const query = (q || "").trim().toLowerCase();

  let rows = segment ? filterBySegment(audience, segment.id) : audience.filter((c) => !c.unsubscribedAt);

  if (query) {
    rows = rows.filter((contact) =>
      [contact.name, contact.email, contact.businessName, contact.businessType, contact.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }

  rows = [...rows].sort((a, b) => b.score - a.score || b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

  const counts = new Map<string, number>();
  for (const definition of SEGMENTS) {
    counts.set(definition.id, filterBySegment(audience, definition.id).length);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {audience.length} people have been in touch.{" "}
            {audience.filter((c) => c.marketingOptIn && !c.unsubscribedAt).length} opted in to
            marketing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            {segment ? <input type="hidden" name="segment" value={segment.id} /> : null}
            <input
              name="q"
              defaultValue={q || ""}
              placeholder="Search name, email, business…"
              className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
            >
              Search
            </button>
          </form>
          <Link
            href="/admin/contacts/export"
            prefetch={false}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
          >
            CSV
          </Link>
        </div>
      </div>

      {/* Segment chips — the starting point for every follow-up. */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/contacts"
          className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
            segment ? "border-slate-200 bg-white text-ink-soft hover:bg-slate-50" : "border-brand-700 bg-brand-700 text-white"
          }`}
        >
          Everyone ({audience.filter((c) => !c.unsubscribedAt).length})
        </Link>
        {SEGMENTS.map((definition) => (
          <Link
            key={definition.id}
            href={`/admin/contacts?segment=${definition.id}`}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
              segment?.id === definition.id
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-slate-200 bg-white text-ink-soft hover:bg-slate-50"
            }`}
          >
            {definition.label} ({counts.get(definition.id) ?? 0})
          </Link>
        ))}
      </div>

      {segment ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-sm font-medium text-ink">{segment.label}</p>
          <p className="text-sm text-ink-soft">{segment.description}</p>
          <Link
            href={`/admin/campaigns?segment=${segment.id}`}
            className="mt-2 inline-flex rounded-xl bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Write a follow-up for this group
          </Link>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Person</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Why</th>
                <th className="px-4 py-3 font-medium">Found us via</th>
                <th className="px-4 py-3 font-medium">Permission</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Nobody matches this filter yet.
                  </td>
                </tr>
              ) : (
                rows.map((contact) => {
                  const emailGate = canMessage(contact, "email");
                  const whatsappGate = canMessage(contact, "whatsapp");
                  return (
                    <tr key={contact.id} className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="font-medium text-brand-800 hover:underline"
                        >
                          {contact.name || contact.email}
                        </Link>
                        <div className="text-xs text-slate-500">{contact.email}</div>
                        {contact.businessName ? (
                          <div className="text-xs text-slate-400">
                            {contact.businessName}
                            {contact.businessType ? ` · ${contact.businessType}` : ""}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold tabular-nums ${scoreTone(contact.score)}`}
                        >
                          {contact.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {contact.scoreReasons.length ? (
                          <ul className="space-y-0.5">
                            {contact.scoreReasons.slice(0, 3).map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {CHANNEL_LABELS[contact.firstChannel || ""] || contact.firstChannel || "—"}
                        {contact.firstLandingPath ? (
                          <div className="text-xs text-slate-400">{contact.firstLandingPath}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {contact.unsubscribedAt ? (
                          <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                            Unsubscribed
                          </span>
                        ) : contact.marketingOptIn ? (
                          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                            Opted in
                          </span>
                        ) : (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            Transactional only
                          </span>
                        )}
                        {!emailGate.allowed && !contact.unsubscribedAt ? (
                          <div className="mt-1 max-w-[16rem] text-[11px] text-slate-400">
                            {emailGate.reason}
                          </div>
                        ) : null}
                        {whatsappGate.allowed ? (
                          <div className="mt-1 text-[11px] text-emerald-700">
                            WhatsApp ready ({contact.phone})
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {timeAgo(contact.lastSeen || contact.lastActivityAt)}
                        <div className="text-xs text-slate-400">
                          {contact.pageviews} page views
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-slate-50"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        &ldquo;Transactional only&rdquo; means they gave you their email to answer them — not
        permission to market to them. The follow-up composer enforces this; see{" "}
        <code>docs/MARKETING.md</code>.
      </p>
    </div>
  );
}
