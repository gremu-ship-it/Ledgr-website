"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_ENABLED,
  installAutoTracking,
  track,
  trackPageLeave,
} from "@/lib/tracker";

/**
 * Drives everything the tracker does automatically:
 *  - one pageview per route change (the admin dashboard is never tracked),
 *  - a pageleave event carrying how long the page was actually open,
 *  - the delegated click/scroll/form listeners.
 *
 * Renders nothing. Safe to mount once in the root layout.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const enteredAt = useRef<number>(0);
  const leftReported = useRef(false);

  // Pageview per navigation. `enteredAt` restarts so the duration reported on
  // leave belongs to *this* page, not the whole session.
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    if (pathname?.startsWith("/admin")) return;
    enteredAt.current = Date.now();
    leftReported.current = false;
    track({ type: "pageview" });
  }, [pathname]);

  // Reveal the entry page's referrer as soon as we know it (scroll/click
  // tracking is installed immediately).
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    return installAutoTracking();
  }, []);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;

    const report = () => {
      if (leftReported.current || !enteredAt.current) return;
      leftReported.current = true;
      trackPageLeave(Date.now() - enteredAt.current);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        report();
      } else {
        // Back in the tab: keep counting from now.
        enteredAt.current = Date.now();
        leftReported.current = false;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
      report();
    };
  }, []);

  return null;
}
