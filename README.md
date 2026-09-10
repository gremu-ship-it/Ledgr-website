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
| `/privacy`, `/terms` | Legal pages |

Plus: `sitemap.xml`, `robots.txt`, OG image, PWA manifest + service worker, Plausible analytics (env-gated).

## APIs (all real, Postgres-backed)

| Endpoint | Purpose | Table |
|---|---|---|
| `POST /api/leads` | Waitlist signups | `leads` |
| `POST /api/contact` | Contact form | `contact_messages` |
| `POST /api/newsletter` | Newsletter signups (deduped) | `newsletter_subscribers` |
| `GET /api/health` | DB health check | — |

No `DATABASE_URL`? Pages still render fine — the DB layer initializes lazily, so only
form submissions are affected (they return a friendly error until a DB is connected).
See `DEPLOY.md` for the 5-minute production database setup.

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
├── app/                    # Pages + API routes (+ sitemap, robots, OG image)
│   ├── api/{leads,contact,newsletter,health}/
│   └── blog/[slug]/
├── components/             # Navbar, Footer, forms, calculator, PWA, UI kit
├── db/                     # Drizzle client + schema (3 tables)
├── lib/                    # site.ts (URLs/config), posts.ts (blog content)
drizzle/                    # SQL migrations (generated, committed)
public/                     # PWA manifest, service worker, SVG screens, icon
```

## Configuration

All site config lives in `src/lib/site.ts`. Public env vars (see `.env.example`):

- `NEXT_PUBLIC_SITE_URL` — canonical URL (sitemap/OG)
- `NEXT_PUBLIC_CONTACT_EMAIL` — shown on Contact page + footer
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — set to enable analytics
- `NEXT_PUBLIC_{X,LINKEDIN,FACEBOOK,WHATSAPP}_URL` — socials (footer shows only set ones)
