"use client";

import { useSyncExternalStore } from "react";
import {
  ANALYTICS_ENABLED,
  getConsent,
  subscribeConsent,
} from "@/lib/tracker";
import { OPEN_CONSENT_EVENT } from "@/components/ConsentBanner";

/**
 * Reopens the cookie banner from the footer, which is where people look for it
 * (and what the privacy policy promises). Shows the current choice so nobody
 * has to guess what they picked.
 *
 * The store's server snapshot is "undecided", so the server-rendered label and
 * the first client render match; the real choice appears after hydration.
 */
export default function CookieSettingsButton() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => null);

  if (!ANALYTICS_ENABLED) return null;

  const label =
    consent === "granted"
      ? "Analytics: on — change"
      : consent === "denied"
        ? "Analytics: off — change"
        : "Cookie settings";

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="text-left transition hover:text-brand-700"
    >
      {label}
    </button>
  );
}
