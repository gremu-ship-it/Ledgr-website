# Ledgr marketing site — product accuracy re-audit

**Audit date:** 2026-11-16
**Marketing repo:** `gremu-ship-it/Ledgr-website` (this branch)
**Application repo:** `gremu-ship-it/Ledgr-react` @ `7fb872d` (2026-11-12, `main`)
**Supersedes:** the tier and feature statements in
[`PRODUCT-AUDIT-2026-09.md`](./PRODUCT-AUDIT-2026-09.md) §3, §6 and §7. That
document's method and its removals still stand.

Purpose: the September audit described the app as it was then. Since then the
application added pay runs and leave, budgets, depreciation runs, a cash
forecast, FX revaluation, VAT and WHT schedules, data import, approval
workflows, a partner portal, construction and manufacturing workspaces, and an
enterprise AI module — and it moved several features between plan tiers. This
pass re-reads the application source and brings the landing page, `/features`,
`/pricing`, `/customers`, the product tour, the FAQ and the structured data back
in line with it. As before: claims are checked against the application's source,
not its documentation, and nothing is added that the app does not do.

---

## 1. What the homepage now says (and didn't before)

| Section | Change |
| --- | --- |
| Hero | Unchanged hook ("Run your business. Know your numbers.") — still accurate. |
| Flow strip, product tour, "one sale" | Kept; the tour gained a **Payroll & reports** tab. |
| Features | Tier badges on the cards that start above Free, so a reader no longer has to cross-reference the pricing table. |
| **New: "Beyond the counter"** | The six parts of the product that were invisible on the site: several businesses, multi-currency, roles, imports, API/webhooks/Zapier, construction & manufacturing. |
| Pricing | Copy and plan bullets corrected (see §2). No prices changed. |
| FAQ | Replaced/added 8 answers (payroll tier, reports tier, budgets, construction/manufacturing, AI, imports, languages) and corrected 2 (free plan, MRA taxes). |
| Metadata / schema | `description`, OG, Twitter and `SoftwareApplication` now name payroll, budgets, reconciliation, VAT/WHT returns and the AI assistant. |

## 2. Plan/tier statements that were wrong

Checked against `src/lib/billing/plans.ts`, `navConfig.ts`, `PlanGate` /
`PartnerPlanGate` / `CapabilityGate` usage in `App.tsx`, and each feature's own
gate. The site had drifted in three places, all of which understated what a paid
plan costs you *or* promised something the app refuses:

| Claim on the site | Application | Fix |
| --- | --- | --- |
| "Free covers … payroll" (FAQ, `/pricing` FAQ, plan card, `/features`) | Every payroll route is `PartnerPlanGate capability="core_accounting"`; `core_accounting` starts at **Starter**. Employees additionally carry `minPlan: 'starter'`. | Payroll moved to **Starter** everywhere; Free now lists dashboard, income, expenses, invoices. |
| "Financial reports start on Starter" (plan card, `/features`, FAQ) | All nine report routes gate on `accounting_organisation` → **Growth**. Starter keeps chart of accounts, tax, assets, capital. | Reports moved to **Growth**; Starter's card lists the modules it actually unlocks. |
| "AI insights … Pro plan" (`/features`) | The assistant's Ledgr AI tab is `ai_insights` (**Pro+**); the `/ai` page ("AI Financial Intelligence", anomaly diagnostics, runway) renders `EnterpriseUpgradeGate` for **everything below Enterprise**. | Split honestly: assistant = Pro, intelligence/forecasting = Enterprise. |
| POS "not gated on a plan" (component comment, PricingPlans) | `/pos` is `minPlan="starter"` + `OperatingModelGate RETAIL` + `CapabilityGate pos`. | POS stated as Starter, retail-profile only. |
| Branches "Growth" ✓ | Correct — kept. But departments, locations, contacts, journals, periods and the audit log are also Growth and had never been said. | Listed. |
| — | Budgets vs actuals, depreciation runs, cash forecast, FX revaluation: all **Growth**, none on the site. | Added. |
| — | VAT return and WHT schedule reports: **Growth**, never mentioned. | Added. |
| — | Construction and manufacturing: **Enterprise**, profile-gated, invisible on the site. | Added on the homepage, `/features` and `/customers`. |
| — | Data import (chart of accounts, contacts, products, opening balances, QuickBooks/Xero mappings), approval workflows, multi-business, multi-currency, roles, partner portal: unimplemented-on-site. | Added where they earn their place. |

**Not claimed anywhere**, deliberately, even though code exists: the partner
portal/white-label admin (`/partner-admin`, `partnerDomain.ts`) is a
distribution channel, not a customer feature, and the public API is described
only in the app's own terms. No customer counts, testimonials, certifications or
"MRA-compliant" wording were added — the 2026-09 rule still holds.

## 3. Pricing

Monthly prices **unchanged and still exact** against `PLANS`:

| Plan | Site | App |
| --- | --- | --- |
| Free | 0 | 0 |
| Starter | 50,000 | 50,000 |
| Growth | 100,000 | 100,000 |
| Pro | 200,000 | 200,000 |
| Enterprise | 500,000 | 500,000 |

Annual billing is **still not priced on the site** (`lib/pricing.ts` §"Annual
billing is deliberately not priced"): the app applies per-tier discounts —
Starter 0%, Growth 20%, Pro 20%, Enterprise 25% — so the yearly figure the site
used to derive contradicted checkout in both directions. That remains a
commercial decision, not a copy fix. `/pricing` says the exact yearly price is
shown at checkout, which is true whatever the model becomes.

**Still open, from September:** choose the annual model, then restore a yearly
view in `lib/pricing.ts`, `PricingPlans.tsx` and `softwareSchema()`.

## 4. Things the app does that the site still should not claim

- **Invoice reminders / aged receivables.** Unchanged: an `overdue` filter
  exists, nothing sends a reminder. The FAQ's wording ("who has not paid") was
  checked and is accurate.
- **TEVET levy calculation.** Still a due-date reminder only.
- **e-invoicing / MRA certification.** Nothing in the app produces an MRA
  submission or a certificate.
- **Receipt photo capture, quotes.** Still absent.
- **"Works offline" everywhere.** Offline covers capture and a queue that syncs;
  it does not make every report available without a connection. Copy keeps
  saying that plainly.

## 5. Verification

- `npm run typecheck` and `npm run lint` were run after the edits (see the PR).
- `npm run build` was exercised in a sandbox without a database; pages render
  without `DATABASE_URL`, as before.
- Every internal link added resolves to an existing route (`/features`,
  `/pricing`, `/customers`, `/contact`, `/#calculator`, `/#tour`).
- Analytics `data-track` values were **not** renamed: the funnel history for
  `hero-*`, `pricing-demo` and `plan-*` stays comparable. New links carry no
  invented ids.
- Tier statements were read from `App.tsx` route gates, `navConfig.ts`,
  `lib/billing/plans.ts` and the gate components inside each page — not from
  `README.md` or the app's own marketing copy, which drift too.
