import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import PricingPlans from "@/components/PricingPlans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple MWK pricing: Free, Growth at MWK 100,000/month, Pro at MWK 200,000/month, Enterprise at MWK 500,000/month. Save two months by paying yearly. Secure PayChangu payments — mobile money or card.",
};

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
    q: "Is there a discount for paying yearly?",
    a: "Yes. Pay for 10 months and you get 12 — two months free, about 17% off the monthly price. Switch between monthly and yearly at the top of this page to see both prices in Kwacha.",
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
        sub="Start free. Upgrade as your transactions grow — monthly or yearly, paid with mobile money or card."
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
