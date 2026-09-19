import { getDb } from "@/db";
import { sql } from "drizzle-orm";
import { site, demo, whatsappUrl } from "@/lib/site";
import { CHANNEL_LABELS } from "@/lib/analytics";

/**
 * Segments, lead scoring and message templates — the "who do we talk to, and
 * about what" half of the analytics.
 *
 * The audience query is one pass over contacts joined to their visitors'
 * events, then scoring and segment rules run in plain TypeScript so the rules
 * are readable and tweakable without writing SQL. Fits comfortably in memory
 * for a marketing site; if the list ever outgrows it, the rules move into SQL
 * without changing the shapes below.
 */

export type AudienceContact = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  businessName: string | null;
  businessType: string | null;
  marketingOptIn: boolean;
  unsubscribedAt: Date | null;
  optInSource: string | null;
  status: string;
  tags: string[];
  notes: string | null;
  firstChannel: string | null;
  firstLandingPath: string | null;
  utmCampaign: string | null;
  createdAt: Date;
  lastActivityAt: Date;
  lastContactedAt: Date | null;
  outreachCount: number;
  unsubscribeToken: string;
  // behaviour
  pageviews: number;
  sessions: number;
  lastSeen: Date | null;
  lastPath: string | null;
  demoClicks: number;
  pricingViews: number;
  calculatorUses: number;
  formStarts: number;
  formSubmits: number;
  newsletterSignups: number;
  blogViews: number;
  signupClicks: number;
  outreachClicks: number;
  /** 0–100 intent score, computed in `scoreContact`. */
  score: number;
  /** Why the score is what it is, shown in the UI. */
  scoreReasons: string[];
  segments: string[];
};

type AudienceRow = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
  marketing_opt_in: boolean;
  unsubscribed_at: string | null;
  opt_in_source: string | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  first_channel: string | null;
  first_landing_path: string | null;
  utm_campaign: string | null;
  created_at: string;
  last_activity_at: string;
  last_contacted_at: string | null;
  outreach_count: number;
  unsubscribe_token: string;
  pageviews: number;
  sessions: number;
  last_seen: string | null;
  last_path: string | null;
  demo_clicks: number;
  pricing_views: number;
  calculator_uses: number;
  form_starts: number;
  form_submits: number;
  newsletter_signups: number;
  blog_views: number;
  signup_clicks: number;
  outreach_clicks: number;
};

const AUDIENCE_QUERY = sql`
  with behaviour as (
    select
      cv.contact_id,
      count(*) filter (where e.type = 'pageview')::int                                  as pageviews,
      count(distinct e.session_id) filter (where e.session_id is not null)::int          as sessions,
      max(e.created_at)                                                                  as last_seen,
      (array_agg(e.path order by e.created_at desc) filter (where e.path is not null))[1] as last_path,
      count(*) filter (where e.type = 'demo_click')::int                                 as demo_clicks,
      count(*) filter (where e.type = 'pageview' and e.path like '/pricing%')::int        as pricing_views,
      count(*) filter (where e.type = 'calculator_use')::int                             as calculator_uses,
      count(*) filter (where e.type = 'form_start')::int                                  as form_starts,
      count(*) filter (where e.type = 'form_submit')::int                                 as form_submits,
      count(*) filter (where e.type = 'newsletter_signup')::int                           as newsletter_signups,
      count(*) filter (where e.type = 'pageview' and e.path like '/blog%')::int           as blog_views,
      count(*) filter (where e.type = 'signup_click')::int                                as signup_clicks,
      count(*) filter (where e.type in ('whatsapp_click','email_click','cta_click'))::int as outreach_clicks
    from contact_visitors cv
    join analytics_events e on e.visitor_id = cv.visitor_id
    group by cv.contact_id
  )
  select
    c.id, c.email, c.name, c.phone, c.business_name, c.business_type,
    c.marketing_opt_in, c.unsubscribed_at, c.opt_in_source, c.status, c.tags, c.notes,
    c.first_channel, c.first_landing_path, c.utm_campaign,
    c.created_at, c.last_activity_at, c.last_contacted_at, c.outreach_count,
    c.unsubscribe_token,
    coalesce(b.pageviews, 0)        as pageviews,
    coalesce(b.sessions, 0)         as sessions,
    b.last_seen,
    b.last_path,
    coalesce(b.demo_clicks, 0)      as demo_clicks,
    coalesce(b.pricing_views, 0)    as pricing_views,
    coalesce(b.calculator_uses, 0)  as calculator_uses,
    coalesce(b.form_starts, 0)      as form_starts,
    coalesce(b.form_submits, 0)     as form_submits,
    coalesce(b.newsletter_signups, 0) as newsletter_signups,
    coalesce(b.blog_views, 0)       as blog_views,
    coalesce(b.signup_clicks, 0)    as signup_clicks,
    coalesce(b.outreach_clicks, 0)  as outreach_clicks
  from contacts c
  left join behaviour b on b.contact_id = c.id
  order by c.last_activity_at desc
  limit 2000
`;

