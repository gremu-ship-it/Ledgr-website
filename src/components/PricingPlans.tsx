"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { demo } from "@/lib/site";
import {
  ANNUAL_DISCOUNT_PCT,
  billingSwitchLive,
  mwk,
  plans,
  type Plan,
} from "@/lib/pricing";

type Cycle = "monthly" | "annual";

/**
 * Shared pricing grid. Used by both the homepage and /pricing so the two can
 * never disagree.
 *
 * THE BILLING SWITCH follows `billingSwitchLive` in `lib/pricing.ts`. The model
 * is settled — 20% off when you pay for a year, on every paid plan — but the
 * application still charges a per-tier discount, so while the flag is false the
 * grid shows monthly prices only and says the yearly amount is confirmed at
 * checkout. Flip the flag once `PLANS[*].annualDiscount` and the
 * `initiate-subscription-payment` edge function both say 20%: the switch, the
 * yearly column, the saving line and the annual `Offer` in `softwareSchema()`
 * all come on together, with no other editing.
 */
export default function PricingPlans() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const switchId = useId();
  const showSwitch = billingSwitchLive;
  const annual = showSwitch && cycle === "annual";

  return (
    <div>
      {showSwitch && (
        <div className="mt-8 flex flex-col items-center">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1"
            role="group"
            aria-label="Billing period"
          >
            {(
              [
                { id: "monthly", label: "Monthly" },
                {
                  id: "annual",
                  label: `Yearly · save ${ANNUAL_DISCOUNT_PCT}%`,
                },
              ] as const
            ).map((option) => {
              const selected = cycle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  id={`${switchId}-${option.id}`}
                  aria-pressed={selected}
                  onClick={() => setCycle(option.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500" aria-live="polite">
            {annual
              ? `A year of Ledgr, paid once — ${ANNUAL_DISCOUNT_PCT}% less than twelve monthly payments.`
              : `Switch to yearly at any time and save ${ANNUAL_DISCOUNT_PCT}%.`}
          </p>
        </div>
      )}

      <div
        className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${
          showSwitch ? "mt-6" : "mt-8"
        }`}
      >
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

              <h3 className="text-lg font-bold text-ink">{p.name}</h3>

              <Price plan={p} annual={annual} />

              <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="text-brand-700">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* data-track/data-plan feed the analytics: which plan people
                  actually reach for, and which page they were on. `cycle` rides
                  along in analytics.ts as a prop, so the yearly intent is
                  measurable without changing any existing id. */}
              {p.href.startsWith("/") ? (
                <Link
                  href={p.href}
                  className={ctaClass}
                  data-track={`plan-${p.name.toLowerCase().split(" ")[0]}`}
                  data-plan={p.name}
                  data-cycle={annual ? "annual" : undefined}
                >
                  {p.cta}
                </Link>
              ) : (
                <a
                  href={p.href}
                  className={ctaClass}
                  data-track={`plan-${p.name.toLowerCase().split(" ")[0]}`}
                  data-plan={p.name}
                  data-cycle={annual ? "annual" : undefined}
                >
                  {p.cta}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Where POS sits. Stated carefully on purpose: the till route itself is
          gated `minPlan: 'starter'` and only appears for a business whose
          profile includes the retail operating model, and it needs the Products
          & stock modules to sell anything — which are also Starter. See
          docs/PRODUCT-AUDIT-2026-11.md §3. */}
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-sm text-ink-soft">
        <p>
          <strong className="font-semibold text-ink">Where the till fits.</strong>{" "}
          The point of sale is part of Ledgr rather than a separate product. It
          starts on <strong className="font-semibold text-ink">Starter</strong>,
          alongside the product list and stock it sells from. Branches, per-branch
          sales reporting and the financial reports start on{" "}
          <strong className="font-semibold text-ink">Growth</strong>. The till only
          appears in accounts whose business profile includes retail — a
          consultancy or a contractor invoices instead and never sees it.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-ink">Paying for a year.</strong>{" "}
          Yearly billing is {ANNUAL_DISCOUNT_PCT}% off on every paid plan —{" "}
          {plans
            .filter((p) => !p.free)
            .map((p) => p.name)
            .join(", ")}{" "}
          alike, so the only question is how much you use, not which discount you
          qualify for. Start monthly and switch whenever you like.
        </p>
        <p className="mt-2">
          Every sale, invoice, expense and bill counts as one transaction against
          your monthly allowance — a busy till uses them faster than a desk does,
          so size the plan on how much you sell, not how big the business feels.
        </p>
      </div>

      {/* Pre-purchase escape hatch: look around before committing to a plan. */}
      {demo.available && (
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-ink-soft">
          Not ready to pick a plan?{" "}
          <a
            href={demo.link("pricing")}
            data-track="pricing-demo"
            className="font-semibold text-brand-700 hover:underline"
          >
            Open the live demo
          </a>{" "}
          — a full sample business with realistic figures, no sign-up and nothing to
          pay.{" "}
          {demo.tourUrl && (
            <>
              Prefer to just look?{" "}
              <a
                href={demo.tourUrl}
                className="font-semibold text-brand-700 hover:underline"
              >
                See the 1-minute tour
              </a>
              .
            </>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * The price block. On monthly billing it is the monthly price; on yearly it is
 * the amount actually charged once, with the monthly equivalent underneath so a
 * reader can still compare plans like for like.
 */
function Price({ plan, annual }: { plan: Plan; annual: boolean }) {
  if (plan.free) {
    return (
      <div className="mt-3 flex flex-wrap items-end gap-x-1.5 gap-y-1">
        <span className="text-2xl font-extrabold text-ink">Free</span>
        <span className="mb-1 text-sm text-slate-500">free forever</span>
      </div>
    );
  }

  if (annual) {
    return (
      <div className="mt-3">
        <div className="flex flex-wrap items-end gap-x-1.5 gap-y-1">
          <span className="text-2xl font-extrabold text-ink">
            {mwk(plan.yearly)}
          </span>
          <span className="mb-1 text-sm text-slate-500">per year</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {mwk(plan.monthlyAnnual)}/month equivalent ·{" "}
          <span className="font-semibold text-brand-700">
            save {mwk(plan.monthly * 12 - plan.yearly)}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-end gap-x-1.5 gap-y-1">
        <span className="text-2xl font-extrabold text-ink">
          {mwk(plan.monthly)}
        </span>
        <span className="mb-1 text-sm text-slate-500">per month</span>
      </div>
      {billingSwitchLive && (
        <p className="mt-1 text-xs text-slate-500">
          or {mwk(plan.yearly)} a year — save{" "}
          {ANNUAL_DISCOUNT_PCT}%
        </p>
      )}
    </div>
  );
}
