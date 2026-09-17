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

## What the website does now

Nothing in this repo needs to change in the app. The integration is one link:

```
NEXT_PUBLIC_APP_URL=https://app.ledgr.com   # optional: moves demo + register + login
```

…with `<app>/demo/enter` for the one-click demo and `<app>/demo` for the static tour,
both derived in [`../src/lib/site.ts`](../src/lib/site.ts). See [`../DEMO.md`](../DEMO.md)
for every surface the demo is linked from, the kill switch and the verification notes.