/**
 * Loads every contact with their stitched behaviour, scored and segmented.
 * Cached for the duration of a request only — the dashboard is a live view.
 */
export async function listAudience(): Promise<AudienceContact[]> {
  const result = await getDb().execute<AudienceRow>(AUDIENCE_QUERY);
  const rows = (result as unknown as { rows: AudienceRow[] }).rows ?? [];
  return rows.map(toAudienceContact);
}

function toAudienceContact(row: AudienceRow): AudienceContact {
  const contact: AudienceContact = {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    businessName: row.business_name,
    businessType: row.business_type,
    marketingOptIn: Boolean(row.marketing_opt_in),
    unsubscribedAt: row.unsubscribed_at ? new Date(row.unsubscribed_at) : null,
    optInSource: row.opt_in_source,
    status: row.status,
    tags: Array.isArray(row.tags) ? row.tags : [],
    notes: row.notes,
    firstChannel: row.first_channel,
    firstLandingPath: row.first_landing_path,
    utmCampaign: row.utm_campaign,
    createdAt: new Date(row.created_at),
    lastActivityAt: new Date(row.last_activity_at),
    lastContactedAt: row.last_contacted_at ? new Date(row.last_contacted_at) : null,
    outreachCount: row.outreach_count ?? 0,
    unsubscribeToken: row.unsubscribe_token,
    pageviews: Number(row.pageviews) || 0,
    sessions: Number(row.sessions) || 0,
    lastSeen: row.last_seen ? new Date(row.last_seen) : null,
    lastPath: row.last_path,
    demoClicks: Number(row.demo_clicks) || 0,
    pricingViews: Number(row.pricing_views) || 0,
    calculatorUses: Number(row.calculator_uses) || 0,
    formStarts: Number(row.form_starts) || 0,
    formSubmits: Number(row.form_submits) || 0,
    newsletterSignups: Number(row.newsletter_signups) || 0,
    blogViews: Number(row.blog_views) || 0,
    signupClicks: Number(row.signup_clicks) || 0,
    outreachClicks: Number(row.outreach_clicks) || 0,
    score: 0,
    scoreReasons: [],
    segments: [],
  };
  const scored = scoreContact(contact);
  contact.score = scored.score;
  contact.scoreReasons = scored.reasons;
  contact.segments = segmentIds(contact);
  return contact;
}

/* ------------------------------- scoring --------------------------------- */

const hoursSince = (date: Date | null) =>
  date ? (Date.now() - date.getTime()) / 3_600_000 : Number.POSITIVE_INFINITY;

const daysSince = (date: Date | null) => hoursSince(date) / 24;

/**
 * A deliberately simple, explainable 0–100 intent score. Every point is
 * traceable to something the visitor actually did, and the reasons are shown
 * in the UI so nobody has to trust a black box.
 */
