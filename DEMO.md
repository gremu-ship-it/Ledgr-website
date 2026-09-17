# Public demo account

The website has a "Try it yourself" path that can point at a **public demo account** —
a pre-seeded sample business visitors can open without registering.

**The demo account does not exist yet.** The app ([`Ledgr-react`](https://github.com/gremu-ship-it/Ledgr-react))
authenticates with Supabase (email + password, optional MFA) and has no demo mode, so
the account has to be created in Supabase once, then switched on here with env vars.

Until you do that, the website behaves correctly: `NEXT_PUBLIC_DEMO_URL` is empty, so
every "try" button falls back to **free registration** and no demo login details are
shown. Nothing on the site advertises a demo that would fail at the login screen.

---

## 1. Create the demo user

In the Supabase dashboard for the app project → **Authentication → Users → Add user**:

| Field | Value |
|---|---|
| Email | `demo@ledgr.mw` (or anything you control) |
| Password | something long and obviously public, e.g. `ledgr-demo-2026` |
| Auto-confirm | **on** — otherwise nobody can sign in |

Then sign in as that user once, create a business (e.g. *"Demo Trading Ltd"*), and add
sample data: a handful of invoices, expenses, a couple of customers and products, and
one employee so Payroll isn't empty.

Two rules for whatever data you seed:

- **Never use a real customer's books.** Make the figures obviously sample data.
- **Keep it read-only in spirit.** Anyone in the world will be able to log in. If the
  app supports roles, give the demo user a restricted role; otherwise say plainly on the
  site that people shouldn't enter real financial data (the site already does).

> If your Supabase project has RLS policies that restrict rows per user, the demo user
> only sees its own business — which is exactly what you want.

## 2. Point the website at it

Set these in **Vercel → Project → Settings → Environment Variables** (and in
`.env.local` for local testing), then redeploy:

```
NEXT_PUBLIC_DEMO_URL=https://ledgr-react.vercel.app/login
NEXT_PUBLIC_DEMO_EMAIL=demo@ledgr.mw
NEXT_PUBLIC_DEMO_PASSWORD=ledgr-demo-2026
```

- `NEXT_PUBLIC_DEMO_URL` — where the "Try the live demo" button goes. If the app later
  gains a one-click demo route (e.g. `/demo`), set it here and the button upgrades with
  no code change.
- `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` — optional. If both are set,
  the site shows the login details next to the button so people can type them in.

## What changes when it's switched on

| | Demo off (today) | Demo on |
|---|---|---|
| Hero secondary button | "See it in action" → scrolls to the product tour | "Try it yourself" → opens the demo in a new tab |
| Tour CTA | "Try it yourself free" → free registration | "Try the live demo" → opens the demo |
| Login details | not shown | shown under the tour CTA |

## Recommended: add a one-click demo route to the app

Typing credentials is friction, and it's the main reason demo accounts get ignored.
A small addition to `Ledgr-react` removes it entirely: a `/demo` route that signs in
with the demo credentials (read from env, not hardcoded) and redirects to the dashboard.
Then set `NEXT_PUBLIC_DEMO_URL=https://ledgr-react.vercel.app/demo` and visitors land
inside the product with one tap.
