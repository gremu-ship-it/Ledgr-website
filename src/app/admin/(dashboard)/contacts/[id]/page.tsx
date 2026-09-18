import Link from "next/link";
import { notFound } from "next/navigation";
import ComposeBox from "@/components/admin/ComposeBox";
import { CHANNEL_LABELS } from "@/lib/analytics";
import { formatDateTime, timeAgo } from "@/lib/format";
import {
  SEGMENTS,
  TEMPLATES,
  canMessage,
  emailWithFooter,
  getTemplate,
  listAudience,
  renderContext,
  renderText,
} from "@/lib/marketing";
import { getContactTimeline, getContactTrend, getContactVisitors } from "@/lib/reporting";
import { addNoteAction, setSubscriptionAction, updateContactAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  pageview: "Viewed a page",
  pageleave: "Left a page",
  cta_click: "Clicked a call to action",
  demo_click: "Opened the demo",
  signup_click: "Clicked to register",
  signin_click: "Clicked to sign in",
  whatsapp_click: "Clicked WhatsApp",
  email_click: "Clicked email",
  outbound_click: "Followed an external link",
  plan_select: "Picked a plan",
  calculator_use: "Used the tax calculator",
  form_start: "Started a form",
  form_submit: "Submitted a form",
  newsletter_signup: "Joined the newsletter",
  scroll_depth: "Read to the bottom",
};

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ template?: string; channel?: string }>;
}) {
  const { id } = await params;
  const { template: templateParam, channel: channelParam } = await searchParams;
  const contactId = Number(id);
  if (!Number.isFinite(contactId)) notFound();

  const audience = await listAudience();
  const contact = audience.find((c) => c.id === contactId);
  if (!contact) notFound();

  const [timeline, visitors, trend] = await Promise.all([
    getContactTimeline(contactId),
    getContactVisitors(contactId),
    getContactTrend(contactId, 30),
  ]);

  const channel: "email" | "whatsapp" = channelParam === "whatsapp" ? "whatsapp" : "email";
  const template =
    getTemplate(templateParam) ??
    getTemplate(channel === "whatsapp" ? "wa-quick-question" : "custom") ??
    TEMPLATES[0]!;

  const ctx = renderContext(contact);
  const rendered = renderText(template.body, ctx);
  const renderedSubject = renderText(template.subject || "", ctx);
  const emailBody = emailWithFooter(rendered, ctx);

  const gate = canMessage(contact, channel === "whatsapp" ? "whatsapp" : "email");
  const maxTrend = Math.max(1, ...trend.map((point) => point.views));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/contacts" className="text-sm text-slate-500 hover:text-ink">
          ← All contacts
        </Link>
      </div>

      {/* ── Who ─────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">
              {contact.name || contact.email}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {contact.email}
              {contact.phone ? ` · ${contact.phone}` : ""}
              {contact.businessName ? ` · ${contact.businessName}` : ""}
              {contact.businessType ? ` (${contact.businessType})` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-ink-soft">
                Score {contact.score}
              </span>
              {contact.unsubscribedAt ? (
                <span className="rounded-lg bg-red-50 px-2 py-1 font-medium text-red-700">
                  Unsubscribed {formatDateTime(contact.unsubscribedAt)}
                </span>
              ) : contact.marketingOptIn ? (
                <span className="rounded-lg bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                  Marketing opt-in ({contact.optInSource || "form"})
                </span>
              ) : (
                <span className="rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-800">
                  Transactional replies only
                </span>
              )}
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-ink-soft">
                First seen {formatDateTime(contact.createdAt)}
              </span>
              {contact.utmCampaign ? (
                <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-ink-soft">
                  Campaign: {contact.utmCampaign}
                </span>
              ) : null}
              {visitors.length === 0 ? (
                <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-500">
                  No browsing history linked (cookies declined)
                </span>
              ) : null}
              {contact.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-brand-50 px-2 py-1 font-medium text-brand-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Page views</p>
              <p className="font-semibold tabular-nums text-ink">{contact.pageviews}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Visits</p>
              <p className="font-semibold tabular-nums text-ink">{contact.sessions}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Got in touch</p>
              <p className="font-semibold tabular-nums text-ink">
                {contact.formSubmits + contact.newsletterSignups}×
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Last seen</p>
              <p className="font-semibold text-ink">{timeAgo(contact.lastSeen || contact.lastActivityAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <p className="text-slate-600">
            <span className="font-medium text-ink">Why this score:</span>{" "}
            {contact.scoreReasons.length ? contact.scoreReasons.join(", ") : "no activity yet"}
          </p>
          <p className="text-slate-600">
            <span className="font-medium text-ink">Fits:</span>{" "}
            {contact.segments
              .map((sid) => SEGMENTS.find((s) => s.id === sid)?.label)
              .filter(Boolean)
              .join(", ") || "no segment"}
          </p>
        </div>

        {trend.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 uppercase">Page views, last 30 days</p>
            <div className="mt-2 flex h-10 items-end gap-0.5">
              {trend.map((point) => (
                <span
                  key={point.day}
                  title={`${point.day}: ${point.views}`}
                  className="flex-1 rounded-t bg-brand-400"
                  style={{ height: `${Math.max(8, (point.views / maxTrend) * 100)}%` }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Follow-up ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Write to them</h2>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {TEMPLATES.filter((t) => t.channel === channel).map((t) => (
              <Link
                key={t.key}
                href={`/admin/contacts/${contact.id}?channel=${channel}&template=${t.key}`}
                className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                  t.key === template.key
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-slate-200 bg-white text-ink-soft hover:bg-slate-50"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-1.5 text-xs">
            <Link
              href={`/admin/contacts/${contact.id}?channel=email&template=${template.key}`}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${channel === "email" ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink-soft"}`}
            >
              Email
            </Link>
            <Link
              href={`/admin/contacts/${contact.id}?channel=whatsapp&template=${template.key}`}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${channel === "whatsapp" ? "border-ink bg-ink text-white" : "border-slate-200 bg-white text-ink-soft"}`}
            >
              WhatsApp
            </Link>
          </div>
        </div>

        <p className="text-sm text-slate-500">{template.when}</p>

        <ComposeBox
          contactId={contact.id}
          channel={channel}
          template={template.key}
          segment={contact.segments[0] || null}
          to={contact.email}
          phone={contact.phone}
          subject={renderedSubject}
          body={channel === "email" ? emailBody : rendered}
          blockedReason={gate.allowed ? null : gate.reason}
          defaultSubject={template.label}
        />
      </section>

      {/* ── Browsers ────────────────────────────────────────────────── */}
      {visitors.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Browsers linked to this person</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {visitors.map((visitor) => (
              <li key={visitor.visitor_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="font-mono text-xs text-slate-500">
                  {visitor.visitor_id.slice(0, 14)}…
                </span>
                <span className="text-ink-soft">
                  {[visitor.device, visitor.os, visitor.city].filter(Boolean).join(" · ") || "unknown device"}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  first {formatDateTime(visitor.first_seen_at)} · last {timeAgo(visitor.last_seen_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Timeline ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink">Everything they did</h2>
        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No recorded activity — they may have declined cookies, or contacted you without
            accepting them.
          </p>
        ) : (
          <ol className="mt-3 space-y-2 text-sm">
            {timeline.map((entry, index) => (
              <li key={`${entry.created_at}-${index}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="w-28 shrink-0 text-xs text-slate-400">
                  {formatDateTime(entry.created_at)}
                </span>
                <span className="font-medium text-ink">
                  {entry.kind === "event"
                    ? EVENT_LABELS[entry.type] || entry.type
                    : entry.kind === "whatsapp"
                      ? "WhatsApp"
                      : "Email"}
                </span>
                {entry.name ? <span className="text-slate-500">{entry.name}</span> : null}
                {entry.path ? <span className="text-slate-400">{entry.path}</span> : null}
                {entry.kind !== "event" ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                    {entry.type}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── Admin ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Record</h2>
          <form action={updateContactAction} className="mt-3 space-y-2 text-sm">
            <input type="hidden" name="contactId" value={contact.id} />
            <label className="block">
              <span className="text-xs text-slate-500 uppercase">Status</span>
              <select
                name="status"
                defaultValue={contact.status}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              >
                {["new", "contacted", "qualified", "customer", "archived"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-500 uppercase">Phone</span>
              <input
                name="phone"
                defaultValue={contact.phone || ""}
                placeholder="+265 …"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500 uppercase">Tags (comma separated)</span>
              <input
                name="tags"
                defaultValue={contact.tags.join(", ")}
                placeholder="retailer, vat-registered"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500 uppercase">Notes</span>
              <textarea
                name="notes"
                rows={4}
                defaultValue={contact.notes || ""}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white transition hover:bg-brand-800"
            >
              Save
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Log a conversation</h2>
          <form action={addNoteAction} className="mt-3 space-y-2 text-sm">
            <input type="hidden" name="contactId" value={contact.id} />
            <textarea
              name="note"
              rows={4}
              required
              placeholder="Called at 14:20 — wants to see payroll before deciding. Following up Monday."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 font-semibold text-ink-soft transition hover:bg-slate-50"
            >
              Add to timeline
            </button>
          </form>

          {contact.notes ? (
            <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-xs whitespace-pre-wrap text-ink-soft">
              {contact.notes}
            </pre>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Permission</h2>
          <p className="mt-2 text-sm text-slate-600">
            {contact.unsubscribedAt
              ? "They asked not to be contacted. This overrides everything else — no segment, campaign or composer will include them."
              : contact.marketingOptIn
                ? "They ticked the marketing box on a form. Marketing email is allowed; every message still carries an unsubscribe link."
                : "They gave you their email to answer them. Only reply about their own enquiry unless they opt in."}
          </p>
          <form action={setSubscriptionAction} className="mt-3">
            <input type="hidden" name="contactId" value={contact.id} />
            {contact.unsubscribedAt ? (
              <>
                <input type="hidden" name="action" value="resubscribe" />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-slate-50"
                >
                  Record a fresh opt-in
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Only use this if they asked to hear from you again.
                </p>
              </>
            ) : (
              <>
                <input type="hidden" name="action" value="unsubscribe" />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Suppress (they asked me to stop)
                </button>
              </>
            )}
          </form>

          <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex justify-between gap-2">
              <dt>Messages logged</dt>
              <dd>{contact.outreachCount}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Last contacted</dt>
              <dd>{contact.lastContactedAt ? formatDateTime(contact.lastContactedAt) : "never"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Browsers linked</dt>
              <dd>{visitors.length}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Last activity</dt>
              <dd>{timeAgo(contact.lastActivityAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <p className="text-xs text-slate-400">
        First-touch channel:{" "}
        {CHANNEL_LABELS[contact.firstChannel || ""] || contact.firstChannel || "unknown"}
        {contact.firstLandingPath ? ` · landed on ${contact.firstLandingPath}` : ""}
      </p>
    </div>
  );
}
