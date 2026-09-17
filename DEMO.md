# The live demo

The website's "try it" path opens the app's **one-click public demo**. A visitor taps
once and is inside a full set of books — no account, no password, no Supabase user, no
credentials to type or leak:

```
<app>/demo/enter   ← seeds a sample business, signs them in, lands on /dashboard
<app>/demo         ← static, read-only 1-minute tour (a lighter option)
```

Both are built from `site.appUrl` in [`src/lib/site.ts`](./src/lib/site.ts), which is
`NEXT_PUBLIC_APP_URL` when set. Nothing else on this site knows the app's hostname —
moving the app to a custom domain is one env var, not a hunt through components.

> **This site's entire side of the integration is a link.** The sample books are
> generated inside the visitor's browser and stored in their `localStorage`, so there is
> no API call, no token exchange, no shared secret and nothing to configure in the app's
> Supabase project. See the app repo's own `DEMO.md` for the seeded dataset and the
> in-app guardrails.

## Where the demo is linked from

| Surface | Call to action | Tagged |
|---|---|---|
| Home hero | "Try the live demo" · "See the 1-minute tour →" | `?ref=hero` |
| Product tour (`/#tour`) | primary CTA + a "no sign-up, no password" panel | `?ref=product-tour` |
| Pricing (home page and `/pricing`) | "Open the live demo" under the plans | `?ref=pricing` |
| `CtaBand` — features, about, FAQ, customers, blog index | "Try the live demo" | `?ref=cta-band` |
| Blog guides | "Open the live demo" beside "Get Started Free" | `?ref=blog` |
| Who it's for | "Open the live demo" | `?ref=customers` |
| FAQ (`src/lib/faqs.ts`, and its JSON-LD) | "Can I try Ledgr without creating an account?" | — |

Two rules, both structural:

- **Link, never embed.** A cross-origin `<iframe>` of the app is blocked by the app's own
  `frame-ancestors 'self'` CSP, so there is no embeddable widget — every CTA is a plain
  `<a>` opening in the same tab.
- **Tag the surface.** `demo.link("hero")` appends `?ref=hero`; the app preserves query
  parameters on the entry route, so the same mechanism handles campaign links like
  `?ref=instagram-bio`. That is how the demo funnel is measured per placement.

## What the visitor gets

| Surface | Behaviour in demo mode |
|---|---|
| Persistent amber banner | "Demo account — sample data, not your books", time until reset, plus **Reset data**, **Create free account**, **Exit demo** |
| Header | `Demo` badge instead of the plan badge; *Sign out* exits the demo |
| Reads & writes | Fully functional against the seeded books, stored in `localStorage` for this browser only |
| Billing & subscriptions | Replaced by an explanation + **Create free account** |
| Team invitations | Replaced by an explanation (invites would send real email) |
| API keys, webhooks | Replaced by an explanation (they would be inert against a fake tenant) |
| Password change, account deletion | Replaced by an explanation (`demo@ledgr.test` has no password) |
| Idle logout | Disabled, so a visitor walking through screens is never signed out |
| Offline cache (IndexedDB) | Bypassed, so demo data never mixes into a real user's cache |
| AI insights | Work offline against the seeded numbers |

The seeded snapshot regenerates automatically once it is more than 24 hours old
(`DEMO_RESET_AFTER_MS` in the app), so the books always look current, and *Reset data* in
the banner reseeds immediately. Because state is per browser, two visitors never see each
other's changes.

## Turning the demo off

```
NEXT_PUBLIC_DEMO_ENABLED=false
```

Redeploy and every demo call to action disappears: the hero falls back to "See it in
action", the tour to "Try it yourself free", the `CtaBand` and pricing escape hatches
vanish, and no demo copy or identity is rendered anywhere. Use this if the demo route
ever breaks — it needs no code change.

## Pointing the demo elsewhere

```
NEXT_PUBLIC_APP_URL=https://app.ledgr.com   # moves demo + register + login + dashboard
NEXT_PUBLIC_DEMO_URL=https://…/demo/enter   # overrides just the demo entry point
```

`NEXT_PUBLIC_DEMO_EMAIL` only changes the identity shown in the copy (default
`demo@ledgr.test`, matching the app's demo login). `NEXT_PUBLIC_*` values are inlined at
build time, so any change here needs a redeploy.

## Verified, and worth re-checking

Checked from this repo on 2026-09-17 against the deployed app:

- `<app>/demo` renders the static tour and links to `<app>/demo/enter`.
- `<app>/demo/enter` lands on `/dashboard` in demo mode: the amber "Demo account — sample
  data, not your books" banner, `demo@ledgr.test`, "Saved in this browser only · resets in
  24h", and **Reset data** / **Create free account** / **Exit demo** all present.
- The app's own login page links to the demo too ("Or try the public demo"), so the
  sign-in route does not dead-end a curious visitor.

Not verified from here, and worth a look before relying on it:

- **The custom domain.** `app.ledgr.com` did not resolve from this sandbox (neither did
  `ledgr.mw`), so the committed default is the Vercel domain above. If the app is already
  served on `app.ledgr.com`, set `NEXT_PUBLIC_APP_URL` and every link follows.
- **The sample business name.** The deployed demo currently opens *Lilongwe Trading Ltd*,
  while the app's demo notes describe *Zikomo Foods Ltd*. No website copy names the
  business, deliberately — pricing, FAQ and hero copy say "a sample business".
- **The old password login.** This site no longer publishes a demo password and
  `NEXT_PUBLIC_DEMO_PASSWORD` is no longer read anywhere. If the Supabase user
  `demo@ledgr.test` still exists from the earlier password-based demo, it is now unused
  by the website and can be deleted or disabled — but check it holds no real books first,
  in case anything else still signs in as it.
