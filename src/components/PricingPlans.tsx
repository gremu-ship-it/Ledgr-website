"use client";

import Link from "next/link";
import { demo } from "@/lib/site";
import { mwk, plans } from "@/lib/pricing";

/**
 * Shared pricing grid. Used by both the homepage and /pricing so the two can
 * never disagree.
 *
 * Monthly only, on purpose: the yearly prices this component used to compute
 * conflicted with what the application charges at checkout. See the note at
 * the top of `lib/pricing.ts`.
 */
export default function PricingPlans() {
  return (
    <div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

              <div className="mt-3 flex flex-wrap items-end gap-x-1.5 gap-y-1">
                <span className="text-2xl font-extrabold text-ink">
                  {p.free ? "Free" : mwk(p.monthly)}
                </span>
                <span className="mb-1 text-sm text-slate-500">
                  {p.free ? "free forever" : "per month"}
                </span>
              </div>

              <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-brand-700" aria-hidden>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* data-track/data-plan feed the analytics: which plan people
                  actually reach for, and which page they were on. */}
              {p.href.startsWith("/") ? (
                <Link
                  href={p.href}
                  className={ctaClass}
                  data-track={`plan-${p.name.toLowerCase().split(" ")[0]}`}
                  data-plan={p.name}
                >
                  {p.cta}
                </Link>
              ) : (
                <a
                  href={p.href}
                  className={ctaClass}
                  data-track={`plan-${p.name.toLowerCase().split(" ")[0]}`}
                  data-plan={p.name}
                >
                  {p.cta}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Where POS sits. Until November 2026 the application did not gate /pos
          on a plan, and this note said so. It does now: `navConfig.ts` marks
          /pos `minPlan: 'starter'` + `requiredOperatingModels: ['RETAIL']`,
          and /pos/shifts `minPlan: 'growth'`; `PosPage.tsx` caps Starter at one
          register and two tenders per sale. Keep this in step with those —
          see docs/PRODUCT-AUDIT-2026-11.md §2. */}
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-sm text-ink-soft">
        <p>
          <strong className="font-semibold text-ink">Where the till fits.</strong>{" "}
          The point of sale is part of Ledgr rather than a separate product. It
          starts on <strong className="font-semibold text-ink">Starter</strong>,
          for businesses set up as retail: one till, with a sale split across up
          to two payment methods.{" "}
          <strong className="font-semibold text-ink">Growth</strong> adds more
          tills, shift history, returns on receipts from earlier shifts, and
          branches with per-branch sales reporting.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-ink">
            Construction and manufacturing.
          </strong>{" "}
          Both are part of{" "}
          <strong className="font-semibold text-ink">Enterprise</strong>
          {" "}
          and switch on when you set your business up as one or the other. If
          that is not your line of work, you never see them.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-ink">Paying for a year.</strong>{" "}
          Annual billing is available when you subscribe, and the discount is not
          the same on every plan — so your exact yearly price is shown in the app
          at checkout, before you pay anything.
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
          — a sample business with realistic figures, no sign-up and nothing to
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
