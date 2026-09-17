/**
 * Single source of truth for pricing. Previously the same four plans were
 * duplicated in `app/page.tsx` and `app/pricing/page.tsx`, which is exactly how
 * the plan copy and the homepage copy drift apart. Both pages now read from here.
 */

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

/** Annual billing charges 10 months and gives you 12 — i.e. "2 months free". */
export const ANNUAL_MONTHS_CHARGED = 10;
export const ANNUAL_MONTHS_FREE = 12 - ANNUAL_MONTHS_CHARGED;
/** Whole-number percentage saved by paying yearly (2/12 ≈ 17%). */
export const ANNUAL_DISCOUNT_PERCENT = Math.round(
  (ANNUAL_MONTHS_FREE / 12) * 100,
);

export function annualTotal(monthly: number): number {
  return monthly * ANNUAL_MONTHS_CHARGED;
}

export function annualSaving(monthly: number): number {
  return monthly * ANNUAL_MONTHS_FREE;
}

export function monthlyEquivalent(annual: number): number {
  return Math.round(annual / 12);
}

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
      "Basic dashboard & reports",
      "Income & expense tracking",
      "Up to 50 transactions/month",
      "Community support",
    ],
    cta: "Get started free",
    href: "https://ledgr-react.vercel.app/register",
    highlight: false,
    free: true,
  },
  {
    name: "Growth",
    monthly: 100_000,
    desc: "For growing businesses ready to reconcile and report.",
    features: [
      "Everything in Free",
      "Bank reconciliation",
      "Accounting & Organisation (full access)",
      "Financial reports",
      "Up to 500 transactions/month",
      "Email support",
    ],
    cta: "Choose Growth",
    href: "https://ledgr-react.vercel.app/register",
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 200_000,
    desc: "For data-driven businesses that want AI and integrations.",
    features: [
      "Everything in Growth",
      "AI insights & forecasting",
      "Public API access",
      "Webhook integrations",
      "Up to 2,000 transactions/month",
      "Priority support",
    ],
    cta: "Choose Pro",
    href: "https://ledgr-react.vercel.app/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: 500_000,
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
