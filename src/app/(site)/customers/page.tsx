import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CtaBand } from "@/components/ui";
import { demo, site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who it's for",
  description:
    "How shops, wholesalers, traders, multi-branch businesses, contractors, consultants and service businesses in Malawi use Ledgr — the till where it helps, invoicing and reports where it doesn't.",
  alternates: { canonical: "/customers" },
};

/**
 * NOTE: this page used to show six invented customer testimonials with names,
 * cities and 5-star ratings. Ledgr has no published reviews yet, so writing our
 * own would be fabricated social proof — the page now describes who the product
 * is for and what it does for each kind of business. When real, attributable
 * reviews exist, swap this back to quotes.
 *
 * The two groups matter: adding POS must not make Ledgr read like a shop-only
 * product. Businesses that bill for work get the same finance side and simply
 * don't open the till.
 */
const sellingSegments = [
  {
    icon: "🛒",
    who: "Shops & retailers",
    problem: "Sales happen all day, bookkeeping happens never.",
    fixed: [
      "Ring up a sale at the till in seconds, even with no signal",
      "Stock comes off the shelf as you sell it",
      "Today's takings and margin without a calculator",
    ],
  },
  {
    icon: "📦",
    who: "Wholesalers",
    problem: "VAT on bulk buying and selling is easy to get wrong.",
    fixed: [
      "17.5% VAT split automatically on sales and purchases",
      "Sell on credit with the customer attached to the sale",
      "Stock split between the warehouse and the shops, with transfers between them",
    ],
  },
  {
    icon: "🚚",
    who: "Distributors & traders",
    problem: "Mobile money, cash and credit all in the same afternoon.",
    fixed: [
      "Airtel Money, Mpamba, cash, card or a split across them",
      "Price changes at the counter need an approval, not a shrug",
      "Sales by day and by person, so you know where the money went",
    ],
  },
  {
    icon: "🍲",
    who: "Restaurants & lodges",
    problem: "Shift cash never quite reconciles.",
    fixed: [
      "Open a shift with a float, close it against the counted drawer",
      "Z-report at the end of the day showing the variance",
      "Payroll with PAYE and pension worked out for you",
    ],
  },
];

const billingSegments = [
  {
    icon: "🧱",
    who: "Contractors",
    problem: "Withholding tax catches you out at filing time.",
    fixed: [
      "WHT at 10%, 15% or 20% applied per line and tracked",
      "Invoice from site on your phone before you leave",
      "Profit reported per branch or department, from real double-entry books",
    ],
  },
  {
    icon: "💼",
    who: "Consultants",
    problem: "Clients pay in dollars, but the books are in Kwacha.",
    fixed: [
      "Kwacha-first books with exchange rates applied on foreign invoices",
      "Professional PDF invoices in a couple of taps",
      "Clean reports you can hand to an accountant at year end",
    ],
  },
  {
    icon: "🔧",
    who: "Service businesses",
    problem: "You're too busy serving customers to do admin.",
    fixed: [
      "Bill the job and record the payment against it",
      "Paid, part-paid and overdue visible without chasing blind",
      "One dashboard instead of a shoebox of receipts",
    ],
  },
];

function SegmentCard({
  s,
}: {
  s: { icon: string; who: string; problem: string; fixed: string[] };
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
      <span
        className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl"
        aria-hidden
      >
        {s.icon}
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{s.who}</h3>
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
  );
}

export default function CustomersPage() {
  return (
    <div>
      <PageHero
        eyebrow="Who it's for"
        title={
          <>
            Built for how businesses here{" "}
            <span className="text-brand-700">actually trade</span>
          </>
        }
        sub="Ledgr isn't a general accounting tool with Malawi bolted on, and it isn't a shop till with a ledger attached. Here's what it does for different kinds of business."
      />

      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            If you sell face to face
          </h2>
          <p className="text-sm text-ink-soft">
            The till is where most of your day enters Ledgr.
          </p>
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sellingSegments.map((s) => (
            <SegmentCard key={s.who} s={s} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6 pt-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            If you bill for work
          </h2>
          <p className="text-sm text-ink-soft">
            You never open the till — the rest of Ledgr is the same.
          </p>
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {billingSegments.map((s) => (
            <SegmentCard key={s.who} s={s} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-6">
        <div className="rounded-3xl border border-slate-100 bg-brand-50/50 p-7 sm:p-9">
          <h2 className="text-xl font-bold text-ink">
            Growing into more than one place
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
            Once you run a second shop, the question stops being &ldquo;did we
            make money?&rdquo; and becomes &ldquo;which one made it?&rdquo;. Each
            branch keeps its own stock, every sale is tagged with the branch that
            made it, stock moves between them with a record on both sides, and
            the branch performance report puts them side by side. Branches are
            part of the Growth plan and above.
          </p>
        </div>

        {/* Honest note — no reviews exist yet. */}
        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-sm sm:p-9">
          <h2 className="text-xl font-bold text-ink">
            We&apos;re new, so there are no reviews here yet
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Rather than write our own testimonials, we&apos;d rather you judge it
            yourself. Create a free account and use Ledgr on your real numbers — if
            it isn&apos;t right for your business, you&apos;ve lost nothing but a few
            minutes. Using it already? We&apos;d genuinely like to hear how it&apos;s
            going.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={site.registerUrl}
              className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800"
            >
              Try Ledgr →
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
                — a full sample business with an open till shift, no sign-up — or{" "}
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

      <CtaBand />
    </div>
  );
}
