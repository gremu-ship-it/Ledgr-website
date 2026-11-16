/**
 * Single source of truth for pricing. Previously the same four plans were
 * duplicated in `app/page.tsx` and `app/pricing/page.tsx`, which is exactly how
 * the plan copy and the homepage copy drift apart. Both pages now read from here.
 *
 * WHAT EACH PLAN CONTAINS is mirrored from the application's own plan map
 * (`Ledgr-react/src/lib/billing/plans.ts`, re-read 2026-11-16), because that file
 * is what actually unlocks the modules: `PlanGate` / `PartnerPlanGate` /
 * `CapabilityGate` in `App.tsx`, the `requiresCapability` / `minPlan` entries in
 * `navConfig.ts`, and the capability each feature's own gate names. Keep the two
 * in step — if a capability moves tier in the app, the bullet moves here.
 *
 * What changed in this pass (application @ Ledgr-react 7fb872d, 2026-11-12):
 *
 *   - **Payroll is no longer on Free.** Every payroll route sits behind
 *     `PartnerPlanGate capability="core_accounting"` (`core_accounting` starts
 *     on Starter), and employee management additionally carries
 *     `minPlan: 'starter'`. The site had been promising payroll on Free since
 *     the 2026-09 audit; the app never allowed it.
 *   - **The financial reports are Growth, not Starter.** `TrialBalanceRoute`,
 *     `ProfitLossRoute`, `BalanceSheetRoute`, `CashFlowRoute`,
 *     `ChangesInEquityRoute`, `RevenueBreakdownRoute`, `BranchPerformanceRoute`,
 *     `VatReturnRoute`, `WhtScheduleRoute` all gate on
 *     `accounting_organisation`, which the app only grants from Growth. Starter
 *     keeps the modules that feed them — chart of accounts, tax codes, assets,
 *     capital — but not the statements.
 *   - **Budgets & actuals, depreciation runs, cash forecast and FX revaluation
 *     are Growth** (`minPlan: 'growth'` / `accounting_organisation`).
 *   - **AI Financial Intelligence (`/ai`) is Enterprise, not Pro.** The page
 *     renders `EnterpriseUpgradeGate` for every other tier. The assistant
 *     drawer's Ledgr AI tab is still gated on the `ai_insights` capability
 *     (Pro+); the *diagnostics and forecasting* module is Enterprise.
 *   - **Construction and Manufacturing are Enterprise modules**, gated on the
 *     business profile as well as the plan.
 */

import { site } from "@/lib/site";

export type Plan = {
  name: string;
  /** MWK per month on monthly billing. 0 for the Free plan. */
  monthly: number;
  /** MWK per month over a year when billed annually (20% off). 0 for Free. */
  monthlyAnnual: number;
  /** MWK charged once a year on annual billing. 0 for Free. */
  yearly: number;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  free?: boolean;
};

/**
 * ANNUAL BILLING: 20% OFF, ON EVERY PAID PLAN.
 *
 * The open question from the 2026-09 audit (§6.1) is settled: a year is
 * 12 months less 20%, on Starter, Growth, Pro and Enterprise alike. That is
 * what this file advertises, what `PricingPlans` shows on the billing switch,
 * and what `softwareSchema()` publishes as an annual Offer.
 *
 * ⚠ THE APPLICATION DOES NOT CHARGE THIS YET. `computePriceMWK()` in
 * `Ledgr-react/src/lib/billing/plans.ts` still holds a per-tier
 * `annualDiscount` — Starter 0%, Growth 20%, Pro 20%, Enterprise 25% — and
 * `ANNUAL_DISCOUNT_PCT` in the `initiate-subscription-payment` edge function
 * (which is the amount PayChangu actually collects) repeats exactly that map.
 * Until those two are 20/20/20/20 the yearly figures here are **targets, not
 * quotations**:
 *
 *   Plan        Year at 20%   App charges today   Difference
 *   Starter        480,000            600,000     site is 120,000 lower
 *   Growth         960,000            960,000     agree
 *   Pro          1,920,000          1,920,000     agree
 *   Enterprise   4,800,000          4,500,000     site is 300,000 higher
 *
 * So the site does not print a yearly total anywhere yet. `billingSwitchLive`
 * below is the single flag that turns the yearly column on once the app is
 * updated; pricing every plan in `plans` means flipping it is a one-line
 * change, and the numbers are already correct for the settled model.
 * See docs/PRODUCT-AUDIT-2026-11.md §3.
 */

