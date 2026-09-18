import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// Captured leads from the "Get Started / Join Waitlist" forms on the site.
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  businessName: varchar("business_name", { length: 200 }),
  businessType: varchar("business_type", { length: 80 }),
  message: text("message"),
  source: varchar("source", { length: 60 }).notNull().default("waitlist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// Messages submitted through the /contact page.
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  company: varchar("company", { length: 200 }),
  topic: varchar("topic", { length: 80 }).notNull().default("general"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

// Newsletter / updates signups (footer + blog). Email is unique so
// resubscribes are idempotent.
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  source: varchar("source", { length: 60 }).notNull().default("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/* ------------------------------------------------------------------ *
 * First-party web analytics + marketing contacts
 *
 * Everything below is owned by this site: it lives in your Postgres, not
 * in a vendor's. Three analytics tables (visitors → sessions → events)
 * record what happened; `contacts` + `contact_visitors` stitch an
 * identified person to that browsing history the moment they submit a
 * form, so follow-up marketing can be aimed at what they actually read.
 *
 * Privacy contract (see docs/ANALYTICS.md):
 *  - Nothing is written until the visitor accepts the cookie banner.
 *  - Visitors who decline are counted as anonymous, cookieless pageviews
 *    (events.visitorId is null) — totals stay honest, nobody is identified.
 *  - No raw IP addresses are stored, ever; only a salted hash so the
 *    collector can rate-limit abuse.
 * ------------------------------------------------------------------ */

// One row per browser (the `ledgr_vid` cookie). `visitorId` is a random
// opaque id — deliberately *not* derived from the IP or user agent.
export const analyticsVisitors = pgTable(
  "analytics_visitors",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull().unique(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    pageviewCount: integer("pageview_count").notNull().default(0),
    sessionCount: integer("session_count").notNull().default(0),
    // First-touch attribution. Never overwritten after the first visit, so a
    // later Google search can't erase the campaign that actually found us.
    firstLandingPath: varchar("first_landing_path", { length: 300 }),
    firstReferrer: text("first_referrer"),
    firstReferrerHost: varchar("first_referrer_host", { length: 160 }),
    firstChannel: varchar("first_channel", { length: 40 }).notNull().default("direct"),
    utmSource: varchar("utm_source", { length: 160 }),
    utmMedium: varchar("utm_medium", { length: 160 }),
    utmCampaign: varchar("utm_campaign", { length: 160 }),
    utmContent: varchar("utm_content", { length: 160 }),
    utmTerm: varchar("utm_term", { length: 160 }),
    // Coarse geo from the hosting edge (Vercel/Cloudflare headers). City-level
    // at most, never precise coordinates.
    country: varchar("country", { length: 8 }),
    region: varchar("region", { length: 80 }),
    city: varchar("city", { length: 120 }),
    device: varchar("device", { length: 16 }),
    os: varchar("os", { length: 40 }),
    browser: varchar("browser", { length: 40 }),
    language: varchar("language", { length: 16 }),
    ipHash: varchar("ip_hash", { length: 64 }),
    isBot: boolean("is_bot").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("analytics_visitors_last_seen_idx").on(t.lastSeenAt),
    index("analytics_visitors_channel_idx").on(t.firstChannel),
  ],
);

export type AnalyticsVisitor = typeof analyticsVisitors.$inferSelect;
export type NewAnalyticsVisitor = typeof analyticsVisitors.$inferInsert;

// One row per visit (30-minute idle window). Sessions survive a visitor
// leaving the tab and coming back to a landing page.
export const analyticsSessions = pgTable(
  "analytics_sessions",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    landingPath: varchar("landing_path", { length: 300 }),
    exitPath: varchar("exit_path", { length: 300 }),
    referrer: text("referrer"),
    referrerHost: varchar("referrer_host", { length: 160 }),
    channel: varchar("channel", { length: 40 }).notNull().default("direct"),
    utmSource: varchar("utm_source", { length: 160 }),
    utmMedium: varchar("utm_medium", { length: 160 }),
    utmCampaign: varchar("utm_campaign", { length: 160 }),
    utmContent: varchar("utm_content", { length: 160 }),
    utmTerm: varchar("utm_term", { length: 160 }),
    country: varchar("country", { length: 8 }),
    region: varchar("region", { length: 80 }),
    city: varchar("city", { length: 120 }),
    device: varchar("device", { length: 16 }),
    os: varchar("os", { length: 40 }),
    browser: varchar("browser", { length: 40 }),
    language: varchar("language", { length: 16 }),
    pageviewCount: integer("pageview_count").notNull().default(0),
    eventCount: integer("event_count").notNull().default(0),
    // Time on site, accumulated from page-exit pings (capped per page).
    engagedSeconds: integer("engaged_seconds").notNull().default(0),
    isBounce: boolean("is_bounce").notNull().default(true),
    converted: boolean("converted").notNull().default(false),
    // Set the moment a form submission identifies the person behind the
    // session — makes "what did the people who converted read?" one join.
    contactId: integer("contact_id"),
    ipHash: varchar("ip_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("analytics_sessions_started_idx").on(t.startedAt),
    index("analytics_sessions_visitor_idx").on(t.visitorId),
    index("analytics_sessions_channel_idx").on(t.channel),
    index("analytics_sessions_contact_idx").on(t.contactId),
  ],
);

export type AnalyticsSession = typeof analyticsSessions.$inferSelect;
export type NewAnalyticsSession = typeof analyticsSessions.$inferInsert;

// The raw event stream: pageviews, CTA clicks, demo clicks, form submits.
// `visitorId`/`sessionId` are nullable so a visitor who declined cookies is
// still counted, anonymously, as a pageview.
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }),
    sessionId: varchar("session_id", { length: 64 }),
    type: varchar("type", { length: 32 }).notNull(),
    name: varchar("name", { length: 160 }),
    path: varchar("path", { length: 300 }),
    title: varchar("title", { length: 200 }),
    referrer: text("referrer"),
    channel: varchar("channel", { length: 40 }),
    props: jsonb("props").$type<Record<string, unknown>>(),
    contactId: integer("contact_id"),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("analytics_events_created_idx").on(t.createdAt),
    index("analytics_events_visitor_idx").on(t.visitorId, t.createdAt),
    index("analytics_events_session_idx").on(t.sessionId),
    index("analytics_events_type_idx").on(t.type, t.createdAt),
    index("analytics_events_path_idx").on(t.path),
    index("analytics_events_contact_idx").on(t.contactId),
  ],
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Consent is recorded as it happens, so "did they agree, when and to what
// version of the policy" is answerable later. Append-only by design.
export const analyticsConsent = pgTable(
  "analytics_consent",
  {
    id: serial("id").primaryKey(),
    visitorId: varchar("visitor_id", { length: 64 }),
    action: varchar("action", { length: 16 }).notNull(),
    policyVersion: varchar("policy_version", { length: 20 }).notNull().default("1"),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("analytics_consent_visitor_idx").on(t.visitorId, t.createdAt)],
);

