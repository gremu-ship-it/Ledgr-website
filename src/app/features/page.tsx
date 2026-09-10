import type { Metadata } from "next";
import { PageHero, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every Ledgr feature: MWK-first dashboard, invoicing with VAT, MRA tax suite, payroll, inventory and real financial reports — all offline-capable.",
};

const groups = [
  {
    eyebrow: "Money in & out",
    items: [
      {
        icon: "🧾",
        title: "Invoices & income",
        desc: "Numbered, VAT-correct PDF invoices in seconds. Automatic reminders chase late payers politely so you don't have to.",
      },
      {
        icon: "💸",
        title: "Expense tracking",
        desc: "Log spending in seconds, snap receipts, and split VAT automatically. Every tambala accounted for.",
      },
      {
        icon: "📊",
        title: "Real-time dashboard",
        desc: "Live P&L, income, expenses and net profit — always in Malawian Kwacha, always up to date.",
      },
    ],
  },
  {
    eyebrow: "Stay compliant",
    items: [
      {
        icon: "🏛️",
        title: "MRA tax suite",
        desc: "VAT at 17.5%, PAYE on the 2026 bands, withholding tax and the TEVETA levy — calculated for you with due-date reminders.",
      },
      {
        icon: "📑",
        title: "Real financial reports",
        desc: "P&L, Balance Sheet, Cash Flow and Trial Balance generated from proper double-entry books your accountant can trust.",
      },
      {
        icon: "🗂️",
        title: "Audit-ready records",
        desc: "Sequential invoice numbers, certificates and a complete transaction history — ready whenever MRA asks.",
      },
    ],
  },
  {
    eyebrow: "Run the business",
    items: [
      {
        icon: "📦",
        title: "Inventory & stock",
        desc: "Track quantities and movement across products so you always know what is on the shelf.",
      },
      {
        icon: "👥",
        title: "Payroll & contacts",
        desc: "Payslips with PAYE handled, plus customers and suppliers in one address book.",
      },
      {
        icon: "📴",
        title: "Offline-first",
        desc: "No signal at the market? Keep recording on your phone. Everything queues on your device and syncs to your computer the moment you reconnect.",
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
            Everything to run your books, <span className="text-brand-600">nothing you don&apos;t need</span>
          </>
        }
        sub="Accounting, tax, payroll and inventory in one calm app — designed for how Malawi actually does business."
      />
      {groups.map((g) => (
        <section key={g.eyebrow} className="mx-auto max-w-6xl px-5 pb-4 pt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {g.eyebrow}
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {g.items.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
                  {f.icon}
                </div>
                <h2 className="mt-4 text-lg font-bold text-ink">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="h-12" />
      <CtaBand
        title="See it on your own books"
        sub="Start free, import your customers, and send your first VAT-correct invoice today."
      />
    </div>
  );
}
