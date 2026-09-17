# App-repo changes drafted from here

This folder holds changes destined for the **app** repo
([`gremu-ship-it/Ledgr-react`](https://github.com/gremu-ship-it/Ledgr-react)).
They live here because this session is pinned to the website branch, so nothing can be
committed to another repository from it. Everything below is verified against the app's
own tooling before being written down.

## `demo-route.patch` — one-click public demo (`/demo`)

Today the website sends "Try the live demo" to the app's **login page** and prints the
credentials, so visitors have to type them in. This patch adds a `/demo` route that signs
them straight into the sample business instead — one tap, no typing, and no credentials
on the marketing site at all.

### Apply it

```bash
git clone https://github.com/gremu-ship-it/Ledgr-react.git
cd Ledgr-react
git checkout -b feat/public-demo-route
git apply /path/to/Ledgr-website/docs/demo-route.patch
npm ci
npm run verify        # typecheck + lint + tests + build
```

Then set the env vars (Vercel → Project → Settings → Environment Variables) and redeploy:

```
VITE_DEMO_EMAIL=demo@ledgr.test
VITE_DEMO_PASSWORD=gremu@1989
```

Finally point the website at it — set `NEXT_PUBLIC_DEMO_URL=https://ledgr-react.vercel.app/demo`
in the website's Vercel env. The site already prefers that URL when it is set, so no
website code changes are needed.

### What the patch does

| File | Change |
|---|---|
| `src/lib/demo.ts` | **new** — reads `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`, exposes `isDemoConfigured` and `isDemoUser()` |
| `src/pages/DemoPage.tsx` | **new** — the `/demo` route: signs in and redirects to the dashboard, or explains exactly why it can't |
| `src/components/demo/DemoModeBanner.tsx` | **new** — amber banner inside the app when the demo user is signed in, with a "Create your own account" CTA |
| `src/App.tsx` | registers `/demo` outside `PublicOnlyRoute` |
| `src/components/layout/AppLayout.tsx` | renders the demo banner |
| `src/vite-env.d.ts` | types the two new env vars |
| `.env.example` | documents them |
| `scripts/check-env.mjs` | warns (never fails) if only one of the pair is set |
| `src/pages/__tests__/DemoPage.test.tsx` | **new** — 6 tests covering the failure modes |

### Why it's built this way

- **It never signs a real user out.** If someone is already signed in, `/demo` says who
  they are and offers an explicit "Sign out and open the demo" button, rather than
  silently swapping their session. That's why the route sits outside `PublicOnlyRoute`.
- **It fails loudly, not silently.** A wrong password, an unconfirmed account, a second
  factor, or an unconfigured deployment each get their own message — the visitor is never
  left on a spinner guessing.
- **Leaving it off is safe.** With the env vars blank the page reports that the demo is
  switched off; nothing else in the app changes behaviour.
- **Half-configured builds are caught.** `check-env.mjs` warns during the build if only
  one of the two vars is set, which is otherwise a silent trap.

### Verified before writing the patch

Run inside a clone of the app at `main` (no other modifications):

- `tsc -b` — clean
- `eslint` on every changed file — clean (the repo has 8 pre-existing errors elsewhere,
  untouched by this patch)
- `vitest run` — **384 passed**, including the 6 new `/demo` tests
- `vite build` — production build succeeded

### Not verified — please check after applying

- The demo login itself. This sandbox has no network route to Supabase or Vercel, so the
  credentials have never been exercised. In particular `demo@ledgr.test` can never receive
  mail (`.test` is reserved by RFC 2606), so that Supabase user must have **Auto Confirm
  User** on and **MFA off**.
- **That the account holds only sample data.** These credentials ship in the public
  bundle, so anyone can read them. The account must never be a platform admin, a partner
  admin, or a member of a real business. See `../DEMO.md` for the full checklist.
