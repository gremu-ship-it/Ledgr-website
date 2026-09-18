import { getDb } from "@/db";
import {
  analyticsEvents,
  analyticsSessions,
  analyticsVisitors,
  contactVisitors,
  contacts,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { consentState, newUnsubscribeToken, readCookie, COOKIE_SESSION, COOKIE_VISITOR } from "@/lib/analytics";

/**
 * Turns "someone filled in a form" into "here is a person, here is how they
 * found us, and here is everything they read before they got in touch".
 *
 * Called from every form route *after* the submission itself is safely stored.
 * The entire function is best-effort: marketing intelligence must never be the
 * reason a contact form fails, so callers ignore failures and this never throws.
 *
 * Consent boundary: linking a person to their browsing history requires the
 * visitor id, which only exists after they accept the cookie banner, and only
 * then do we write conversion events or attach a session. Without consent the
 * contact is still created — they asked us to contact them — just with no
 * behavioural history attached.
 */

export type IdentifyInput = {
  email: string;
  name?: string | null;
  phone?: string | null;
  businessName?: string | null;
  businessType?: string | null;
  /** Where the submission came from: "waitlist", "contact", "newsletter", … */
  source: string;
  /** True only when the visitor actively ticked a marketing box. */
  marketingOptIn: boolean;
  /** The event to log once identified (skipped without consent). */
  event: "form_submit" | "newsletter_signup";
  eventName?: string;
  request: Request;
};

export type IdentifyResult = {
  id: number;
  email: string;
  marketingOptIn: boolean;
  unsubscribedAt: Date | null;
  linkedVisitor: boolean;
  created: boolean;
} | null;

function firstNameFrom(name: string | null | undefined, email: string): string {
  const cleaned = (name || "").trim();
  if (cleaned) return cleaned.split(/\s+/)[0]!.slice(0, 60);
  return email.split("@")[0]!.replace(/[._-]+/g, " ").split(" ")[0]!.slice(0, 60);
}

/** First name for personalising a message; falls back to something friendly. */
export function firstName(contact: { name?: string | null; email: string }): string {
  const name = firstNameFrom(contact.name, contact.email);
  if (!name) return "there";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function identifyContact(input: IdentifyInput): Promise<IdentifyResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const db = getDb();

  // The visitor id cookie only exists after consent, but check the consent
  // state too: belt and braces, so a stale cookie can't leak history.
  const consented = consentState(input.request) === "granted";
  const visitorId = consented ? readCookie(input.request, COOKIE_VISITOR) : null;
  const sessionId = consented ? readCookie(input.request, COOKIE_SESSION) : null;

  try {
    // ---- first-touch attribution, straight off the visitor row ----
    let attribution:
      | {
          firstChannel: string | null;
          firstLandingPath: string | null;
          firstReferrer: string | null;
          utmSource: string | null;
          utmMedium: string | null;
          utmCampaign: string | null;
        }
      | undefined;

    if (visitorId) {
      const [visitor] = await db
        .select({
          firstChannel: analyticsVisitors.firstChannel,
          firstLandingPath: analyticsVisitors.firstLandingPath,
          firstReferrer: analyticsVisitors.firstReferrer,
          utmSource: analyticsVisitors.utmSource,
          utmMedium: analyticsVisitors.utmMedium,
          utmCampaign: analyticsVisitors.utmCampaign,
        })
        .from(analyticsVisitors)
        .where(eq(analyticsVisitors.visitorId, visitorId))
        .limit(1);
      attribution = visitor;
    }

    // ---- upsert the person ----
    // coalesce(excluded.*, existing) means a later, thinner form (say, just an
    // email in the newsletter box) never erases a name or phone we already had.
    const [contact] = await db
      .insert(contacts)
      .values({
        email,
        name: input.name?.trim() || null,
        phone: input.phone?.trim() || null,
        businessName: input.businessName?.trim() || null,
        businessType: input.businessType?.trim() || null,
        firstVisitorId: visitorId,
        firstChannel: attribution?.firstChannel ?? null,
        firstLandingPath: attribution?.firstLandingPath ?? null,
        firstReferrer: attribution?.firstReferrer ?? null,
        utmSource: attribution?.utmSource ?? null,
        utmMedium: attribution?.utmMedium ?? null,
        utmCampaign: attribution?.utmCampaign ?? null,
        marketingOptIn: input.marketingOptIn,
        optInSource: input.marketingOptIn ? input.source : null,
        optInAt: input.marketingOptIn ? new Date() : null,
        unsubscribeToken: newUnsubscribeToken(),
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          name: sql`coalesce(excluded.name, ${contacts.name})`,
          phone: sql`coalesce(excluded.phone, ${contacts.phone})`,
          businessName: sql`coalesce(excluded.business_name, ${contacts.businessName})`,
          businessType: sql`coalesce(excluded.business_type, ${contacts.businessType})`,
          firstVisitorId: sql`coalesce(${contacts.firstVisitorId}, excluded.first_visitor_id)`,
          firstChannel: sql`coalesce(${contacts.firstChannel}, excluded.first_channel)`,
          firstLandingPath: sql`coalesce(${contacts.firstLandingPath}, excluded.first_landing_path)`,
          firstReferrer: sql`coalesce(${contacts.firstReferrer}, excluded.first_referrer)`,
          utmSource: sql`coalesce(${contacts.utmSource}, excluded.utm_source)`,
          utmMedium: sql`coalesce(${contacts.utmMedium}, excluded.utm_medium)`,
          utmCampaign: sql`coalesce(${contacts.utmCampaign}, excluded.utm_campaign)`,
          // Opt-in only ever moves up, and the original opt-in date is kept.
          marketingOptIn: input.marketingOptIn
            ? sql`true`
            : sql`${contacts.marketingOptIn}`,
          optInSource: input.marketingOptIn
            ? sql`coalesce(${contacts.optInSource}, excluded.opt_in_source)`
            : sql`${contacts.optInSource}`,
          optInAt: input.marketingOptIn
            ? sql`coalesce(${contacts.optInAt}, now())`
            : sql`${contacts.optInAt}`,
          // A fresh, explicit opt-in lifts an earlier suppression. This is the
          // only path that does — nothing in the dashboard silently
          // re-subscribes anybody. See docs/MARKETING.md.
          unsubscribedAt: input.marketingOptIn
            ? sql`null`
            : sql`${contacts.unsubscribedAt}`,
          lastActivityAt: new Date(),
        },
      })
      .returning({
        id: contacts.id,
        email: contacts.email,
        marketingOptIn: contacts.marketingOptIn,
        unsubscribedAt: contacts.unsubscribedAt,
        createdAt: contacts.createdAt,
      });

    if (!contact) return null;

    // ---- stitch this browser to that person, and log the conversion ----
    if (visitorId) {
      await db
        .insert(contactVisitors)
        .values({ contactId: contact.id, visitorId })
        .onConflictDoUpdate({
          target: [contactVisitors.contactId, contactVisitors.visitorId],
          set: { lastSeenAt: new Date() },
        });

      await db.insert(analyticsEvents).values({
        visitorId,
        sessionId,
        type: input.event,
        name: input.eventName ?? input.source,
        path: null,
        channel: attribution?.firstChannel ?? null,
        contactId: contact.id,
        createdAt: new Date(),
      });

      if (sessionId) {
        await db
          .update(analyticsSessions)
          .set({ converted: true, contactId: contact.id })
          .where(and(eq(analyticsSessions.sessionId, sessionId)));
      }
    }

    return {
      id: contact.id,
      email: contact.email,
      marketingOptIn: contact.marketingOptIn,
      unsubscribedAt: contact.unsubscribedAt,
      linkedVisitor: Boolean(visitorId),
      // createdAt only survives the insert path; treat "just now" as new.
      created: Date.now() - new Date(contact.createdAt).getTime() < 5000,
    };
  } catch {
    // Never let marketing plumbing break a form submission.
    return null;
  }
}

/** Marks a contact as emailed/WhatsApped, for the frequency cap + timeline. */
export async function markContacted(contactId: number): Promise<void> {
  try {
    await getDb()
      .update(contacts)
      .set({
        lastContactedAt: new Date(),
        outreachCount: sql`${contacts.outreachCount} + 1`,
      })
      .where(eq(contacts.id, contactId));
  } catch {
    /* best effort: a failed counter must not fail a send */
  }
}