export function scoreContact(contact: AudienceContact): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`+${points} ${reason}`);
  };

  if (contact.pageviews) {
    add(Math.min(contact.pageviews, 8), `${contact.pageviews} page views`);
  }
  if (contact.sessions > 1) add(5, `${contact.sessions} separate visits`);
  if (contact.pricingViews) add(6, "read the pricing page");
  if (contact.calculatorUses) add(8, "used the tax calculator");
  if (contact.demoClicks) add(15, "opened the demo");
  if (contact.blogViews >= 2) add(4, `${contact.blogViews} guide pages read`);
  if (contact.formStarts && !contact.formSubmits) add(6, "started a form and stopped");
  if (contact.formSubmits || contact.newsletterSignups) add(25, "got in touch");
  if (contact.outreachClicks) add(6, `clicked contact/WhatsApp ${contact.outreachClicks}×`);
  if (contact.businessType) add(3, `shared their business type (${contact.businessType})`);

  const idleDays = daysSince(contact.lastSeen ?? contact.lastActivityAt);
  if (idleDays <= 1) add(10, "active in the last 24 hours");
  else if (idleDays <= 7) add(5, "active this week");

  if (contact.unsubscribedAt) score = 0;

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

/* ------------------------------ segments -------------------------------- */

export type Segment = {
  id: string;
  label: string;
  description: string;
  /** Shown in the composer as the recommended channel for this group. */
  channel: "email" | "whatsapp";
  /** A message template that usually fits this segment. */
  template: string;
  test: (contact: AudienceContact) => boolean;
};

/**
 * Segment rules. All of them exclude unsubscribed people — suppression is a
 * hard filter, not a segment the composer might forget.
 */
export const SEGMENTS: Segment[] = [
  {
    id: "hot",
    label: "Hot leads, not yet replied to",
    description:
      "Scored 30+ from real behaviour (demo, pricing, calculator) and never contacted in the last week.",
    channel: "whatsapp",
    template: "wa-demo-followup",
    test: (c) => c.score >= 30 && daysSince(c.lastContactedAt) > 7,
  },
  {
    id: "demo-no-signup",
    label: "Tried the demo, didn't sign up",
    description: "Opened the one-click demo but never clicked through to create an account.",
    channel: "email",
    template: "demo-followup",
    test: (c) => c.demoClicks > 0 && c.signupClicks === 0,
  },
  {
    id: "pricing-no-convert",
    label: "Read the pricing page, no signup",
    description: "Compared plans and left — usually a pricing objection, so send the comparison.",
    channel: "email",
    template: "pricing-help",
    test: (c) => c.pricingViews > 0 && c.formSubmits === 0 && c.signupClicks === 0,
  },
  {
    id: "form-abandoners",
    label: "Started a form and stopped",
    description: "Began filling in a form on the site but never submitted it.",
    channel: "email",
    template: "abandoned-form",
    test: (c) => c.formStarts > c.formSubmits,
  },
  {
    id: "blog-readers",
    label: "Read the tax & money guides",
    description: "Two or more blog guides read — nurture with the next guide, not a sales pitch.",
    channel: "email",
    template: "vat-guide",
    test: (c) => c.blogViews >= 2,
  },
  {
    id: "new-this-week",
    label: "New this week",
    description: "Joined the list in the last 7 days.",
    channel: "email",
    template: "welcome",
    test: (c) => daysSince(c.createdAt) <= 7,
  },
  {
    id: "idle-opted-in",
    label: "Went quiet (opted in)",
    description: "Opted in, then nothing for 14+ days. A gentle win-back.",
    channel: "email",
    template: "winback",
    test: (c) => c.marketingOptIn && daysSince(c.lastSeen ?? c.lastActivityAt) > 14,
  },
  {
    id: "opted-in",
    label: "Everyone opted in",
    description: "Everyone who ticked the marketing box, still subscribed.",
    channel: "email",
    template: "welcome",
    test: (c) => c.marketingOptIn,
  },
  {
    id: "all-contacts",
    label: "All contacts (not unsubscribed)",
    description: "Everyone who ever got in touch, regardless of opt-in. Transactional only.",
    channel: "email",
    template: "custom",
    test: () => true,
  },
];

export function segmentsFor(contact: AudienceContact): Segment[] {
  return SEGMENTS.filter((segment) => segment.test(contact));
}

function segmentIds(contact: AudienceContact): string[] {
  const ids = segmentsFor(contact).map((s) => s.id);
  return ids.length ? ids : ["unsubscribed"];
}

const SEGMENT_BY_ID = new Map(SEGMENTS.map((s) => [s.id, s]));

export function getSegment(id: string | null | undefined): Segment | null {
  if (!id) return null;
  return SEGMENT_BY_ID.get(id) ?? null;
}