export type AnalyticsConsentRow = typeof analyticsConsent.$inferSelect;

// The unified people table for marketing. One row per email address, fed by
// every form on the site, carrying first-touch attribution so a follow-up
// message can say "you were reading our VAT guide" rather than "hi there".
export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    name: varchar("name", { length: 160 }),
    phone: varchar("phone", { length: 60 }),
    businessName: varchar("business_name", { length: 200 }),
    businessType: varchar("business_type", { length: 80 }),
    firstVisitorId: varchar("first_visitor_id", { length: 64 }),
    firstChannel: varchar("first_channel", { length: 40 }),
    firstLandingPath: varchar("first_landing_path", { length: 300 }),
    firstReferrer: text("first_referrer"),
    utmSource: varchar("utm_source", { length: 160 }),
    utmMedium: varchar("utm_medium", { length: 160 }),
    utmCampaign: varchar("utm_campaign", { length: 160 }),
    // Marketing permission, kept deliberately explicit and separate from
    // "they gave us their email". NULL/false means transactional replies
    // only. See docs/MARKETING.md.
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    optInSource: varchar("opt_in_source", { length: 60 }),
    optInAt: timestamp("opt_in_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).notNull().unique(),
    status: varchar("status", { length: 24 }).notNull().default("new"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    notes: text("notes"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    outreachCount: integer("outreach_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("contacts_last_activity_idx").on(t.lastActivityAt),
    index("contacts_opt_in_idx").on(t.marketingOptIn),
    index("contacts_status_idx").on(t.status),
  ],
);

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

// Many-to-many, because one person really does use two devices and one shop
// phone really is used by two people. Stitching here is what turns anonymous
// browsing into "this lead read the PAYE guide three times".
export const contactVisitors = pgTable(
  "contact_visitors",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").notNull(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    pageviewCount: integer("pageview_count").notNull().default(0),
  },
  (t) => [
    uniqueIndex("contact_visitors_unique_idx").on(t.contactId, t.visitorId),
    index("contact_visitors_visitor_idx").on(t.visitorId),
  ],
);

export type ContactVisitor = typeof contactVisitors.$inferSelect;

// The outreach log: every follow-up email/WhatsApp/SMS, whether it went out
// via the built-in composer (mailto:/wa.me) or an email API. Doubles as the
// history on a contact's timeline and as the frequency cap.
export const campaignMessages = pgTable(
  "campaign_messages",
  {
    id: serial("id").primaryKey(),
    contactId: integer("contact_id").notNull(),
    channel: varchar("channel", { length: 16 }).notNull(),
    campaign: varchar("campaign", { length: 80 }),
    segment: varchar("segment", { length: 60 }),
    templateKey: varchar("template_key", { length: 60 }),
    subject: varchar("subject", { length: 200 }),
    body: text("body").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("queued"),
    provider: varchar("provider", { length: 24 }).notNull().default("composer"),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("campaign_messages_contact_idx").on(t.contactId, t.createdAt),
    index("campaign_messages_status_idx").on(t.status),
  ],
);

export type CampaignMessage = typeof campaignMessages.$inferSelect;
export type NewCampaignMessage = typeof campaignMessages.$inferInsert;
