import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple MWK pricing: Free, Growth at MWK 100,000/month, Pro at MWK 200,000/month, Enterprise at MWK 500,000/month. Transaction-based plans, secure PayChangu payments.",
};

const plans = [
  {
    name: "Free",
    price: "Free",
    sub: "50 transactions/mo",
    desc: "For trying Ledgr and running a side hustle.",
    features: [
      "Basic dashboard & reports",
      "Income & expense tracking",
      "Up to 50 transactions/month",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "https://ledgr-react.vercel.app/register",
    highlight: false,
  },
  {
    name: "Growth",
    price: "MWK 100,000",
    sub: "per month",
    desc: "For growing businesses ready to reconcile and report.",
    features: [
      "Everything in Free",
      "Bank reconciliation",
      "Accounting & Organisation (full access)",
      "Basic financial reports",
      "Up to 500 transactions/month",
      "Email support",
    ],
    cta: "Upgrade to Growth",
    href: "https://ledgr-react.vercel.app/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "MWK 200,000",
    sub: "per month",
    desc: "For data-driven businesses that want AI and integrations.",
    features: [
      "Everything in Growth",
      "AI Insights & forecasting",
      "Public API access",
      "Webhook integrations",
      "Up to 2,000 transactions/month",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "https://ledgr-react.vercel.app/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "MWK 500,000",
    sub: "per month",
    desc: "For multi-branch operations and compliance-heavy teams.",
    features: [
      "Everything in Pro",
      "Unlimited transactions",
      "Custom branding",
      "Multi-user roles & permissions",
      "Dedicated account manager",
      "SLA & compliance support",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes — Free includes a basic dashboard and reports plus income and expense tracking for up to 50 transactions a month, with community support. No card required.",
  },
  {
    q: "What counts as a transaction?",
    a: "Each income, expense, invoice or bill you record counts as one transaction. The counter resets every month, and you can see your usage any time inside the app.",
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
        sub="Start free. Upgrade as your transactions grow — pay securely with mobile money or card."
      />
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const ctaClass = `mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
              p.highlight
                ? "bg-brand-700 text-white hover:bg-brand-800"
                : "border border-slate-200 text-ink hover:border-brand-300 hover:text-brand-700"
            }`;
            return (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  p.highlight
                    ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 ring-1 ring-brand-500"
                    : "border-slate-100 bg-white shadow-sm"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h2 className="text-lg font-bold text-ink">{p.name}</h2>
                <div className="mt-3 flex items-end gap-1.5">
                  <span className="text-2xl font-extrabold text-ink">{p.price}</span>
                  <span className="mb-1 text-sm text-slate-500">{p.sub}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="text-brand-700">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {p.href.startsWith("/") ? (
                  <Link href={p.href} className={ctaClass}>
                    {p.cta}
                  </Link>
                ) : (
                  <a href={p.href} className={ctaClass}>
                    {p.cta}
                  </a>
                )}
              </div>
            );
          })}
        </div>

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
