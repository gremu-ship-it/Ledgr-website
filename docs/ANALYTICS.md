# Website analytics

First-party analytics for the Ledgr marketing site: visitor journeys, campaign
attribution and conversion reporting, stored in the site's own Postgres. No
third-party tag, no data broker, no monthly bill.

Everything is visible at **`/admin`** — that is where the rest of this document
is describing.

---

## Turning it on

Three things, in order:

1. **Migration.** The tables ship in `drizzle/0001_*.sql`:

   ```bash
   npm run db:migrate
   ```

2. **A dashboard password.** Set `ADMIN_PASSWORD` (see `.env.example`) and
   redeploy. Until it is set, `/admin` renders setup instructions instead of
   data — the dashboard fails closed.

3. **Optional but recommended:**

   | Variable | Why |
   |---|---|
   | `ANALYTICS_SALT` | Salts the IP hashes. Without it a per-process random salt is used, which still never stores a raw IP. |
   | `ADMIN_SECRET` | Lets you rotate `ADMIN_PASSWORD` without invalidating sessions. |
   | `NEXT_PUBLIC_ANALYTICS_ENABLED=false` | Kill switch: removes the tracker from the site entirely. |

Traffic starts appearing immediately after a page loads. There is nothing to
register, no script to paste in, no domain to verify.

---

## What gets recorded

Three tables, layered:

| Table | One row per | Answers |
|---|---|---|
| `analytics_visitors` | browser (first-party cookie) | who came back, where they first arrived from |
| `analytics_sessions` | visit (30-minute idle window) | where a visit started, how long, did it convert |
| `analytics_events` | thing that happened | what they read and clicked, in order |

Events are an **allowlist** (`EVENT_TYPES` in `src/lib/analytics.ts`): pageviews,
pageleaves, CTA clicks, demo clicks, signup/signin clicks, WhatsApp/email clicks,
outbound links, plan picks, calculator use, form starts, form submits, newsletter
signups and scroll depth. An unknown event name is dropped rather than stored, so
the table can't fill up with junk.

Clicks are captured by **one delegated listener** and classified by destination,
so ordinary links need no instrumentation. Anything ambiguous takes a
`data-track` attribute, which is how the pricing plan buttons report
`plan_select`.

### Attribution

`channel` is derived once per visit from `utm_*` parameters and the referrer
host: `direct`, `search`, `paid`, `social`, `email`, `referral` or `internal`.
Explicit UTM tags always win over host sniffing. The visitor's **first**
touch is stored separately on `analytics_visitors` and never overwritten, so a
later Google search can't erase the Instagram post that actually found you.

`?ref=` on a link is treated as a light-weight `utm_source` — that's how the
demo links tag the surface that sent the visitor.

### Anonymous traffic

A visitor who declines — or hasn't answered — is still counted, as a pageview
with **no visitor id, no session and no cookie**. Totals stay honest; nobody is
identified. The dashboard shows this count separately.

To record nothing at all until someone accepts, set
`NEXT_PUBLIC_ANALYTICS_ANONYMOUS_BEFORE_CONSENT=false`.

---

## Privacy contract

These are enforced in the collector (`/api/analytics/collect`), not by
convention:

- **No cookie and no identifier before consent.** The visitor id is minted
  server-side only after `Accept`. The cookie is first-party, `SameSite=Lax`,
  `Secure` in production, and expires after 12 months.
- **Raw IPs are never stored.** Only a salted HMAC hash, used to rate-limit the
  collector (240 events/minute per source). The hash is not joinable to a person.
- **DNT and Global Privacy Control are honoured** — if the browser sends one,
  analytics is off without the visitor touching the banner.
- **Consent is logged** (`analytics_consent`: granted/denied, policy version,
  timestamp) so "did they agree, and to what" is answerable later.
- **Location is coarse** — city/country from the hosting edge headers, never
  coordinates.
- **Retention is bounded**: `/api/cron/retention` deletes events and sessions
  older than `ANALYTICS_RETENTION_DAYS` (180 by default), and visitor profiles
  after twice that. Contacts, notes and the outreach log are deliberately kept —
  they're a record of a relationship, not tracking.

The public promises live in `/privacy` (§1, §2, §5) and the footer links to
**Cookie settings**, which reopens the banner so a choice can be changed.

---

## The dashboard

| Page | What it's for |
|---|---|
| `/admin` | traffic, funnel, sources, devices, geography, live visitors, latest activity |
| `/admin/visitors` | the 50 most recent browsers, with the person attached once identified |
| `/admin/contacts` | every contact, scored, filterable by segment, searchable |
| `/admin/contacts/[id]` | one person: score and why, every page they read, every message sent |
| `/admin/campaigns` | segments → message → send; see [MARKETING.md](./MARKETING.md) |
| `/admin/contacts/export?segment=` | CSV download (admin-only) |

Day buckets are cut in **Malawi time** using a fixed UTC+2 offset rather than a
named timezone. Malawi has no daylight saving, and the fixed offset doesn't
depend on the server's tz database — slim Postgres images ship without one, and
the failure mode there is a 500 on the whole dashboard.

### Lead scoring

`scoreContact()` in `src/lib/marketing.ts` produces 0–100 from things people
actually did (demo 15, pricing 6, calculator 8, form submit 25, recency…), and
returns the reasons alongside the number. The dashboard shows the reasons, so
the score never has to be taken on faith. Unsubscribed contacts score 0.

Tune it by editing that one function — it's plain TypeScript, not SQL.

### Funnel

Visited → read something → showed intent (demo or pricing) → started a form →
got in touch. Steps are distinct identified visitors, with drop-off percentages.
Anyone who declined cookies is outside the funnel by definition.

---

## Operating notes

- **Self-hosted, so it's your problem too.** Analytics swallow all errors: a
  tracking failure never breaks a page, and the collector always answers `204`.
  Check `/api/health` for the database.
- **Admin pages aren't tracked** and are excluded from search engines
  (`robots: noindex`). The marketing navbar, footer and cookie banner are also
  absent there — the site chrome lives in the `(site)` route group, the dashboard
  in `admin/(dashboard)`.
- **One analytics endpoint.** `POST /api/analytics/collect` ingests batches;
  `PUT` records a banner choice. Nothing else accepts tracking data.
- **Rate limiting is in-memory**, per instance. Enough for abuse control; it is
  not billing-grade.
- **`/admin` has one shared password** (`ADMIN_USER` + `ADMIN_PASSWORD`) swapped
  for a signed, HttpOnly, 7-day session cookie. Right-sized for one or two
  operators; put real multi-user auth in front if that ever changes.