/** The settled commercial model, in one place. */
export const ANNUAL_DISCOUNT_PCT = 20;

/**
 * False until the app's `PLANS[*].annualDiscount` and the
 * `initiate-subscription-payment` edge function both apply 20% to every paid
 * tier. While false, the site says "20% off when you pay yearly" (true of the
 * model, and the checkout is where the amount is confirmed) but prints no
 * yearly total and publishes no annual `Offer`.
 */
export const billingSwitchLive = false;

/** 12 months at the annual discount. Kept deterministic (no toLocaleString). */
function yearlyAtDiscount(monthly: number): number {
  if (monthly === 0) return 0;
  return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT_PCT / 100));
}

/**
 * Deterministic thousands separators. `toLocaleString` output can differ
 * between the Node runtime and the browser, which causes React hydration
 * mismatches on price strings — so format it by hand.
 */
export function mwk(n: number): string {
  return `MWK ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * The plans as a human edits them: monthly price and copy only. Annual figures
 * are derived below from `ANNUAL_DISCOUNT_PCT`, so the two views of a plan can
 * never disagree with the discount they claim.
 */
type PlanInput = Omit<Plan, "monthlyAnnual" | "yearly">;

const planInputs: PlanInput[] = [
  {
    name: "Free",
    monthly: 0,
    desc: "For trying Ledgr and running a side hustle.",
    features: [
      "Dashboard in Kwacha",
      "Income, expenses & invoices",
      "Up to 50 transactions/month",
      "Community support",
    ],
    cta: "Try Ledgr",
    href: site.registerUrl,
    highlight: false,
    free: true,
  },
  {
    name: "Starter",
    monthly: 50_000,
    desc: "For shops and small businesses selling from a product list.",
    features: [
      "Everything in Free",
      "Products, warehouses & stock transfers",
      "Point of sale with shifts and Z-reports",
      "Chart of accounts, tax, assets & capital",
      "Payroll: employees, payslips & PAYE",
      "Up to 200 transactions/month",
    ],
    cta: "Choose Starter",
    href: site.registerUrl,
    highlight: false,
  },
  {
    name: "Growth",
    monthly: 100_000,
    desc: "For businesses adding branches, people and reconciliation.",
    features: [
      "Everything in Starter",
      "Financial reports: P&L, balance sheet, cash flow",
      "Branches, departments, contacts & locations",
      "Bank reconciliation & cash deposits",
      "Budgets, depreciation & FX revaluation",
      "Journals, period locking & audit log",
      "Up to 500 transactions/month",
      "Email support",
    ],
    cta: "Choose Growth",
    href: site.registerUrl,
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 200_000,
    desc: "For businesses that want insight and integrations.",
    features: [
      "Everything in Growth",
      "Ledgr AI assistant on your own books",
      "Public API access",
      "Webhook integrations",
      "Up to 2,000 transactions/month",
      "Priority support",
    ],
    cta: "Choose Pro",
    href: site.registerUrl,
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: 500_000,
    desc: "For larger operations that need branding, roles and an SLA.",
    features: [
      "Everything in Pro",
      "Unlimited transactions",
      "AI Financial Intelligence & anomaly checks",
      "Construction & manufacturing workspaces",
      "Custom branding on invoices & receipts",
      "Multi-user roles, approval workflows & permissions",
      "Dedicated account manager",
      "SLA & compliance support",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
  },
];

export const plans: Plan[] = planInputs.map((plan) => {
  const yearly = yearlyAtDiscount(plan.monthly);
  return {
    ...plan,
    yearly,
    // Per-month equivalent of the yearly price, rounded — used for the
    // "MWK 40,000/month billed yearly" line, never as a charged amount.
    monthlyAnnual: yearly === 0 ? 0 : Math.round(yearly / 12),
  };
});

/**
 * The few tier facts that appear in prose elsewhere on the site, so copy can
 * say "Branches are Growth and above" without hard-coding the word twice in
 * two places and drifting. Keys are what the sentence needs, not the app's
 * internal capability names.
 */
export const planTiers = {
  payroll: "Starter",
  reports: "Growth",
  branches: "Growth",
  bankReconciliation: "Growth",
  aiAssistant: "Pro",
  aiIntelligence: "Enterprise",
  construction: "Enterprise",
  manufacturing: "Enterprise",
  customBranding: "Enterprise",
} as const;

/** `plans` entries keyed by name, for prose that quotes a price. */
export function planNamed(name: string): Plan | undefined {
  return plans.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
