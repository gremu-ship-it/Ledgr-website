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
  /** MWK per month. 0 for the Free plan. */
  monthly: number;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  free?: boolean;
};

/**
 * ⚠ ANNUAL BILLING IS DELIBERATELY NOT PRICED ON THIS SITE.
 *
 * The site used to derive a yearly price as "10 months for 12" on every paid
 * plan. The application does not work that way: `computePriceMWK()` in
 * `Ledgr-react/src/lib/billing/plans.ts` applies a per-tier `annualDiscount`
 * — Starter 0%, Growth 20%, Pro 20%, Enterprise 25% — and the checkout modal
 * charges that. The two disagreed in both directions:
 *
 *   Starter     site 500,000   app   600,000
 *   Growth    site 1,000,000   app   960,000
 *   Pro       site 2,000,000   app 1,920,000
 *   Enterprise site 5,000,000  app 4,500,000
 *
 * Which model is right is a commercial decision, not a copy fix, so the yearly
 * figures were removed rather than reconciled: monthly prices (which both
 * sides agree on) are advertised, and the annual price is quoted at checkout
 * by the app itself. Once the model is settled, add the yearly view back here
 * and in `softwareSchema()`. See docs/PRODUCT-AUDIT-2026-09.md §6.1.
 */

/**
 * Deterministic thousands separators. `toLocaleString` output can differ
 * between the Node runtime and the browser, which causes React hydration
 * mismatches on price strings — so format it by hand.
 */
export function mwk(n: number): string {
  return `MWK ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const plans: Plan[] = [
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
