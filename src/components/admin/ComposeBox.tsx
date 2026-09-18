"use client";

import { useMemo, useState } from "react";
import { markSentAction } from "@/app/admin/actions";

/**
 * Write one message to one person, then send it from your own mail client or
 * WhatsApp — with the text already in place.
 *
 * Why not just fire it from the server? Two reasons that matter in practice:
 *  - A first message from a real inbox (or a real WhatsApp number) gets read.
 *    Bulk mail from a fresh domain lands in spam.
 *  - Nothing leaves this page until a human presses send, so there is no way
 *    for a mis-typed template to reach the whole list.
 *
 * When an email API key is configured, the same message can be sent in bulk
 * from the campaign screen instead; this box stays for one-off conversations.
 */
export default function ComposeBox({
  contactId,
  channel,
  template,
  segment,
  campaign,
  to,
  phone,
  subject,
  body,
  blockedReason,
  defaultSubject,
}: {
  contactId: number;
  channel: "email" | "whatsapp";
  template: string;
  segment?: string | null;
  campaign?: string | null;
  to: string;
  phone: string | null;
  subject: string;
  body: string;
  blockedReason?: string | null;
  defaultSubject: string;
}) {
  const [message, setMessage] = useState(body);
  const [subjectText, setSubjectText] = useState(subject);
  const [copied, setCopied] = useState(false);

  /** Local, so the operator can tweak the wording before opening their client. */
  const href = useMemo(() => {
    if (channel === "whatsapp") {
      if (!phone) return "";
      const digits = phone.replace(/\D/g, "");
      const international = digits.startsWith("265")
        ? digits
        : digits.startsWith("0")
          ? `265${digits.slice(1)}`
          : `265${digits}`;
      return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
    }
    const params = new URLSearchParams();
    if (subjectText) params.set("subject", subjectText);
    if (message) params.set("body", message);
    return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
  }, [channel, phone, message, subjectText, to]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        channel === "email" ? `${subjectText}\n\n${message}` : message,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (blockedReason) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-ink">Can&apos;t message this person yet</p>
        <p className="mt-1 text-sm text-slate-600">{blockedReason}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {channel === "email" ? "Email" : "WhatsApp"} · {to}
        </p>
        <span className="text-xs text-slate-400">
          {message.length} characters{channel === "whatsapp" && message.length > 900 ? " · long for WhatsApp" : ""}
        </span>
      </div>

      {channel === "email" ? (
        <input
          value={subjectText}
          onChange={(event) => setSubjectText(event.target.value)}
          aria-label="Subject"
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      ) : null}

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={channel === "email" ? 14 : 6}
        aria-label="Message body"
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs leading-relaxed outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />

      <p className="mt-2 text-xs text-slate-500">
        WhatsApp and mailto both cap how much text they&apos;ll carry. Keep the message short
        enough to paste, or copy it and send the rest by hand.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          {channel === "email" ? "Open in mail client" : "Open WhatsApp"} ↗
        </a>

        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-slate-50"
        >
          {copied ? "Copied ✓" : "Copy text"}
        </button>

        <form action={markSentAction} className="ml-auto">
          <input type="hidden" name="contactId" value={contactId} />
          <input type="hidden" name="channel" value={channel} />
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="segment" value={segment || ""} />
          <input type="hidden" name="campaign" value={campaign || defaultSubject} />
          <input type="hidden" name="mode" value="sent" />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            I sent it — log it
          </button>
        </form>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Logging records the template version of this message (not your edits) so the timeline
        stays consistent, and starts the three-day cooling-off period for this person.
      </p>
    </div>
  );
}
