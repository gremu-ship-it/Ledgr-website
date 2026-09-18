import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  // Locked until a password exists — better a setup page nobody expected than
  // an open dashboard.
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-ink">The dashboard is switched off</h1>
          <p className="mt-2 text-sm text-ink-soft">
            No admin password is set, so the analytics dashboard refuses to open. Add
            these environment variables in Vercel (or <code>.env.local</code>) and redeploy:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-white p-4 text-xs text-ink">
{`ADMIN_PASSWORD=choose-a-long-password
ADMIN_USER=admin              # optional, defaults to admin
ADMIN_SECRET=another-long-random-string   # optional, keeps sessions
                                          # valid across password changes
ANALYTICS_SALT=a-random-string            # salts the IP hashes`}
          </pre>
          <p className="mt-3 text-xs text-ink-soft">
            Traffic is still recorded while the dashboard is off — the collector and the
            tracking cookie don&apos;t depend on it. See <code>docs/ANALYTICS.md</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-ink">Ledgr analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Visitors, leads and follow-ups. Staff only.
        </p>

        <form action={loginAction} className="mt-5 space-y-3">
          <input
            name="user"
            autoComplete="username"
            placeholder="Username"
            defaultValue="admin"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              That password didn&apos;t match. Try again.
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
