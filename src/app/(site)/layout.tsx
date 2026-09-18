import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import Analytics from "@/components/Analytics";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ConsentBanner from "@/components/ConsentBanner";

/**
 * The marketing site's chrome — and the only place the tracker is mounted.
 *
 * It lives in a `(site)` route group, which is why the internal dashboard at
 * /admin gets none of it: no public navbar, no marketing footer, no cookie
 * banner, and no analytics script. The URL structure is unchanged; route
 * groups don't appear in paths.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Plausible (if configured) plus the first-party tracker: pageviews,
          outbound/CTA clicks, and the consent banner that gates them. */}
      <Analytics />
      <AnalyticsTracker />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <StickyCta />
      <ConsentBanner />
    </>
  );
}
