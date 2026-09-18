import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/campaigns", label: "Campaigns" },
];

export const dynamic = "force-dynamic";

/**
 * Chrome for the internal dashboard. `requireAdmin()` here means every page
 * underneath is behind the session cookie, and the whole area is excluded from
 * analytics (see AnalyticsTracker) and from search engines.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-sm font-bold text-white">
              L
            </span>
            <span className="text-sm font-semibold text-ink">
              Ledgr <span className="text-slate-400">/ analytics</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 font-medium text-ink-soft transition hover:bg-slate-100 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" className="text-slate-500 transition hover:text-ink">
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-ink-soft transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 text-xs text-slate-400">
        First-party analytics — this data lives in your own Postgres. See{" "}
        <code className="rounded bg-slate-100 px-1">docs/ANALYTICS.md</code>.
      </footer>
    </div>
  );
}
