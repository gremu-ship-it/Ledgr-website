import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple MWK pricing: Free Starter, Business at MWK 15,000/month, Pro at MWK 35,000/month. No dollar subscriptions, cancel anytime.",
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    sub: "forever",
    desc: "For trying Ledgr and running a side hustle.",
    features: ["1 business", "Income & expense tracking", "Basic reports", "Offline mode"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Business",
    price: "MWK 15,000",
    sub: "per month",
    desc: "For growing businesses that invoice and employ.",
    features: [
      "Up to 3 businesses",
      "Invoices & PDF export",
      "Full MRA tax suite (VAT, PAYE, WHT, TEVETA)",
      "Payroll & inventory",
      "All financial reports",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Pro",
    price: "MWK 35,000",
    sub: "per month",
    desc: "For accountants and multi-branch operations.",
    features: [
      "Unlimited businesses",
      "Multi-user access",
      "AI insights (coming soon)",
      "Airtel Money / Mpamba (coming soon)",
      "Priority support",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes — Starter is free forever, not a trial. Income and expense tracking, basic reports and offline mode for one business, no card required.",
  },
  {
    q: "How do I pay?",
    a: "Pay by bank transfer or mobile money. Airtel Money and Mpamba in-app payments are coming soon.",
  },
  {
    q: "Can I change plans later?",
    a: "Anytime. Upgrades apply immediately; downgrades apply at the end of your billing month. Your data is never locked.",
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
            Priced in Kwacha, <span className="text-brand-600">for Malawian businesses</span>
          </>
        }
        sub="Start free. Upgrade only when you grow. No expensive dollar subscriptions."
      />
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 ring-1 ring-brand-500"
                  : "border-slate-100 bg-white shadow-sm"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-ink">{p.name}</h2>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-3xl font-extrabold text-ink">{p.price}</span>
                <span className="mb-1 text-sm text-slate-400">{p.sub}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="text-brand-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={site.registerUrl}
                className={`mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "border border-slate-200 text-ink hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
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
            <a href="/contact" className="font-semibold text-brand-600 hover:underline">
              Talk to us
            </a>{" "}
            — we&apos;ll help you pick the right plan.
          </p>
        </div>
      </section>
    </div>
  );
}