export function filterBySegment(contacts: AudienceContact[], segmentId: string): AudienceContact[] {
  const segment = getSegment(segmentId);
  if (!segment) return [];
  return contacts.filter((c) => segment.test(c) && !c.unsubscribedAt);
}

/* --------------------------- compliance guards --------------------------- */

/** Sending limits. Deliberately conservative: reputation is easy to lose. */
export const OUTREACH_RULES = {
  /** Never more than one marketing message per contact in this window. */
  minDaysBetweenMessages: 3,
  /** And never more than this many in total, without a manual override. */
  maxMessagesPerContact: 6,
};

export type SendGate = { allowed: boolean; reason?: string };

/**
 * The last check before a message goes out. Every send — composer or API —
 * passes through here, so "we don't email people who opted out" is enforced in
 * one place rather than trusted to a UI.
 */
export function canMessage(contact: AudienceContact, channel: "email" | "whatsapp"): SendGate {
  if (contact.unsubscribedAt) {
    return { allowed: false, reason: "Unsubscribed — suppressed permanently" };
  }
  // WhatsApp is person-to-person: a phone number is essential, consent is not
  // collected by checkbox there, so it stays a manual, one-at-a-time action.
  if (channel === "whatsapp" && !contact.phone) {
    return { allowed: false, reason: "No phone number on file" };
  }
  if (channel === "email" && !contact.marketingOptIn) {
    return {
      allowed: false,
      reason: "No marketing opt-in — transactional replies only",
    };
  }
  const since = daysSince(contact.lastContactedAt);
  if (contact.lastContactedAt && since < OUTREACH_RULES.minDaysBetweenMessages) {
    return {
      allowed: false,
      reason: `Messaged ${Math.floor(since * 24)}h ago — cooling off for ${OUTREACH_RULES.minDaysBetweenMessages} days`,
    };
  }
  if (contact.outreachCount >= OUTREACH_RULES.maxMessagesPerContact) {
    return {
      allowed: false,
      reason: `Already messaged ${contact.outreachCount}× — review before sending more`,
    };
  }
  return { allowed: true };
}

/* ------------------------------ templates ------------------------------- */

export type Template = {
  key: string;
  channel: "email" | "whatsapp";
  label: string;
  /** When to reach for this one — shown as a hint in the composer. */
  when: string;
  subject?: string;
  body: string;
};

/**
 * Templates are plain text with {{placeholders}}. They live in code so they're
 * versioned and reviewable; the composer lets you edit the rendered text before
 * anything is sent, and a `custom` blank is always available.
 */
