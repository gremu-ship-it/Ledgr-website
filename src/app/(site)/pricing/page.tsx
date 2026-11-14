import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import PricingPlans from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pricing in Kwacha: Free, Starter at MWK 50,000/month, Growth at MWK 100,000/month, Pro at MWK 200,000/month, Enterprise at MWK 500,000/month. Paid by mobile money or card through PayChangu.",
  alternates: { canonical: "/pricing" },
};

/**
 * Plan answers follow the gates in the application (`navConfig.ts` and the
 * route gates in `App.tsx`), last checked at `Ledgr-react@7fb872d`. If a bullet
 * in `lib/pricing.ts` moves, the matching answer here moves with it.
 */
const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes. Free covers the dashboard, income, expenses and invoices for up to 50 transactions a month, with community support. No card required.",
  },
  {
    q: "What's included in Starter?",
    a: "Starter is MWK 50,000/month and is where selling from a product list begins: the point of sale with one till, products, warehouses and stock transfers, plus the chart of accounts, tax settings, fixed assets, capital and employee records. Up to 200 transactions a month.",
  },
  {
    q: "Which plan has the financial reports and payroll?",
    a: "Growth, at MWK 100,000/month. That is where the profit or loss, balance sheet, cash flow, trial balance, VAT return and withholding tax schedule live, along with pay runs, payslips and leave, budgets, the cash forecast and bank reconciliation. Starter lets you keep employee records; running the payroll itself starts on Growth.",
  },
  {
    q: "Which plan do I need for the point of sale?",
    a: "Starter. The till is part of Ledgr rather than a separate product, and it appears once your business is set up as retail. Starter gives you one till and lets a sale be split across up to two payment methods. Growth adds more tills, shift history, returns on receipts from earlier shifts and no limit on how many ways a sale is paid — plus branches, and therefore per-branch sales reporting. If you are unsure which plan suits how you trade, talk to us before you pay for anything.",
  },
  {
    q: "Do construction and manufacturing cost extra?",
    a: "They are part of Enterprise at MWK 500,000/month rather than add-ons. The construction workspace and the manufacturing workspace each switch on when you set your business up as that kind of operation, and stay hidden if you don't. Enterprise also includes approval workflows, custom branding and unlimited transactions.",
  },
  {
    q: "What counts as a transaction?",
    a: "Each sale at the till, income entry, expense, invoice or bill counts as one transaction. The counter resets every month and you can see your usage any time inside the app. A busy till gets through the allowance faster than a desk does, so pick your plan on how much you sell rather than how big the business feels.",
  },
  {
    q: "Is there a discount for paying yearly?",
    a: "Yes, and it isn't the same on every plan — so rather than print a figure here that might not be the one you're charged, the app shows you the exact yearly price for your plan at checkout, before you pay. The monthly prices on this page are the ones to compare on.",
  },
  {
    q: "How do I pay?",
    a: "Upgrades are processed securely through PayChangu — pay with mobile money (Airtel Money, Mpamba) or a bank card. No PayPal or dollar card needed.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrades apply immediately; downgrades take effect immediately with no charge. Your data and history are never affected by plan changes.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "It stays yours. Export everything to CSV/PDF before or after cancelling, and we keep a read-only copy available for 90 days.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <PageHero
        eyebrow="Pricing"
        title={
          <>
            Priced in Kwacha, <span className="text-brand-700">for Malawian businesses</span>
          </>
        }
        sub="Start free. Paid plans from MWK 50,000/month, paid with mobile money or card via PayChangu. Monthly or yearly — your yearly price is shown at checkout."
      />
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <PricingPlans />

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-soft">
          Upgrades are processed securely through <strong>PayChangu</strong> (mobile money
          &amp; card). Downgrades take effect immediately with no charge.
        </p>

        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-ink">
            Pricing questions
          </h2>
          <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
            {faqs.map((f) => (
              <div key={f.q} className="px-5 py-4">
                <p className="text-sm font-bold text-ink sm:text-base">{f.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            Still unsure?{" "}
            <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
              Talk to us
            </Link>{" "}
            — we&apos;ll help you pick the right plan.
          </p>
        </div>
      </section>
    </div>
  );
}
