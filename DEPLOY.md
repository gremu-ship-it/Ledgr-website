# Deploying to Vercel

This is a standard Next.js 16 App Router project — Vercel auto-detects the framework and
needs **no `vercel.json`**. Build command is `next build`, output is handled automatically.

Verified locally with `next build` (Next.js 16.2.6 / Turbopack): 19 routes compile. 13
prerender as static content, `/blog/[slug]` SSGs its 4 posts, and `/` plus the 4 API
routes render on demand.

---

## 1. Import the repo

1. Go to **https://vercel.com/new** and import `gremu-ship-it/Ledgr-website`.
2. Framework preset: **Next.js** (auto-detected — leave Build/Output/Install defaults).
3. Node.js version: **22.x** (Next 16 requires Node >= 20.9; Vercel reads `engines.node`,
   which this repo leaves unpinned, so set it in *Project → Settings → General*).

Deploy now even without a database — every page renders. Only form submissions need
`DATABASE_URL` (they return a clean JSON error until it is set; see step 3).

## 2. Environment variables

*Project → Settings → Environment Variables* — add for **Production** (and Preview if you
want working forms there):

| Variable | Required | Example / notes |
|---|---|---|
| `DATABASE_URL` | for forms | `postgresql://USER:PASS@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require` |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://ledgr.mw` — canonical URL for sitemap + OG tags |
| `NEXT_PUBLIC_APP_URL` | recommended | the app's origin, e.g. `https://app.ledgr.com` — one variable drives the demo, register, login and dashboard links (defaults to the app's current domain) |
| `NEXT_PUBLIC_DEMO_ENABLED` | optional | `false` hides every demo call to action and falls back to free signup |
| `NEXT_PUBLIC_DEMO_URL` | optional | overrides the one-click demo URL (default `<app>/demo/enter`) |
| `NEXT_PUBLIC_DEMO_EMAIL` | optional | labels the demo identity in the copy (default `demo@ledgr.test`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional | defaults to `gremu.consultancy@gmail.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | direct-enquiries WhatsApp; defaults to `+265 881 444 487` |
| `NEXT_PUBLIC_WHATSAPP_URL` | optional | override the footer WhatsApp link entirely |
| `NEXT_PUBLIC_X_URL` | optional | footer shows only the socials you set |
| `NEXT_PUBLIC_LINKEDIN_URL` | optional | ↑ |
| `NEXT_PUBLIC_FACEBOOK_URL` | optional | ↑ |
| `ADMIN_PASSWORD` | for /admin | switches on the analytics dashboard. **With no password the dashboard stays locked** and shows setup instructions instead of data |
| `ADMIN_USER` | optional | defaults to `admin` |
| `ADMIN_SECRET` | optional | keeps sessions valid when you rotate `ADMIN_PASSWORD` |
| `ANALYTICS_SALT` | recommended | salts the IP hashes (raw IPs are never stored) |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | optional | `false` removes the tracker from the site entirely |
| `NEXT_PUBLIC_ANALYTICS_ANONYMOUS_BEFORE_CONSENT` | optional | defaults to `true`: count a cookieless pageview before the banner is answered. `false` records nothing until Accept |
| `ANALYTICS_RETENTION_DAYS` | optional | defaults to `180` — raw events older than this are pruned |
| `CRON_SECRET` | optional | enables `/api/cron/retention` (Vercel Cron sends it as a Bearer token) |
| `RESEND_API_KEY` / `BREVO_API_KEY` | optional | **one** of these switches bulk marketing email on; without a key the composer still works |
| `MARKETING_FROM_EMAIL` | with the above | a verified sender, e.g. `hello@ledgr.mw`. Bulk sending stays off until this is set |
| `MARKETING_FROM_NAME` | optional | defaults to `Ledgr` |
| `MARKETING_REPLY_TO` | optional | replies go here instead of the sender |
| `MARKETING_SENDER_NAME` | optional | signs the templates; defaults to `Khwima` |
| `MARKETING_DRY_RUN` | recommended once | `true` validates and logs sends without delivering — run one campaign this way first |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | e.g. `ledgr.mw` — adds Plausible *alongside* the built-in analytics |

`NEXT_PUBLIC_*` values are inlined at **build time** — redeploy after changing them.

## 3. Database (5 minutes)

1. Create a free Postgres project on **Neon** (or Supabase).
2. Copy the **pooled** connection string (Neon: the host ending in `-pooler`, with
   "Pooled connection" toggled on). Serverless functions open many short-lived
   connections, so always prefer the pooler over a direct connection — otherwise you will
   hit `too many connections for role ...` under load.
3. Create the tables. Two options:
   - **From your machine** (recommended):
     ```bash
     DATABASE_URL="postgresql://...neon.tech/ledgr?sslmode=require" npm run db:migrate
     ```
   - **From the Neon SQL editor**: paste the contents of
     [`drizzle/0000_small_magik.sql`](./drizzle/0000_small_magik.sql) and then
     [`drizzle/0001_dark_hemingway.sql`](./drizzle/0001_dark_hemingway.sql). Between them
     they create `leads`, `contact_messages`, `newsletter_subscribers` and the seven
     analytics/marketing tables.
4. Set `DATABASE_URL` in Vercel and redeploy.

> Migrations are **not** run by the build on purpose — `next build` stays read-only and
> never needs database credentials, so a bad `DATABASE_URL` cannot break a deploy.

### Verify

```bash
curl https://YOUR-PROJECT.vercel.app/api/health   # → {"ok":true}
```

`{"ok":false}` means `DATABASE_URL` is missing, wrong, or the DB rejects the connection
(usually a missing `sslmode=require` or a non-pooled host).

## 3b. Analytics and follow-ups

Nothing else is needed to record traffic: the tracker is part of the site, and the
tables arrive with the migration in step 3. Set `ADMIN_PASSWORD`, redeploy, and open
**`/admin`** — see [`docs/ANALYTICS.md`](./docs/ANALYTICS.md).

Two optional extras:

**Prune old raw events** (keeps the database small and the retention promise in the
privacy policy honest). Add a cron job in *Project → Settings → Cron Jobs*:

```
/api/cron/retention    Schedule: 0 3 * * *    (daily, 03:00 UTC)
```

Set `CRON_SECRET` when you add it — Vercel sends it automatically as
`Authorization: Bearer $CRON_SECRET`, and the endpoint refuses to run in production
without it.

**Send campaigns in bulk.** Add `RESEND_API_KEY` (or `BREVO_API_KEY`) and
`MARKETING_FROM_EMAIL`, verify the sending domain with the provider, then send yourself a
test from `/admin/campaigns`. Run one campaign with `MARKETING_DRY_RUN=true` first —
it logs everything and delivers nothing. See [`docs/MARKETING.md`](./docs/MARKETING.md).

## 4. Custom domain

Add `ledgr.mw` in *Project → Settings → Domains*, point DNS at Vercel, then set
`NEXT_PUBLIC_SITE_URL=https://ledgr.mw` and redeploy so sitemap/OG URLs are absolute.

## 5. Optional: CLI deploys

```bash
npm i -g vercel
vercel            # preview deploy from the current branch
vercel --prod     # production
```

The CLI needs `vercel login`; in CI set `VERCEL_TOKEN`. Git-push deploys (step 1) are the
simpler option — every push to `main` is production, every PR gets a preview URL.

---

## What runs where

| Route | Rendering | Notes |
|---|---|---|
| `/` | Server-rendered on demand | reads `select count(*) from leads` for the social-proof counter; falls back to `180+` if the DB is down |
| `/about`, `/pricing`, `/features`, `/faq`, `/customers`, `/contact`, `/privacy`, `/terms`, `/blog` | Static (prerendered) | served from Vercel's CDN |
| `/blog/[slug]` | SSG (4 posts via `generateStaticParams`) | new posts rebuild on deploy |
| `/opengraph-image` | Static | prerendered at build → a cached 85 KB PNG, no per-request function cost |
| `/api/{leads,contact,newsletter,health}` | Serverless (Node runtime) | `pg` needs Node, not Edge — leave `runtime` unset |
| `sitemap.xml`, `robots.txt` | Static | |

**Note on the service worker** (`public/sw.js`): it caches navigations network-first, so
redeploys are picked up on the next visit. Bump the `CACHE` name (`ledgr-site-v2`) when you
change precached assets to force clients to refresh.