export const TEMPLATES: Template[] = [
  {
    key: "demo-followup",
    channel: "email",
    label: "Demo follow-up — you had a look",
    when: "They opened the demo but never created an account.",
    subject: "You had a look at Ledgr — anything I can clear up?",
    body: `Hi {{first_name}},

I noticed you took Ledgr for a spin. I hope {{business_or_your_business}} made sense — the demo runs on a sample Malawian shop, so the numbers aren't real but the VAT, PAYE and WHT flows are exactly what you'd get.

The usual sticking points, and how Ledgr handles them:
• "Will it cope with MRA filings?" — Ledgr tracks VAT, PAYE and WHT as you work and produces the figures you need at the end of the period.
• "We're on phones, not laptops." — It works on both, and keeps working when the network drops.
• "Is it in Kwacha?" — MWK-first, no dollar conversions to explain.

If it's easier, reply with what you sell and I'll tell you whether Ledgr fits — no pitch if it doesn't.

Khwima`,
  },
  {
    key: "pricing-help",
    channel: "email",
    label: "Pricing question — compared plans",
    when: "They read the pricing page but didn't sign up.",
    subject: "Which Ledgr plan actually fits {{business_or_your_business}}?",
    body: `Hi {{first_name}},

You spent a bit of time on our pricing page, so let me save you the arithmetic.

Most Malawian SMEs your size start on Starter (MWK 50,000/month) — it covers professional invoicing and up to 200 transactions with VAT included. If you're reconciling bank accounts or need full financial reports, Growth at MWK 100,000/month is the next step. Free is genuinely usable if you're under 50 transactions a month. Pro only pays for itself once you have staff on payroll or multiple people issuing invoices.

Pay yearly and you get two months free — about 17% off.

Two questions and I can tell you which one to pick: roughly how many sales and expenses do you record a month, and do you have employees on payroll?

Khwima`,
  },
  {
    key: "vat-guide",
    channel: "email",
    label: "Guide follow-up — read the tax guides",
    when: "They read two or more of the blog guides.",
    subject: "The VAT guide you read, plus the bit most people miss",
    body: `Hi {{first_name}},

Thanks for reading our guides — the fact that you're reading about {{last_read_topic}} usually means the paperwork is the painful part, not the accounting.

One thing that trips up a lot of Malawian businesses: VAT registration thresholds and the timing of your returns both depend on your turnover and the period you file for, and getting the date wrong is what attracts penalties — not the arithmetic.

If you tell me your registration status and filing period, I'll point you at the right checklist.

Khwima`,
  },
  {
    key: "abandoned-form",
    channel: "email",
    label: "Form abandoned — pick it back up",
    when: "They started a form on the site and didn't finish it.",
    subject: "You started to get in touch — want me to just call?",
    body: `Hi {{first_name}},

Looks like you started filling in a form on our site and got interrupted — completely understandable.

No need to retype anything. Just reply to this email with the best time and number for you, or message us on WhatsApp at {{whatsapp_number}}, and we'll take it from there.

Khwima`,
  },
  {
    key: "welcome",
    channel: "email",
    label: "Welcome — first useful tip",
    when: "A new signup on the list.",
    subject: "Welcome to Ledgr — here's your first tip",
    body: `Hi {{first_name}},

Welcome aboard. You'll get practical tax and bookkeeping notes for Malawian businesses — one email at a time, no filler.

First tip: record the expense the day it happens, not the day you file. Reconstructing a month from a bag of receipts is where most SMEs lose a weekend — and where VAT claims get lost too.

Anything specific you'd like covered first? Just reply.

Khwima`,
  },
  {
    key: "winback",
    channel: "email",
    label: "Win-back — went quiet",
    when: "Opted in but hasn't visited in a while.",
    subject: "Still deciding on Ledgr?",
    body: `Hi {{first_name}},

It's been a while since you last looked at Ledgr, so a quick, honest note.

If you're still doing your books in a notebook or spreadsheet, the free plan is enough to find out whether it's worth switching — no card, no phone call, and nothing to cancel if it isn't.

If you've already sorted it out elsewhere, reply "done" and I'll stop emailing you about it.

Khwima`,
  },
  {
    key: "custom",
    channel: "email",
    label: "Blank email",
    when: "Something else entirely.",
    subject: "",
    body: `Hi {{first_name}},

`,
  },
  {
    key: "wa-demo-followup",
    channel: "whatsapp",
    label: "WhatsApp — demo follow-up",
    when: "Hot lead who opened the demo; needs a phone number on file.",
    body: `Hi {{first_name}}, it's Khwima from Ledgr. Saw you tried the demo — any questions I can answer? We can also set your business up on a call if you'd prefer.`,
  },
  {
    key: "wa-quick-question",
    channel: "whatsapp",
    label: "WhatsApp — quick question",
    when: "High-intent visitor you want to start a conversation with.",
    body: `Hi {{first_name}}, Khwima from Ledgr here. You spent a bit of time on our site — mind if I ask what you use to keep your books at the moment? Happy to show you how Ledgr would handle it.`,
  },
  {
    key: "wa-welcome",
    channel: "whatsapp",
    label: "WhatsApp — welcome",
    when: "A new contact with a number on file.",
    body: `Hi {{first_name}}, thanks for getting in touch with Ledgr. This is our direct line — send us any question about VAT, invoices or getting started, and we'll answer during working hours.`,
  },
  {
    key: "wa-custom",
    channel: "whatsapp",
    label: "Blank WhatsApp message",
    when: "Something else entirely.",
    body: `Hi {{first_name}}, `,
  },
];

export function getTemplate(key: string | null | undefined): Template | null {
  if (!key) return null;
  return TEMPLATES.find((t) => t.key === key) ?? null;
}

