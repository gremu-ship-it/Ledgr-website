# Public demo account

The website offers a **"Try it yourself"** path that opens the live app with a public
demo login, so visitors can look around before registering.

The credentials are committed as defaults in `src/lib/site.ts`:

```
demo@ledgr.test / gremu@1989
```

They are **public by design** — they get rendered into the page HTML for anyone to read.
Both can be overridden with env vars (no code change needed):

```
NEXT_PUBLIC_DEMO_EMAIL=...
NEXT_PUBLIC_DEMO_PASSWORD=...
NEXT_PUBLIC_DEMO_URL=...   # optional: a one-click demo route, takes priority
```

### Turning it off (no code change)

```
NEXT_PUBLIC_DEMO_ENABLED=false
```

Redeploy and every demo call to action disappears — the hero falls back to "See it in
action", the tour to "Try it yourself free", and no credentials are shown anywhere. Use
this if the demo login ever breaks.

> Note: setting the email/password vars to *blank* is **not** enough, because the site
> falls back to the committed defaults when they are unset. Use the flag above.

---

## ✅ Two things to check before this goes live

The site is wired up, but the credentials themselves have not been verified from here —
the build sandbox can't reach `ledgr-react.vercel.app` or Supabase. Please confirm both:

### 1. Does the login actually work?

Click **"Try the live demo"** on the deployed site and sign in. Watch out for:

- **`demo@ledgr.test` can never receive email.** `.test` is a reserved, non-routable
  domain (RFC 2606). If the Supabase user isn't already confirmed, signing in fails with
  *"email not confirmed"* and no fix is possible by email — the user must be created with
  **Auto Confirm User** switched on, or given a real mailbox instead.
- **MFA must be off** for that user, otherwise the login stops at a TOTP prompt.
- Expect to type the credentials in manually: the app's login page doesn't read them from
  the URL, so we can't prefill them (see "one-click route" below).

If the login fails, tell me and I'll switch the site back to the free-registration
fallback in one edit.

### 2. Is the data safe to make public?

**Everyone on the internet will have these credentials**, including anyone who views the
page source or reads this public repo. Before enabling it, sign in as the demo user and
check the business it lands on:

- Contains **only sample data** — no real customer names, invoices, payroll or bank
  figures.
- Is **not** an account with elevated access (owner/admin of a real business, or anything
  that can see other businesses' data).
- Has **some** data seeded. An empty demo is worse than no demo — a visitor should land
  on a dashboard with invoices, expenses, customers and a payroll run already in it.

If the account turns out to hold anything real, create a fresh dedicated one instead.

### Password reuse — settled

`gremu@1989` is dedicated to the demo account and isn't used anywhere else (confirmed by
the owner), so being public is fine. If it ever changes, update it on the Supabase user
and set `NEXT_PUBLIC_DEMO_PASSWORD` in Vercel — no code change needed.

---

## Creating the demo user (if it doesn't exist yet)

In the Supabase dashboard for the app project → **Authentication → Users → Add user**:

| Field | Value |
|---|---|
| Email | `demo@ledgr.test` |
| Password | `gremu@1989` (or a rotated one) |
| Auto-confirm | **on** — required, see above |

Then sign in as that user once, create a business (e.g. *"Demo Trading Ltd"*) and add
sample data: a handful of invoices, expenses, a couple of customers and products, and one
employee so Payroll isn't empty.

If your Supabase project has RLS policies scoping rows per user, the demo user only sees
its own business — which is exactly what you want.

## Recommended: a one-click demo route in the app

Typing credentials is friction, and it's the main reason demo accounts get ignored. That
change is **already drafted** — see [`docs/README.md`](./docs/README.md) and
[`docs/demo-route.patch`](./docs/demo-route.patch).

It adds `/demo` to the app, which signs in with the env-held credentials and drops the
visitor on the dashboard, plus an in-app banner inviting them to create their own account.
Once applied, set `NEXT_PUBLIC_DEMO_URL=https://ledgr-react.vercel.app/demo` here and the
website picks it up automatically — no website code change.

The patch was verified against the app's own tooling (`tsc`, `eslint`, 384 tests, and a
production build), but the login itself still needs one manual check after applying,
because this sandbox can't reach Supabase.
