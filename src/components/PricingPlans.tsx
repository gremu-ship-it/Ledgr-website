"use client";

import { useState } from "react";
import Link from "next/link";
import { demo } from "@/lib/site";
import {
  ANNUAL_DISCOUNT_PERCENT,
  ANNUAL_MONTHS_FREE,
  annualSaving,
  annualTotal,
  monthlyEquivalent,
  mwk,
  plans,
} from "@/lib/pricing";

/**
 * Shared pricing grid with a monthly / annual billing switch. Used by both the
 * homepage and /pricing so the two can never disagree.
 */
export default function PricingPlans() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Billing switch */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex rounded-2xl border border-slate-200 bg-slate-50/70 p-1"
        >
          {(
            [
              { label: "Monthly", value: false },
              { label: "Yearly", value: true },
            ] as const
          ).map((opt) => {
            const selected = annual === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setAnnual(opt.value)}
                aria-pressed={selected}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                {opt.label}
                {opt.value && (
                  <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">
                    −{ANNUAL_DISCOUNT_PERCENT}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs font-medium text-slate-500" aria-live="polite">
          {annual
            ? `Paying yearly gives you ${ANNUAL_MONTHS_FREE} months free — the same plan, ${ANNUAL_DISCOUNT_PERCENT}% cheaper.`
            : `Pay yearly and get ${ANNUAL_MONTHS_FREE} months free.`}
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {plans.map((p) => {
          const ctaClass = `mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
            p.highlight
              ? "bg-brand-700 text-white hover:bg-brand-800"
              : "border border-slate-200 text-ink hover:border-brand-300 hover:text-brand-700"
          }`;

          // Free never changes with billing period.
          const showAnnual = annual && !p.free;
          const total = annualTotal(p.monthly);
          const saving = annualSaving(p.monthly);

          return (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 ring-1 ring-brand-500"
                  : "border-slate-100 bg-white shadow-sm"
              }`}
            >
              {p.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              ) : p.name === "Starter" ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-ink">
                  New
                </span>
              ) : null}

              <h3 className="text-lg font-bold text-ink">{p.name}</h3>

              <div className="mt-3 flex flex-wrap items-end gap-x-1.5 gap-y-1">
                <span className="text-2xl font-extrabold text-ink">
                  {p.free ? "Free" : showAnnual ? mwk(total) : mwk(p.monthly)}
                </span>
                <span className="mb-1 text-sm text-slate-500">
                  {p.free ? "free forever" : showAnnual ? "per year" : "per month"}
                </span>
                {showAnnual && (
                  <span className="mb-1 w-full text-xs text-slate-400">
                    <s>{mwk(p.monthly * 12)}</s> if paid monthly
                  </span>
                )}
              </div>

              {showAnnual && (
                <p className="mt-1 text-xs font-semibold text-brand-700">
                  ≈ {mwk(monthlyEquivalent(total))}/month · you save {mwk(saving)} a
                  year
                </p>
              )}

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
