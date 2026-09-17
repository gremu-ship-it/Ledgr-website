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

Every row that points at the app renders through
[`DemoLink`](./src/components/DemoLink.tsx) — nine links in total (five
`demo.link(ref)` entry points, three `demo.tourUrl` tour links, and the hero's pair). The
FAQ row is copy plus JSON-LD, so it has no link to wrap.

Three rules, all structural:

- **Link, never embed.** The app refuses to be framed (`X-Frame-Options: DENY` plus a
  `frame-ancestors 'none'` CSP), so there is no embeddable widget and no inline demo —
  every CTA is a link out.
- **Escape the frame, then relax.** [`src/components/DemoLink.tsx`](./src/components/DemoLink.tsx)
  renders `target="_blank"` in the server HTML and relaxes to `target="_self"` once the
  browser confirms the document is top-level. All nine demo links go through it. See
  below for why — getting this wrong is what turns a demo click into a login page.
- **Tag the surface.** `demo.link("hero")` appends `?ref=hero`; the app preserves query
  parameters on the entry route, so the same mechanism handles campaign links like
  `?ref=instagram-bio`. That is how the demo funnel is measured per placement.

## Why a demo click can land on the login page

Two independent causes. Neither is the link's `href` — both were confirmed against the
deployed app, which serves `/demo` and `/demo/enter` correctly from a cold browser.

**1. This site is being viewed inside a frame.** Preview tools, embeds and link
unfurlers render the marketing site in an `<iframe>`. A same-tab click then navigates
*the frame*, and the app — which forbids framing — will not render there. The visitor
gets a blank box or the app's cached shell, and because the app redirects any route it
does not recognise to `/login`, the shell lands on the login page. This is fixed here by
`DemoLink`: `target="_blank"` escapes to a real top-level tab, where the demo works.

**2. A stale service-worker shell in the visitor's browser.** This is the app's bug and
it needs no change on this site. The app's PWA precaches with `navigateFallback:
'/index.html'`, so a browser that visited the app *before* the demo shipped serves that
old bundle from cache for any navigation, including `/demo/enter`. The old bundle has no
`/demo` route, and the app sends unknown paths to `/login` — verified: requesting
`/this-route-does-not-exist-xyz` on the deployed app redirects to `/login`. So a
returning visitor can click a perfectly correct link and still land on the sign-in page.

The durable fix is one line in the **app repo**'s `vite.config.ts` — tell the workbox
plugin to never serve the precached shell for these paths, so they reach the network:

```ts
navigateFallbackDenylist: [/^\/api\//, /^\/demo\//],
```

Written up as a patch note in [`docs/README.md`](./docs/README.md) because it belongs to
`gremu-ship-it/Ledgr-react`, not here. Until it ships, the workaround for anyone hitting
this is a hard reload, or unregistering the service worker in DevTools → Application →
Service Workers.

### Known gap

`DemoLink` covers the nine demo links. The **register** links (`Get Started Free →`,
"Create a free account") still render as plain anchors, so inside a framed preview they
have the same failure mode. They were deliberately left alone to keep this change scoped
to the demo — wrap them in `DemoLink` the same way if framed previews turn out to be a
common way people reach this site.


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

- **The framing headers.** `X-Frame-Options: DENY` / `frame-ancestors 'none'` were
  observed in a real browser, but this repo's sandbox cannot reach the app's hostname at
  all (`curl https://ledgr-react.vercel.app/` fails in the TLS handshake while
  `github.com` answers 200 — egress is blocked to Vercel, not a DNS problem). The claim
  is therefore carried on report, not re-checked here. `DemoLink` is safe either way:
  if the app ever does allow framing, a top-level visitor still gets `target="_self"`
  and an embedded one opens a new tab, which works regardless.
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
