"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { campaignMessages, contacts } from "@/db/schema";
import {
  checkCredentials,
  endSession,
  requireAdmin,
  startSession,
} from "@/lib/admin-auth";
import { markContacted } from "@/lib/contacts";
import { sendTestEmail, sendEmail, canSendViaApi } from "@/lib/esp";
import {
  canMessage,
  emailWithFooter,
  filterBySegment,
  getSegment,
  getTemplate,
  listAudience,
  renderContext,
  renderText,
  type AudienceContact,
} from "@/lib/marketing";
import { site } from "@/lib/site";

/**
 * Every mutation the admin dashboard performs.
 *
 * Two rules hold throughout:
 *  - Recipients are recomputed server-side from the segment and the send
 *    gates. The browser never gets to say *who* receives a message.
 *  - Nothing is sent to someone who has unsubscribed or lacks a marketing
 *    opt-in, no matter what the UI is showing.
 */

/* --------------------------------- auth ---------------------------------- */

export async function loginAction(formData: FormData) {
  const user = String(formData.get("user") || "");
  const password = String(formData.get("password") || "");

  if (!checkCredentials(user, password)) {
    redirect("/admin/login?error=1");
  }
  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

/* ------------------------------- composing -------------------------------- */

/**
 * Renders a message for one contact: the template with placeholders filled,
 * plus the permission reminder and unsubscribe link on email.
 */
function compose(
  contact: AudienceContact,
  templateKey: string,
  channel: "email" | "whatsapp",
  overrides?: { subject?: string; body?: string },
): { subject: string | null; body: string } {
  const template = getTemplate(templateKey);
  const ctx = renderContext(contact);
  const bodySource = overrides?.body ?? template?.body ?? "";
  const rendered = renderText(bodySource, ctx);

  if (channel === "whatsapp") {
    return { subject: null, body: rendered.trim() };
  }
  const subjectSource = overrides?.subject ?? template?.subject ?? "";
  return {
    subject: renderText(subjectSource, ctx).trim() || "A quick note from Ledgr",
    body: emailWithFooter(rendered, ctx),
  };
}

/** Logs an already-composed message and updates the frequency-cap counters. */
async function logMessage(input: {
  contactId: number;
  channel: string;
  campaign: string | null;
  segment: string | null;
  templateKey: string | null;
  subject: string | null;
  body: string;
  status: "queued" | "sent" | "failed" | "skipped";
  provider: string;
  error?: string | null;
}) {
  const db = getDb();
  await db.insert(campaignMessages).values({
    contactId: input.contactId,
    channel: input.channel,
    campaign: input.campaign,
    segment: input.segment,
    templateKey: input.templateKey,
    subject: input.subject,
    body: input.body,
    status: input.status,
    provider: input.provider,
    error: input.error ?? null,
    sentAt: input.status === "sent" ? new Date() : null,
  });

  // Only a real send counts against the frequency cap; a skipped message
  // shouldn't use up someone's allowance.
  if (input.status === "sent") {
    await markContacted(input.contactId);
  }
}

/**
 * Called when the operator has opened the mail client / WhatsApp and sent the
 * message. Re-renders from the template server-side so what gets logged is
 * genuinely what the segment/template produced.
 */
export async function markSentAction(formData: FormData) {
  await requireAdmin();

  const contactId = Number(formData.get("contactId"));
  const templateKey = String(formData.get("template") || "custom");
  const segment = String(formData.get("segment") || "") || null;
  const campaign = String(formData.get("campaign") || "") || null;
  const channel = formData.get("channel") === "whatsapp" ? "whatsapp" : "email";
  const mode = String(formData.get("mode") || "sent");

  const audience = await listAudience();
  const contact = audience.find((c) => c.id === contactId);
  if (!contact) return;

  const { subject, body } = compose(contact, templateKey, channel);

  await logMessage({
    contactId,
    channel,
    campaign,
    segment,
    templateKey,
    subject,
    body,
    status: mode === "skipped" ? "skipped" : "sent",
    provider: "composer",
  });

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/contacts/${contactId}`);
  revalidatePath("/admin");
}

/** Sends a campaign in bulk through the configured email API. */
export async function sendCampaignAction(formData: FormData) {
  await requireAdmin();

  const segmentId = String(formData.get("segment") || "");
  const templateKey = String(formData.get("template") || "custom");
  const campaign = String(formData.get("campaign") || "").slice(0, 80) || null;
  const confirm = String(formData.get("confirm") || "");
  const limit = Math.min(Number(formData.get("limit") || 25), 50);
  const subjectOverride = String(formData.get("subject") || "").trim() || undefined;
  const bodyOverride = String(formData.get("body") || "").trim() || undefined;

  const segment = getSegment(segmentId);
  if (!segment) redirect("/admin/campaigns?error=segment");

  // Email is the only channel that can be sent in bulk: WhatsApp stays a
  // deliberate one-at-a-time action from a human phone.
  if (segment.channel === "whatsapp" || !canSendViaApi()) {
    redirect(`/admin/campaigns?segment=${segmentId}&error=no-provider`);
  }
  if (confirm !== "yes") {
    redirect(`/admin/campaigns?segment=${segmentId}&error=confirm`);
  }

  const audience = await listAudience();
  const recipients = filterBySegment(audience, segmentId)
    .filter((contact) => canMessage(contact, "email").allowed)
    .slice(0, limit);

  let sent = 0;
  let failed = 0;

  for (const contact of recipients) {
    const composed = compose(contact, templateKey, "email", {
      subject: subjectOverride,
      body: bodyOverride,
    });
    const subject = composed.subject ?? "A quick note from Ledgr";
    const { body } = composed;

    // One-click unsubscribe, in the header mail clients understand as well as
    // in the footer of the message text.
    const unsubscribeUrl = `${site.siteUrl}/api/unsubscribe?token=${contact.unsubscribeToken}`;

    const result = await sendEmail({
      to: contact.email,
      subject,
      text: body,
      unsubscribeUrl,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.ok) {
      sent += 1;
      await logMessage({
        contactId: contact.id,
        channel: "email",
        campaign,
        segment: segmentId,
        templateKey,
        subject,
        body,
        status: "sent",
        provider: `${result.provider}${result.dryRun ? " (dry run)" : ""}`,
      });
    } else {
      failed += 1;
      await logMessage({
        contactId: contact.id,
        channel: "email",
        campaign,
        segment: segmentId,
        templateKey,
        subject,
        body,
        status: "failed",
        provider: result.provider ?? "none",
        error: result.error,
      });
    }
  }

  revalidatePath("/admin/campaigns");
  revalidatePath("/admin");
  redirect(`/admin/campaigns?segment=${segmentId}&sent=${sent}&failed=${failed}`);
}

/** "Send one test to myself" — the first thing to do after adding a key. */
export async function sendTestAction(formData: FormData) {
  await requireAdmin();
  const to =
    String(formData.get("to") || "").trim() ||
    process.env.MARKETING_FROM_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "";

  if (!to.includes("@")) redirect("/admin/campaigns?error=test-address");

  const result = await sendTestEmail(to);
  const params = result.ok
    ? `notice=${encodeURIComponent(`Test message sent to ${to}.`)}`
    : `error=${encodeURIComponent(result.error)}`;
  redirect(`/admin/campaigns?${params}`);
}

/* ------------------------------- contacts -------------------------------- */

/** Manual edits to a contact: status, note, tags, phone number. */
export async function updateContactAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("contactId"));
  if (!Number.isFinite(id)) return;

  const status = String(formData.get("status") || "new").slice(0, 24);
  const notes = String(formData.get("notes") || "").slice(0, 4000) || null;
  const phone = String(formData.get("phone") || "").trim().slice(0, 60) || null;
  const tagsRaw = String(formData.get("tags") || "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 12);

  await getDb()
    .update(contacts)
    .set({ status, notes, phone, tags, lastActivityAt: new Date() })
    .where(eq(contacts.id, id));

  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin/contacts");
}

/**
 * Suppression and re-subscription. Unsubscribing here is the same permanent
 * state the public /unsubscribe link sets — there is one suppression flag,
 * deliberately, so "we emailed someone who opted out" can't happen by
 * mistake.
 */
export async function setSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("contactId"));
  const action = String(formData.get("action") || "");
  if (!Number.isFinite(id)) return;

  if (action === "unsubscribe") {
    await getDb()
      .update(contacts)
      .set({ unsubscribedAt: new Date() })
      .where(eq(contacts.id, id));
  } else if (action === "resubscribe") {
    // Only ever on the back of a fresh, explicit opt-in (a new form tick or
    // a written request) — the button is the last step, not a shortcut.
    await getDb()
      .update(contacts)
      .set({
        unsubscribedAt: null,
        marketingOptIn: true,
        optInAt: sql`coalesce(${contacts.optInAt}, now())`,
        optInSource: sql`coalesce(${contacts.optInSource}, 'admin')`,
      })
      .where(eq(contacts.id, id));
  }

  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin/contacts");
}

/** Logs a manual note (a phone call, a WhatsApp reply) on the timeline. */
export async function addNoteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("contactId"));
  const note = String(formData.get("note") || "").trim();
  if (!Number.isFinite(id) || !note) return;

  await getDb()
    .update(contacts)
    .set({
      notes: sql`coalesce(${contacts.notes} || E'\n', '') || ${`[${new Date().toISOString().slice(0, 10)}] ${note}`}`,
      lastActivityAt: new Date(),
    })
    .where(eq(contacts.id, id));

  revalidatePath(`/admin/contacts/${id}`);
}
