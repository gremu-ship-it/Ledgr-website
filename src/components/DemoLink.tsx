"use client";

import { useSyncExternalStore } from "react";
import type { AnchorHTMLAttributes } from "react";

/**
 * A link into the app, for the demo above all.
 *
 * The app refuses to be framed — it serves `X-Frame-Options: DENY` and a
 * `frame-ancestors 'none'` CSP (reported from a real browser; the app's
 * hostname is not reachable from the CI sandbox, so this repo cannot re-assert
 * it). That matters because this marketing site is routinely viewed *inside a
 * frame*: preview tools, embeds, in-app browsers and link unfurlers all render
 * it in an iframe. In that context a same-tab click does not go anywhere
 * useful:
 *
 *   - `target="_self"` navigates **the frame**, so the browser asks the app to
 *     render itself inside a box it has just forbidden — a blank frame, or the
 *     app's cached shell, which is how a "demo" click ends up on the login
 *     page (see `DEMO.md` → "Why a demo click can land on the login page").
 *   - `target="_blank"` escapes to a real top-level tab, where the demo works.
 *
 * So the safe default is `_blank`, and it is the default *in the server HTML*:
 * a visitor who clicks before hydration, or with JS off, still gets out of the
 * frame. Once the browser confirms we own the tab there is no frame to escape
 * and `_self` is the better experience, so hydration relaxes it.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` on purpose: it is
 * the one hook built to hold a value that differs between server and client
 * without a hydration mismatch, and it needs no effect and no second render.
 */

const ESCAPE_THE_FRAME = "_blank";
const WE_OWN_THE_TAB = "_self";

/**
 * Whether this document is the top-level browsing context.
 *
 * Comparing `window.self` to `window.top` is legal cross-origin (it is
 * `window.top.location` that throws), and a document cannot be re-parented
 * into or out of a frame after load — so the answer is fixed for the life of
 * the page and there is nothing to subscribe to. A sandboxed frame without
 * `allow-same-origin` can still throw on the comparison in some browsers, and
 * the catch falls back to escaping the frame, which is the safe direction.
 */
function ownsTheTab(): boolean {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
}

function subscribeToOwnership(onStoreChange: () => void): () => void {
  // Nothing changes after load, so there is no listener to attach. Returning a
  // no-op unsubscribe satisfies the hook's contract.
  void onStoreChange;
  return () => {};
}

/** Client: `_self` only once we have confirmed there is no frame above us. */
function getClientSnapshot() {
  return ownsTheTab() ? WE_OWN_THE_TAB : ESCAPE_THE_FRAME;
}

/** Server (and hydration): assume the worst case, escape the frame. */
function getServerSnapshot() {
  return ESCAPE_THE_FRAME;
}

/**
 * `noopener` is implicit on `target="_blank"` in current browsers but stated
 * anyway, because the value here is computed and `rel` should not depend on
 * browser version. `noreferrer` keeps the demo funnel honest in both
 * directions: the app sees no referrer from a preview iframe, and the marketing
 * site leaks nothing of its own URL through one.
 */
function relFor(target: string, extra?: string) {
  const tokens = target === ESCAPE_THE_FRAME ? ["noopener", "noreferrer"] : [];
  if (extra) tokens.push(...extra.split(/\s+/).filter(Boolean));
  const unique = [...new Set(tokens)];
  return unique.length > 0 ? unique.join(" ") : undefined;
}

export type DemoLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target"
> & {
  /** Where the link goes. Pass `demo.link("hero")` / `demo.tourUrl`. */
  href: string;
};

/**
 * Renders `target="_blank"` on the server and relaxes to `"_self"` once the
 * browser confirms we own the tab. Use for every link that leaves this site for
 * the app — the demo entry, the read-only tour, and anything else the app serves.
 *
 * Deliberately a plain `<a>` and not `next/link`: these are cross-origin.
 */
export default function DemoLink({ href, rel, ...rest }: DemoLinkProps) {
  const target = useSyncExternalStore(
    subscribeToOwnership,
    getClientSnapshot,
    getServerSnapshot,
  );

  return <a href={href} target={target} rel={relFor(target, rel)} {...rest} />;
}
