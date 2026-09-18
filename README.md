# Ledgr Website

Marketing site + blog for **Ledgr** — MWK-first, MRA-compliant accounting for Malawian SMEs.

Built with Next.js 16, Tailwind CSS 4, Drizzle ORM + Postgres. The actual app lives at
https://ledgr-react.vercel.app — this repo is the public website that links to it.

## Pages

| Route | Description |
|---|---|
| `/` | Landing: hero, features, tax calculator, pricing, testimonials, FAQ, download CTA |
| `/features` | Full feature breakdown |
| `/pricing` | Plans in MWK + pricing FAQ |
| `/about` | Story, mission, values |
| `/contact` | Working contact form → Postgres |
| `/faq` | Frequently asked questions |
| `/customers` | Customer stories |
| `/blog` | Tax & money guides (SEO content) |
| `/blog/[slug]` | Individual guides (VAT, PAYE, WHT/TEVETA, invoicing) |
| `/privacy`, `/terms` | Legal pages (the privacy policy covers analytics + marketing) |
| `/unsubscribe` | One-click opt-out linked from every marketing email |
| `/admin` | **Private dashboard**: traffic, funnels, contacts, follow-up campaigns |

Plus: `sitemap.xml`, `robots.txt`, OG image, PWA manifest + service worker.

## Analytics & follow-ups (first-party)

Visitor journeys, campaign attribution and lead scoring are recorded in this site's own
Postgres and viewed at **`/admin`** — no third-party tag, no data broker, no monthly bill.
Plausible remains available as an optional extra (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`).

- **Consent-gated.** Nothing identifying is stored until the visitor presses Accept on the
  cookie banner. Decline and page views are still counted anonymously — no cookie, no id.
  DNT/GPC are honoured automatically, IPs are only ever stored as a salted hash, and raw
  events are pruned after 180 days.
- **Stitched to people.** The moment someone submits any form, their browsing is linked to
  their contact record (`contact_visitors`), so a follow-up can answer what they actually
  read rather than guessing.
- **Follow-ups with rules.** Segments from real behaviour (demo tried, pricing read,
  calculator used, form abandoned), an explainable 0–100 score, and hard gates: no
  marketing email without an opt-in, never someone who unsubscribed, one message per
  person every 3 days. Send from your own mail client/WhatsApp, or add a Resend/Brevo key
  to send in bulk.

Set `ADMIN_PASSWORD` and open `/admin`. Full detail in
[`docs/ANALYTICS.md`](./docs/ANALYTICS.md) and [`docs/MARKETING.md`](./docs/MARKETING.md).

## The live demo

Every "try it" call to action opens the app's **one-click demo** (`<app>/demo/enter`):
a sample Malawian business is seeded into the visitor's own browser, they are signed in
as the sample owner and land on the dashboard — no account, no password, nothing sent to
a server. `<app>/demo` is a static, read-only tour for visitors who would rather just
look, and both are offered side by side (hero, product tour, pricing, blog, every CTA
band, and the FAQ).

Both URLs derive from `NEXT_PUBLIC_APP_URL` in `src/lib/site.ts`, so moving the app to a
custom domain is one env var. See **[`DEMO.md`](./DEMO.md)** for the tagged-link map,
the kill switch (`NEXT_PUBLIC_DEMO_ENABLED=false`) and what to re-verify.

## APIs (all real, Postgres-backed)

| Endpoint | Purpose | Table |
|---|---|---|
| `POST /api/leads` | Waitlist signups | `leads` |
| `POST /api/contact` | Contact form | `contact_messages` |
| `POST /api/newsletter` | Newsletter signups (deduped) | `newsletter_subscribers` |
| `POST /api/analytics/collect` | First-party analytics batches (`PUT` records a banner choice) | `analytics_*` |
| `POST /api/unsubscribe` | One-click opt-out from an email (`GET` only redirects) | `contacts` |
| `GET /api/cron/retention` | Prunes raw events past the retention window | `analytics_*` |
| `GET /api/health` | DB health check | — |

Every form submission also runs `identifyContact()`, which upserts the person into
`contacts` and links their browsing — best-effort, so a lead is always saved.

No `DATABASE_URL`? Pages still render fine — the DB layer initializes lazily, so only
form submissions are affected (they return a friendly error until a DB is connected).

## Deployment

Deployed on **Vercel** — standard Next.js preset, no `vercel.json` needed. See
**[`DEPLOY.md`](./DEPLOY.md)** for the full walkthrough (env vars, the 5-minute Postgres
setup, migrations, custom domain, verification).

## Local development

```bash
npm install
cp .env.example .env.local   # then set DATABASE_URL (Neon/Supabase free tier)
npm run db:migrate           # create tables
npm run dev                  # http://localhost:3000
```

Other commands: `npm run build`, `npm run lint`, `npm run typecheck`,
`npm run db:generate` (new migration), `npm run db:push` (sync schema),
`npm run db:studio` (browse data).

## Project structure

```
src/
├── app/
│   ├── (site)/             # Public pages + the marketing chrome/tracker
│   ├── admin/              # Private dashboard (outside the (site) group)
│   │   ├── (dashboard)/    # Guarded: overview, visitors, contacts, campaigns
│   │   ├── login/          # The one unguarded admin route
│   │   └── actions.ts      # Server actions: login, sends, contact edits
│   ├── api/{leads,contact,newsletter,analytics,unsubscribe,health}/
│   ├── fonts/              # Self-hosted Inter variable font (woff2) + OFL license
│   └── unsubscribe/        # Public opt-out confirmation
├── components/             # Navbar, Footer, forms, calculator, tracker, consent
│   └── admin/              # Charts + composer used by the dashboard
├── db/                     # Drizzle client + schema (10 tables)
├── lib/                    # analytics, tracker, contacts, marketing, reporting, esp
drizzle/                    # SQL migrations (generated, committed)
docs/                       # ANALYTICS.md, MARKETING.md
public/                     # PWA manifest, service worker, SVG screens, icon
```

## Configuration

All site config lives in `src/lib/site.ts`. Public env vars (see `.env.example`):

- `NEXT_PUBLIC_SITE_URL` — canonical URL (sitemap/OG)
- `NEXT_PUBLIC_CONTACT_EMAIL` — shown on Contact page + footer
- `NEXT_PUBLIC_APP_URL` — the app's origin; drives the demo, sign-up, sign-in and
  dashboard links (defaults to the current app domain)
- `NEXT_PUBLIC_DEMO_ENABLED` — `false` removes every demo call to action, no code change
- `NEXT_PUBLIC_DEMO_URL`, `NEXT_PUBLIC_DEMO_EMAIL` — optional demo overrides
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optional extra analytics
- `ADMIN_PASSWORD` — opens the `/admin` dashboard (required for it to render at all)
- `ADMIN_USER`, `ADMIN_SECRET`, `ANALYTICS_SALT` — dashboard login + IP-hash salt
- `RESEND_API_KEY` / `BREVO_API_KEY`, `MARKETING_FROM_EMAIL` — bulk marketing email
  (optional; without them the composer opens your own mail client)
- `NEXT_PUBLIC_{X,LINKEDIN,FACEBOOK,WHATSAPP}_URL` — socials (footer shows only set ones)
