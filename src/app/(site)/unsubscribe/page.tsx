import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contacts } from "@/db/schema";
import { confirmUnsubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Hides most of an address: `khwima@example.com` → `kh•••@example.com`. */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, Math.min(local.length - 2, 6)))}@${domain}`;
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token = "", done } = await searchParams;

  let email: string | null = null;
  if (token && !done) {
    try {
      const [row] = await getDb()
        .select({ email: contacts.email })
        .from(contacts)
        .where(eq(contacts.unsubscribeToken, token))
        .limit(1);
      email = row?.email ?? null;
    } catch {
      email = null;
    }
  }

  const confirmed = done === "1";

  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        {confirmed ? (
          <>
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-xl">
              ✓
            </div>
            <h1 className="text-lg font-semibold text-ink">You&apos;re unsubscribed</h1>
            <p className="mt-2 text-sm text-ink-soft">
              We won&apos;t email you about marketing again. If you ever need help with Ledgr,
              you can still reach us directly and we&apos;ll reply — that&apos;s a conversation
              you started, not marketing.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href="/contact"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-slate-50"
              >
                Contact us
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Back to the site
              </Link>
            </div>
          </>
        ) : email ? (
          <>
            <h1 className="text-lg font-semibold text-ink">Stop emails to {maskEmail(email)}?</h1>
            <p className="mt-2 text-sm text-ink-soft">
              You&apos;ll stop receiving marketing emails from Ledgr. One click, no questions, no
              &ldquo;are you sure?&rdquo; loop.
            </p>
            <form action={confirmUnsubscribeAction} className="mt-5">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Unsubscribe me
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Changed your mind? Just close this page — nothing happens unless you press the
              button.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-ink">Link not recognised</h1>
            <p className="mt-2 text-sm text-ink-soft">
              This unsubscribe link is incomplete or has already been used. Reply to any email
              from us and ask to be removed — a person will do it by hand.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Contact us
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
