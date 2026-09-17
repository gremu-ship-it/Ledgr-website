import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CtaBand } from "@/components/ui";
import { demo, site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who it's for",
  description:
    "How Malawian shops, wholesalers, contractors, consultants and service businesses use Ledgr — offline sales capture, painless VAT and reports your accountant can read.",
};

/**
 * NOTE: this page used to show six invented customer testimonials with names,
 * cities and 5-star ratings. Ledgr has no published reviews yet, so writing our
 * own would be fabricated social proof — the page now describes who the product
 * is for and what it does for each kind of business. When real, attributable
 * reviews exist, swap this back to quotes.
 */

const segments = [
  {
    icon: "🛒",
    who: "Shops & traders",
    problem: "Sales happen all day, bookkeeping happens never.",
    fixed: [
      "Log a sale in seconds, even with no signal",
      "See today's takings and profit without a calculator",
      "Know what stock is actually left on the shelf",
    ],
  },
  {
    icon: "📦",
    who: "Wholesalers",
    problem: "VAT on bulk purchases and sales is easy to get wrong.",
    fixed: [
      "17.5% VAT split automatically on every transaction",
      "Input VAT on purchases tracked, so your return is ready",
      "Customer and supplier balances in one place",
    ],
  },
  {
    icon: "🧱",
    who: "Contractors",
    problem: "Withholding tax and TEVETA catch you out at filing time.",
    fixed: [
      "WHT and TEVETA tracked with due-date reminders",
      "Quote, invoice and get paid on one platform",
      "Real P&L per project from double-entry books",
    ],
  },
  {
    icon: "💼",
    who: "Consultants",
    problem: "Clients pay in dollars, but the books are in Kwacha.",
    fixed: [
      "MWK-first books so your accountant is never guessing",
      "Professional PDF invoices in a couple of taps",
      "Clean reports you can hand over at year end",
    ],
  },
  {
    icon: "🍲",
    who: "Restaurants & lodges",
    problem: "Payroll, stock and daily cash never reconcile.",
    fixed: [
      "Payroll with PAYE and pension worked out for you",
      "Daily expenses captured as they happen",
      "Cash flow you can trust at month end",
    ],
  },
  {
    icon: "🚚",
    who: "Service businesses",
    problem: "You're too busy serving customers to do admin.",
    fixed: [
      "Invoice on your phone before you leave the site",
      "Payment status tracked so you stop chasing blind",
      "One dashboard instead of a shoebox of receipts",
    ],
  },
];

export default function CustomersPage() {
  return (
    <div>
      <PageHero
        eyebrow="Who it's for"
        title={
          <>
            Built for how Malawian businesses{" "}
            <span className="text-brand-700">actually trade</span>
          </>
        }
        sub="Ledgr isn't a general accounting tool with Malawi bolted on. Here's what it does for the kinds of businesses running on it."
      />

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((s) => (
            <article
              key={s.who}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl"
                aria-hidden
              >
                {s.icon}
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{s.who}</h2>
              <p className="mt-2 text-sm italic text-slate-500">{s.problem}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                {s.fixed.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-700 text-[10px] text-white">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Honest note — no reviews exist yet. */}
        <div className="mt-10 rounded-3xl border border-slate-100 bg-brand-50/50 p-7 text-center sm:p-9">
          <h2 className="text-xl font-bold text-ink">
            We&apos;re new, so there are no reviews here yet
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Rather than write our own testimonials, we&apos;d rather you judge it
            yourself. Create a free account and use Ledgr on your real numbers — if it
            isn&apos;t right for your business, you&apos;ve lost nothing but a few
            minutes. Using it already? We&apos;d genuinely like to hear how it&apos;s
            going.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={site.registerUrl}
              className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800"
            >
              Try it yourself free →
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
            >
              Tell us how it&apos;s going
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Want to see how it works first?{" "}
            {demo.available ? (
              <>
                <a
                  href={demo.link("customers")}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Open the live demo
                </a>{" "}
                — a full sample business, no sign-up — or{" "}
                <Link
                  href="/#tour"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  take the product tour
                </Link>
                .
              </>
            ) : (
              <>
                <Link
                  href="/#tour"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Take the product tour
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </section>

      <CtaBand
        title="See it on your own numbers"
        sub="Free to start, no card, and setup takes minutes. If it isn't a fit, you've lost nothing."
      />
    </div>
  );
}
