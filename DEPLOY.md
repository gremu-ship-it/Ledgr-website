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
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional | defaults to `hello@ledgr.mw` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | direct-enquiries WhatsApp; defaults to `+265 881 444 487` |
| `NEXT_PUBLIC_WHATSAPP_URL` | optional | override the footer WhatsApp link entirely |
| `NEXT_PUBLIC_X_URL` | optional | footer shows only the socials you set |
| `NEXT_PUBLIC_LINKEDIN_URL` | optional | ↑ |
| `NEXT_PUBLIC_FACEBOOK_URL` | optional | ↑ |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | e.g. `ledgr.mw` — set to switch analytics on |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | optional | defaults to `https://plausible.io/js/script.js` |

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
     [`drizzle/0000_small_magik.sql`](./drizzle/0000_small_magik.sql). It creates
     `leads`, `contact_messages` and `newsletter_subscribers`.
4. Set `DATABASE_URL` in Vercel and redeploy.

> Migrations are **not** run by the build on purpose — `next build` stays read-only and
> never needs database credentials, so a bad `DATABASE_URL` cannot break a deploy.

### Verify

```bash
curl https://YOUR-PROJECT.vercel.app/api/health   # → {"ok":true}
```

`{"ok":false}` means `DATABASE_URL` is missing, wrong, or the DB rejects the connection
(usually a missing `sslmode=require` or a non-pooled host).

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
