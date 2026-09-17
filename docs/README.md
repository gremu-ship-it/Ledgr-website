# Notes for the app repo

## Superseded: the `/demo` password-login patch

This folder used to hold `demo-route.patch` — a 580-line diff adding a `/demo` route to
[`gremu-ship-it/Ledgr-react`](https://github.com/gremu-ship-it/Ledgr-react) that signed a
visitor in with a **public demo password** held in env vars.

**Do not apply it, and it is no longer in this repo.** The app has since shipped something
strictly better, and the patch now conflicts with it:

| | The patch | What the app ships today |
|---|---|---|
| Credentials | `demo@ledgr.test` + a public password in `VITE_DEMO_PASSWORD` | none — `/demo/enter` is passwordless |
| Where the books live | a real Supabase tenant | the visitor's own browser (`localStorage`) |
| Failure modes | unconfirmed email, MFA prompt, rotated password, half-set env vars | a link that works or a page that says the demo is off |
| Data to police | a shared account the whole internet can edit | per-browser, regenerated every 24h |

The patch's history is still available in git:

```bash
git log --oneline -- docs/demo-route.patch          # last commit that carried it
git show <sha>:docs/demo-route.patch > /tmp/demo-route.patch
```

It was also filed as [Ledgr-react issue #151](https://github.com/gremu-ship-it/Ledgr-react/issues/151),
which can be closed — the feature landed a different way.

## Open: the app's service worker can still send a demo click to /login

This one **does** need a change in [`gremu-ship-it/Ledgr-react`](https://github.com/gremu-ship-it/Ledgr-react).

The app's PWA precaches with `navigateFallback: '/index.html'`. A browser that visited
the app before the demo shipped therefore serves that old bundle from cache for *any*
navigation, `/demo/enter` included. The old bundle has no `/demo` route, and the app
redirects unrecognised paths to `/login` — verified against the deployed app: requesting
`/this-route-does-not-exist-xyz` redirects to `/login`. The result is that a returning
visitor clicks a correct link from this site and lands on the sign-in page, which reads
as "the demo sends me to login".

The fix is one line in `vite.config.ts`, in the `VitePWA({ workbox: { … } })` block:

```ts
navigateFallbackDenylist: [/^\/api\//, /^\/demo\//],
```

Paths matching the denylist are never answered from the precached shell, so `/demo` and
`/demo/enter` always reach the network and get the current bundle. `/^\/api\//` is
already the conventional entry and belongs in the same list.

Until that ships, the workaround for an affected visitor is a hard reload, or
unregistering the service worker (DevTools → Application → Service Workers →
Unregister) and reloading once.

Not part of this bug, but adjacent: the app's unknown-path redirect to `/login` is what
turns every stale-shell miss into a confusing sign-in page. A 404 there would make the
next occurrence obvious instead of looking like a broken demo.

## What the website does now

Nothing in this repo needs to change in the app for the demo itself. The integration is
one link:

```
NEXT_PUBLIC_APP_URL=https://app.ledgr.com   # optional: moves demo + register + login
```

…with `<app>/demo/enter` for the one-click demo and `<app>/demo` for the static tour,
both derived in [`../src/lib/site.ts`](../src/lib/site.ts). See [`../DEMO.md`](../DEMO.md)
for every surface the demo is linked from, the kill switch and the verification notes.

The one app-side assumption this site makes is that the app **refuses to be framed**
(`X-Frame-Options: DENY` + `frame-ancestors 'none'`), which is why every demo link opens
a top-level tab when the marketing site is itself embedded — see
[`../src/components/DemoLink.tsx`](../src/components/DemoLink.tsx). If the app ever
starts allowing framing, say so here and `DemoLink` can be simplified.
