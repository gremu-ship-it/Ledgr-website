import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "Features",
  description:
    "What Ledgr does: point of sale, stock across branches, invoicing with 17.5% VAT, expenses, payroll, financial reports and Malawi tax dates — in Kwacha, online or offline.",
  alternates: { canonical: "/features" },
};

/**
 * Organised by what a business does, not by what the software is made of, and
 * deliberately without duplication between groups — a feature appears once, in
 * the part of the day it belongs to.
 *
 * Everything listed is implemented in the Ledgr application today. Four claims
 * were removed in the 2026-09-27 audit because nothing in the app supports
 * them: quotes, automatic reminders chasing late payers, receipt photo capture,
 * and MRA "certificates". See docs/PRODUCT-AUDIT-2026-09.md §2.
 */
const groups = [
  {
    eyebrow: "Sell",
    lead: "Take the money, whichever way it arrives.",
    items: [
      {
        icon: "🛒",
        title: "Point of sale",
        desc: "Scan a barcode or search your product list, apply a discount within the cashier's limit, park a sale and come back to it, and charge with one key. Shifts open with a float and close against the counted drawer with a Z-report.",
      },
      {
        icon: "💵",
        title: "Payments",
        desc: "Cash, Airtel Money, TNM Mpamba, bank transfer, card or on credit — split across more than one method, with change worked out for you.",
      },
      {
        icon: "🧾",
        title: "Invoices",
        desc: "Numbered PDF invoices with VAT split per line, sent to a customer in a couple of taps. Paid, part-paid and overdue are visible at a glance.",
      },
      {
        icon: "🧷",
        title: "Receipts",
        desc: "Print from the browser or straight to a Bluetooth thermal printer, with the cash drawer opening as it prints.",
      },
      {
        icon: "↩️",
        title: "Refunds & voids",
        desc: "Return part of a sale or void it entirely, with a reason recorded — and a manager's approval required when you decide it should be.",
      },
      {
        icon: "👥",
        title: "Customers",
        desc: "Sell to a walk-in or to a named customer, added at the till in seconds and reusable on their next invoice.",
      },
    ],
  },
  {
    eyebrow: "Manage",
    lead: "Know what you hold, what you owe and who you pay.",
    items: [
      {
        icon: "📦",
        title: "Stock",
        desc: "Quantity on hand per branch and warehouse, reorder levels, and a movement history where sales, transfers and goods received all appear together.",
      },
      {
        icon: "🔁",
        title: "Warehouses & transfers",
        desc: "Hold stock in more than one place and move it between them — warehouse to shop, or shop to shop — with both sides of the move recorded.",
      },
      {
        icon: "💸",
        title: "Expenses",
        desc: "Record spending against the right account with input VAT separated, so your VAT return isn't a reconstruction job.",
      },
      {
        icon: "🧮",
        title: "Payroll",
        desc: "Payslips with PAYE calculated on the MRA bands and pension handled at the statutory rates.",
      },
      {
        icon: "🤝",
        title: "Suppliers & contacts",
        desc: "One list for the people you buy from and sell to, shared by invoices, bills and the till.",
      },
      {
        icon: "🏬",
        title: "Branches & departments",
        desc: "Run more than one shop or site from one account, each with its own stock and its own sales, and split costs by department where that is how you think about the business.",
      },
    ],
  },
  {
    eyebrow: "Understand",
    lead: "The point of recording it all.",
    items: [
      {
        icon: "📊",
        title: "Business dashboard",
        desc: "Income, expenses, net profit, money owed to you and VAT accrued — this month against last, always in Kwacha.",
      },
      {
        icon: "📑",
        title: "Financial reports",
        desc: "Profit or loss, statement of financial position, cash flow, changes in equity, trial balance and a revenue breakdown — generated from proper double-entry books your accountant can read.",
      },
      {
        icon: "🏬",
        title: "Branch performance",
        desc: "Compare branches side by side instead of relying on whoever shouts loudest at the end of the month.",
      },
      {
        icon: "📈",
        title: "Sales analytics",
        desc: "Sales by cashier, branch and day, with average sale value, discounts given and returns taken, over today, a week, a month or the lot.",
      },
      {
        icon: "🧠",
        title: "AI insights",
        desc: "Ask questions of your own figures and get an answer grounded in your books rather than a general opinion. Pro plan.",
      },
      {
        icon: "🏦",
        title: "Bank reconciliation",
        desc: "Match what the bank says against what your books say, and find the difference before your accountant does. Growth plan.",
      },
    ],
  },
  {
    eyebrow: "Stay compliant",
    lead: "Malawi's rules, built in rather than bolted on.",
    items: [
      {
        icon: "🏛️",
        title: "VAT at 17.5%",
        desc: "Split automatically on sales and purchases, with zero-rated and exempt items handled per line, and output against input VAT summarised for the period.",
      },
      {
        icon: "👔",
        title: "PAYE",
        desc: "Calculated on the MRA bands for the fiscal year, editable if your business has its own arrangement.",
      },
      {
        icon: "✂️",
        title: "Withholding tax",
        desc: "WHT at 10%, 15% or 20% applied per line and posted where it belongs in the accounts.",
      },
      {
        icon: "🗓️",
        title: "Filing dates",
        desc: "PAYE and WHT on the 14th, VAT on the 25th, the TEVET levy on 1 April — each shown with the days left before it's due.",
      },
      {
        icon: "🔒",
        title: "Period locking",
        desc: "Close a month so nobody edits a period you've already reported on.",
      },
      {
        icon: "🗂️",
        title: "Audit trail",
        desc: "Sequential document numbers and a record of who did what, including who approved a discount, a refund or a void at the till.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything the day needs,{" "}
            <span className="text-brand-700">nothing you don&apos;t</span>
          </>
        }
        sub="Selling, stock, billing, payroll, tax and reports in one place — designed around how businesses in Malawi actually trade."
      />
      {groups.map((g) => (
        <section key={g.eyebrow} className="mx-auto max-w-6xl px-5 pb-4 pt-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {g.eyebrow}
            </h2>
            <p className="text-sm text-ink-soft">{g.lead}</p>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {g.items.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
                  <span aria-hidden>{f.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-6xl px-5 pb-4 pt-10">
        <div className="rounded-3xl border border-slate-100 bg-brand-50/50 p-7 sm:p-9">
          <h2 className="text-xl font-bold text-ink">Which plan has what</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
            The free plan covers the dashboard, income, expenses, invoices and
            payroll. Products and stock — what the till sells from — plus the
            accounting modules and financial reports start on Starter. Branches,
            departments, contacts, bank reconciliation, journals, period
            management and the audit log start on Growth. AI insights and the
            developer side — a public API, webhooks and Zapier — are Pro.{" "}
            <Link
              href="/pricing"
              className="font-semibold text-brand-700 hover:underline"
            >
              See the plans →
            </Link>
          </p>
        </div>
      </section>

      <div className="h-12" />
      <CtaBand
        title="See it on your own numbers"
        sub="Start free, load your products, and ring up a sale today."
      />
    </div>
  );
}
