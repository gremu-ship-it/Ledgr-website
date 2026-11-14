/**
 * Single source of truth for pricing. Previously the same four plans were
 * duplicated in `app/page.tsx` and `app/pricing/page.tsx`, which is exactly how
 * the plan copy and the homepage copy drift apart. Both pages now read from here.
 *
 * WHAT EACH PLAN CONTAINS is mirrored from the application's own plan map
 * (`Ledgr-react/src/lib/billing/plans.ts`), because that file is what actually
 * unlocks the modules — `PlanGate`/`PartnerPlanGate` in `App.tsx` and the
 * `requiresCapability` / `minPlan` entries in `navConfig.ts`. Keep the two in
 * step: if a capability moves tier in the app, the bullet moves here.
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

/**
 * Last checked against `Ledgr-react@7fb872d` (2026-11-12) — see
 * docs/PRODUCT-AUDIT-2026-11.md §2. Three things moved since September:
 *
 *  - Payroll is no longer on Free. Employee records need Starter
 *    (`core_accounting`), pay runs and leave need Growth
 *    (`accounting_organisation`).
 *  - The standalone financial reports, the VAT return and the WHT schedule
 *    are `minPlan: 'growth'`, not Starter.
 *  - The till is now gated: `/pos` is `minPlan: 'starter'` and only appears
 *    for a business whose operating models include Retail. A second register,
 *    shift history and returns across shifts are Growth.
 *
 * The bullets below follow the gates, not the app's own plan-card strings,
 * which still say "payroll" on Free and "Reports" on Starter.
 */
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
      "Point of sale with one till, for retail",
      "Products, warehouses & stock transfers",
      "Chart of accounts, tax, assets & capital",
      "Employee records",
      "Up to 200 transactions/month",
    ],
    cta: "Choose Starter",
    href: site.registerUrl,
    highlight: false,
  },
  {
    name: "Growth",
    monthly: 100_000,
    desc: "For businesses adding branches, people and proper month-end reporting.",
    features: [
      "Everything in Starter",
      "Financial reports, VAT return & WHT schedule",
      "Pay runs, payslips & leave",
      "Budgets, cash forecast & bank reconciliation",
      "Branches, departments & contacts",
      "More than one till, with shift history",
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
    desc: "For businesses that want answers from their figures, and integrations.",
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
    desc: "For contractors, manufacturers and larger operations that need controls and an SLA.",
    features: [
      "Everything in Pro",
      "Unlimited transactions",
      "Construction & manufacturing modules",
      "Approval workflows",
      "AI checks for unusual entries",
      "Custom branding",
      "Multi-user roles & permissions",
      "Dedicated account manager",
      "SLA & compliance support",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
  },
];
