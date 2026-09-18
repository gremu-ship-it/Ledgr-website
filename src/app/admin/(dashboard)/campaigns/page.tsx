import Link from "next/link";
import { markSentAction, sendCampaignAction, sendTestAction } from "@/app/admin/actions";
import { timeAgo } from "@/lib/format";
import { providerStatus } from "@/lib/esp";
import {
  OUTREACH_RULES,
  SEGMENTS,
  TEMPLATES,
  canMessage,
  emailWithFooter,
  filterBySegment,
  getSegment,
  getTemplate,
  listAudience,
  renderContext,
  renderText,
  whatsappLink,
} from "@/lib/marketing";
import { getCampaignStats, getRecentMessages } from "@/lib/reporting";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{
    segment?: string;
    template?: string;
    sent?: string;
    failed?: string;
    error?: string;
    notice?: string;
  }>;
}) {
  const query = await searchParams;
  const audience = await listAudience();
  const counts = new Map<string, number>();
  for (const definition of SEGMENTS) {
    counts.set(definition.id, filterBySegment(audience, definition.id).length);
  }

  const segment = getSegment(query.segment);
  const templateForSegment = segment ? getTemplate(segment.template) : null;
  const template = getTemplate(query.template) ?? templateForSegment ?? TEMPLATES[0]!;
  const channel: "email" | "whatsapp" = segment?.channel ?? "email";

  const provider = providerStatus();
  const [stats, messages] = await Promise.all([getCampaignStats(30), getRecentMessages(20)]);

  // Recipients, with the reason anyone is excluded — the operator should be
  // able to see exactly who is *not* getting a message and why.
  const candidates = segment ? filterBySegment(audience, segment.id) : [];
  const recipients = candidates.map((contact) => ({
    contact,
    gate: canMessage(contact, channel),
  }));
  const sendable = recipients.filter((row) => row.gate.allowed);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Campaigns &amp; follow-ups</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pick a group, pick a message, send it from your own inbox or WhatsApp. Every send is
            logged against the person.
          </p>
        </div>
        <span
          className={`rounded-xl border px-3 py-1.5 text-sm font-medium ${
            provider.ready
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-ink-soft"
          }`}
        >
          {provider.label}
        </span>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error === "no-provider"
            ? "Bulk sending needs an email API key (RESEND_API_KEY or BREVO_API_KEY). You can still send one at a time below."
            : query.error === "confirm"
              ? "Tick the confirmation box before sending a campaign."
              : query.error === "test-address"
                ? "Set MARKETING_FROM_EMAIL, or type an address for the test."
                : query.error}
        </div>
      ) : null}

      {query.sent || query.failed ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-ink">
          Sent {query.sent ?? 0} message{(query.sent ?? "0") === "1" ? "" : "s"}
          {query.failed && query.failed !== "0" ? `, ${query.failed} failed (see the log below)` : ""}.
        </div>
      ) : null}

      {query.notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {query.notice}
        </div>
      ) : null}

      {/* ── 1. Who ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink">1. Who should hear from you?</h2>
        <p className="mt-1 text-xs text-slate-500">
          Segments come from real behaviour, and everyone who unsubscribed is excluded
          automatically.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SEGMENTS.map((definition) => {
            const count = counts.get(definition.id) ?? 0;
            const active = segment?.id === definition.id;
            return (
              <Link
                key={definition.id}
                href={`/admin/campaigns?segment=${definition.id}&template=${definition.template}`}
                className={`rounded-xl border p-3 transition ${
                  active
                    ? "border-brand-700 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{definition.label}</span>
                  <span className="shrink-0 text-sm tabular-nums text-slate-500">{count}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{definition.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  usually {definition.channel === "whatsapp" ? "WhatsApp" : "email"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {segment ? (
        <>
          {/* ── 2. What ─────────────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">2. What should it say?</h2>
              <div className="flex gap-1.5 text-xs">
                {(["email", "whatsapp"] as const).map((option) => (
                  <Link
                    key={option}
                    href={`/admin/campaigns?segment=${segment.id}&template=${
                      option === "whatsapp" ? "wa-quick-question" : templateForSegment?.key || "custom"
                    }`}
                    className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                      channel === option
                        ? "border-ink bg-ink text-white"
                        : "border-slate-200 text-ink-soft hover:bg-slate-50"
                    }`}
                  >
                    {option === "email" ? "Email" : "WhatsApp"}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {TEMPLATES.filter((item) => item.channel === channel).map((item) => (
                <Link
                  key={item.key}
                  href={`/admin/campaigns?segment=${segment.id}&template=${item.key}`}
                  className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
                    item.key === template.key
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-slate-200 text-ink-soft hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {channel === "whatsapp" ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                WhatsApp can only be sent one at a time, from your own phone — that&apos;s
                deliberate. Bulk WhatsApp messages get numbers blocked, and a person replying to
                a real conversation is the point.
              </p>
            ) : null}

            <p className="mt-3 text-sm text-slate-500">{template.when}</p>
          </section>

          {/* ── 3. Recipients ──────────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  3. Send it ({sendable.length} of {recipients.length} can be contacted)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {recipients.length - sendable.length > 0
                    ? `${recipients.length - sendable.length} excluded — the reason is on each row.`
                    : "Everyone in this group passes the checks."}
                </p>
              </div>
              {provider.ready && channel === "email" && sendable.length > 0 ? (
                <form action={sendCampaignAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="segment" value={segment.id} />
                  <input type="hidden" name="template" value={template.key} />
                  <input
                    name="campaign"
                    placeholder="Campaign name (optional)"
                    className="w-44 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                  <input
                    name="limit"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={Math.min(sendable.length, 25)}
                    className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    aria-label="How many to send"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" name="confirm" value="yes" required />
                    I&apos;ve read the message
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Send via {provider.label.split(" ")[0]}
                  </button>
                </form>
              ) : null}
            </div>

            {recipients.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Nobody is in this group right now. That&apos;s normal early on — the segments
                fill up as people visit.
              </p>
            ) : (
              <div className="space-y-2">
                {recipients.map(({ contact, gate }) => {
                  const ctx = renderContext(contact);
                  const renderedBody =
                    channel === "email"
                      ? emailWithFooter(renderText(template.body, ctx), ctx)
                      : renderText(template.body, ctx);
                  const subject = renderText(template.subject || "", ctx);

                  if (!gate.allowed) {
                    return (
                      <div
                        key={contact.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                      >
                        <span className="text-ink">
                          {contact.name || contact.email}{" "}
                          <span className="text-slate-400">· score {contact.score}</span>
                        </span>
                        <span className="text-xs text-slate-500">{gate.reason}</span>
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="text-xs font-medium text-brand-700 hover:underline"
                        >
                          Review
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={contact.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="text-sm font-medium text-brand-800 hover:underline"
                        >
                          {contact.name || contact.email}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {contact.businessName ? `${contact.businessName} · ` : ""}
                          score {contact.score}
                          {contact.scoreReasons.length
                            ? ` · ${contact.scoreReasons.slice(0, 2).join(", ")}`
                            : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={
                            channel === "email"
                              ? `mailto:${encodeURIComponent(contact.email)}?${new URLSearchParams(
                                  {
                                    subject,
                                    body: renderedBody,
                                  },
                                )
                                  .toString()
                                  .replace(/\+/g, "%20")}`
                              : whatsappLink(contact.phone, renderedBody)
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-800"
                        >
                          {channel === "email" ? "Open email" : "Open WhatsApp"} ↗
                        </a>
                        <Link
                          href={`/admin/contacts/${contact.id}?channel=${channel}&template=${template.key}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-slate-50"
                        >
                          Edit first
                        </Link>
                        <form action={markSentAction}>
                          <input type="hidden" name="contactId" value={contact.id} />
                          <input type="hidden" name="channel" value={channel} />
                          <input type="hidden" name="template" value={template.key} />
                          <input type="hidden" name="segment" value={segment.id} />
                          <input type="hidden" name="mode" value="sent" />
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Sent — log it
                          </button>
                        </form>
                        <form action={markSentAction}>
                          <input type="hidden" name="contactId" value={contact.id} />
                          <input type="hidden" name="channel" value={channel} />
                          <input type="hidden" name="template" value={template.key} />
                          <input type="hidden" name="segment" value={segment.id} />
                          <input type="hidden" name="mode" value="skipped" />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                          >
                            Skip
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Choose a group above to see who&apos;s in it and what to send.
        </p>
      )}

      {/* ── Rules + setup ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Who can be messaged</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            <li>• Unsubscribed people are never included, in any segment.</li>
            <li>
              • Marketing email needs a ticked opt-in box. Contacts you only owe a reply to are
              transactional.
            </li>
            <li>• One message per person every {OUTREACH_RULES.minDaysBetweenMessages} days.</li>
            <li>
              • After {OUTREACH_RULES.maxMessagesPerContact} messages a person is flagged for
              review rather than messaged again.
            </li>
            <li>• WhatsApp needs a phone number on file and is sent by hand, one at a time.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-ink">Bulk sending</h2>
          <p className="mt-2 text-sm text-slate-600">{provider.hint}</p>
          {provider.ready ? (
            <form action={sendTestAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input
                name="to"
                type="email"
                placeholder="you@ledgr.mw"
                className="w-56 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-slate-50"
              >
                Send a test to myself
              </button>
            </form>
          ) : null}
        </section>
      </div>

      {/* ── History ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Last 30 days</h2>
          <p className="text-xs text-slate-500">
            {stats.reduce((total, row) => total + Number(row.count), 0)} messages logged
          </p>
        </div>

        {stats.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {stats.map((row) => (
              <span
                key={`${row.segment}-${row.channel}-${row.status}`}
                className={`rounded-lg px-2 py-1 font-medium ${
                  row.status === "sent"
                    ? "bg-emerald-50 text-emerald-800"
                    : row.status === "failed"
                      ? "bg-red-50 text-red-700"
                      : row.status === "skipped"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-amber-50 text-amber-800"
                }`}
              >
                {row.status} · {row.channel} · {row.segment || "manual"}: {row.count}
              </span>
            ))}
          </div>
        ) : null}

        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing sent yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="py-2 font-medium">When</th>
                  <th className="py-2 font-medium">Who</th>
                  <th className="py-2 font-medium">Channel</th>
                  <th className="py-2 font-medium">Template</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td className="py-2 whitespace-nowrap text-slate-500">
                      {timeAgo(message.created_at)}
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/admin/contacts/${message.contact_id}`}
                        className="text-brand-800 hover:underline"
                      >
                        {message.name || message.email}
                      </Link>
                    </td>
                    <td className="py-2 text-ink-soft">{message.channel}</td>
                    <td className="py-2 text-slate-500">{message.template_key || "custom"}</td>
                    <td className="py-2">
                      <span
                        className={
                          message.status === "sent"
                            ? "text-emerald-700"
                            : message.status === "failed"
                              ? "text-red-600"
                              : "text-slate-500"
                        }
                      >
                        {message.status}
                      </span>
                      {message.provider ? (
                        <span className="ml-1 text-xs text-slate-400">via {message.provider}</span>
                      ) : null}
                      {message.error ? (
                        <span className="ml-1 text-xs text-red-500">{message.error}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
