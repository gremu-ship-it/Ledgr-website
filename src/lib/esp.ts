/**
 * Email delivery.
 *
 * Two modes, and the difference matters:
 *
 *  1. **Composer mode (default, no setup).** There is no API key, so a
 *     "send" is a `mailto:` link opened in the operator's own mail client,
 *     with the message already written. Every send is still logged here, so
 *     the timeline and the frequency cap work exactly the same.
 *
 *  2. **Provider mode (paste one key).** Set RESEND_API_KEY or BREVO_API_KEY
 *     and the same messages can be sent in bulk from the campaign screen.
 *
 * Nothing in the marketing UI works differently between the two — the provider
 * is an implementation detail behind `sendEmail()`.
 */

export type EmailProvider = "resend" | "brevo" | null;

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  /**
   * Extra headers, used for `List-Unsubscribe` so Gmail/Outlook show their own
   * unsubscribe button and one-click POSTs straight to our API.
   */
  headers?: Record<string, string>;
  /**
   * The visible unsubscribe link, which the provider is asked to treat as the
   * unsubscribe URL. Providers that don't support it just ignore the field.
   */
  unsubscribeUrl?: string;
};

export type SendEmailResult =
  | { ok: true; provider: EmailProvider; id?: string; dryRun?: boolean }
  | { ok: false; provider: EmailProvider; error: string };

const FROM_EMAIL = process.env.MARKETING_FROM_EMAIL?.trim() || "";
const FROM_NAME = process.env.MARKETING_FROM_NAME?.trim() || "Ledgr";
const REPLY_TO = process.env.MARKETING_REPLY_TO?.trim() || "";
const TIMEOUT_MS = 10_000;

/** `MARKETING_DRY_RUN=true` exercises everything except the network call. */
export const DRY_RUN =
  (process.env.MARKETING_DRY_RUN ?? "").trim().toLowerCase() === "true";

export function provider(): EmailProvider {
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  if (process.env.BREVO_API_KEY?.trim()) return "brevo";
  return null;
}

export function senderAddress(): string {
  return FROM_EMAIL;
}

/** True when bulk API sending is possible (a key, and a verified sender). */
export function canSendViaApi(): boolean {
  return Boolean(provider() && FROM_EMAIL.includes("@"));
}

/**
 * Why bulk sending is unavailable, phrased for whoever is looking at the
 * admin screen rather than for a log file.
 */
export function providerStatus(): { ready: boolean; label: string; hint: string } {
  const active = provider();
  if (!active) {
    return {
      ready: false,
      label: "Composer only",
      hint: "No email API key set. Follow-ups open in your own mail client with the message written — everything is still logged. Add RESEND_API_KEY or BREVO_API_KEY to send in bulk.",
    };
  }
  if (!FROM_EMAIL.includes("@")) {
    return {
      ready: false,
      label: `${active} (sender missing)`,
      hint: `Set MARKETING_FROM_EMAIL to a verified sender address on ${active} — e.g. hello@ledgr.mw — and redeploy.`,
    };
  }
  return {
    ready: true,
    label: DRY_RUN ? `${active} (dry run)` : active,
    hint: DRY_RUN
      ? "MARKETING_DRY_RUN=true: sends are validated and logged but never delivered. Set it to false to go live."
      : `Bulk sending via ${active} as ${FROM_NAME} <${FROM_EMAIL}>.`,
  };
}

function formatFrom(): string {
  return FROM_NAME ? `${FROM_NAME} <${FROM_EMAIL}>` : FROM_EMAIL;
}

/**
 * Sends one email. Never throws — a failed send is a value, because the
 * caller needs to show the operator what happened and keep the queue moving.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const active = provider();

  if (!active) {
    return { ok: false, provider: null, error: "No email provider configured." };
  }
  if (!FROM_EMAIL.includes("@")) {
    return {
      ok: false,
      provider: active,
      error: "MARKETING_FROM_EMAIL is not set to a real address.",
    };
  }
  if (DRY_RUN) {
    return { ok: true, provider: active, dryRun: true, id: "dry-run" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response =
      active === "resend"
        ? await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: formatFrom(),
              to: [input.to],
              subject: input.subject,
              text: input.text,
              reply_to: input.replyTo || REPLY_TO || undefined,
              headers: input.headers,
            }),
            signal: controller.signal,
          })
        : await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": process.env.BREVO_API_KEY!.trim(),
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              sender: { name: FROM_NAME || "Ledgr", email: FROM_EMAIL },
              to: [{ email: input.to }],
              subject: input.subject,
              textContent: input.text,
              headers: input.headers,
              replyTo: input.replyTo || REPLY_TO
                ? { email: input.replyTo || REPLY_TO }
                : undefined,
            }),
            signal: controller.signal,
          });

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      messageId?: string;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      const detail =
        payload.message || payload.error || `HTTP ${response.status}`;
      return { ok: false, provider: active, error: String(detail).slice(0, 300) };
    }

    return {
      ok: true,
      provider: active,
      id: payload.id || payload.messageId || undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Timed out after 10s"
        : error instanceof Error
          ? error.message
          : "Unknown error";
    return { ok: false, provider: active, error: message.slice(0, 300) };
  } finally {
    clearTimeout(timer);
  }
}

/** A quick "is this set up right?" email, sent to the operator. */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Ledgr marketing: test message",
    text: `This is a test from the Ledgr admin dashboard.

If you're reading it, marketing follow-ups can be sent in bulk through ${provider()}.

Nothing else was sent, and no contacts were affected.`,
  });
}