/** A one-line "how they got here", useful in a follow-up. */
function sourceLine(contact: AudienceContact): string {
  const channel = contact.firstChannel
    ? CHANNEL_LABELS[contact.firstChannel] || contact.firstChannel
    : "Direct";
  const landing = contact.firstLandingPath;
  return landing ? `${channel} — landed on ${landing}` : channel;
}

export function unsubscribeUrl(contact: { unsubscribeToken: string }): string {
  return `${site.siteUrl}/unsubscribe?token=${contact.unsubscribeToken}`;
}

export type RenderContext = {
  contact: AudienceContact;
  unsubscribeUrl: string;
  demoUrl: string;
  siteUrl: string;
  whatsappNumber: string;
  senderName: string;
};

export function renderContext(contact: AudienceContact): RenderContext {
  return {
    contact,
    unsubscribeUrl: unsubscribeUrl(contact),
    demoUrl: demo.available ? demo.link("email") : site.registerUrl,
    siteUrl: site.siteUrl,
    whatsappNumber: site.whatsappNumber,
    senderName: process.env.MARKETING_SENDER_NAME || "Khwima",
  };
}

const BUSINESS_FALLBACK = "your business";

/** Replaces {{placeholders}}; unknown ones are left visible, never blanked. */
export function renderText(template: string, ctx: RenderContext): string {
  const { contact } = ctx;
  const built: Record<string, string> = {
    first_name: firstNameOf(contact),
    full_name: contact.name || firstNameOf(contact),
    email: contact.email,
    business: contact.businessName || BUSINESS_FALLBACK,
    business_or_your_business: contact.businessName
      ? contact.businessName
      : BUSINESS_FALLBACK,
    business_type: contact.businessType || BUSINESS_FALLBACK,
    found_us_via: sourceLine(contact),
    last_page: contact.lastPath || "our site",
    last_read_topic: topicFromPath(contact.lastPath),
    whatsapp_number: ctx.whatsappNumber,
    demo_url: ctx.demoUrl,
    site_url: ctx.siteUrl,
    unsubscribe_url: ctx.unsubscribeUrl,
    sender_name: ctx.senderName,
  };

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in built ? String(built[key]) : match,
  );
}

function firstNameOf(contact: { name?: string | null; email: string }): string {
  const cleaned = (contact.name || "").trim();
  const raw = cleaned
    ? cleaned.split(/\s+/)[0]!
    : contact.email.split("@")[0]!.replace(/[._-]+/g, " ").split(" ")[0]!;
  if (!raw) return "there";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** "/blog/vat-registration-malawi" → "VAT registration in Malawi" */
function topicFromPath(path: string | null): string {
  if (!path) return "tax and bookkeeping";
  const slug = path.split("?")[0]!.split("/").filter(Boolean).pop() || "";
  const words = slug.replace(/-/g, " ").trim();
  return words || "tax and bookkeeping";
}

/**
 * The full email body as it will actually be sent: rendered template plus the
 * permission reminder every marketing email needs, and a working one-click
 * unsubscribe link.
 */
export function emailWithFooter(body: string, ctx: RenderContext): string {
  const { contact } = ctx;
  const reason = contact.marketingOptIn
    ? `You're getting this because you asked to hear from Ledgr${
        contact.optInSource ? ` (via our ${contact.optInSource} form)` : ""
      }.`
    : "You're getting this because you contacted Ledgr.";

  return `${body.trim()}

—
${reason} Unsubscribe in one click: ${ctx.unsubscribeUrl}
Ledgr · ${ctx.siteUrl} · WhatsApp ${ctx.whatsappNumber}
`;
}

/* ------------------------------ send links ------------------------------- */

/** mailto: with the body prefilled, so a "send" is one click in any client. */
export function mailtoLink(to: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, "%20")}`;
}

/** wa.me deep link with the message prefilled. */
export function whatsappLink(phone: string | null, message: string): string {
  if (!phone) return whatsappUrl;
  const digits = phone.replace(/\D/g, "");
  // Local Malawian numbers written 08… need the country code to be reachable.
  const international = digits.startsWith("265")
    ? digits
    : digits.startsWith("0")
      ? `265${digits.slice(1)}`
      : `265${digits}`;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}
