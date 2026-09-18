"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ANALYTICS_ENABLED,
  getConsent,
  setConsent,
  subscribeConsent,
  subscribeNever,
  type ConsentChoice,
} from "@/lib/tracker";

/** Re-open the banner from anywhere (the footer link) with this event. */
export const OPEN_CONSENT_EVENT = "ledgr:open-consent";

/**
 * The cookie banner. Analytics stays anonymous until this is answered: the
 * server counts plain pageviews with no identifier, and only mints a visitor
 * id once "Accept" is pressed. Declining is one click, and equally prominent.
 *
 * Do Not Track / Global Privacy Control is honoured automatically — a browser
 * that asks not to be tracked is answered "no" without showing a banner.
 *
 * State comes from the tracker store rather than an effect, so the server and
 * first client render agree and there's no hydration flash.
 */
export default function ConsentBanner() {
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Subscribe to the "open preferences" event (the footer link) and respect
  // DNT/GPC. Both are genuine external-system wiring, not derived state.
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;

    const open = () => setForcedOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);

    const dnt =
      navigator.doNotTrack === "1" ||
      (navigator as unknown as { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true;
    if (dnt && getConsent() === null) {
      // A browser that asks not to be tracked gets a "no" without a click.
      void setConsent("denied");
    }

    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  async function choose(choice: ConsentChoice) {
    setBusy(true);
    await setConsent(choice);
    setBusy(false);
    setForcedOpen(false);
  }

  if (!ANALYTICS_ENABLED) return null;
  const visible = mounted && (forcedOpen || consent === null);
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and analytics preferences"
      className="fixed inset-x-3 bottom-20 z-[60] mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 md:bottom-5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-base"
        >
          🍪
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Can we measure what&apos;s useful?</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            We use one first-party cookie to see which pages help Malawian businesses decide —
            and to follow up better if you get in touch. No ads, no selling data, no third-party
            trackers. Decline and you can still use every page.{" "}
            <Link href="/privacy" className="font-medium underline">
              Privacy policy
            </Link>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => choose("granted")}
              className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => choose("denied")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-ink-soft transition hover:bg-slate-50 disabled:opacity-60"
            >
              Decline
            </button>
            {consent ? (
              <button
                type="button"
                onClick={() => setForcedOpen(false)}
                className="text-xs text-slate-500 underline"
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
