# Ledgr marketing site — product accuracy audit, November 2026

**Audit date:** 2026-11-14
**Marketing repo:** `gremu-ship-it/Ledgr-website` @ `main` (332607d)
**Application repo:** `gremu-ship-it/Ledgr-react` @ `main` (7fb872d, 2026-11-12 — the commit
Vercel reports as the current production deployment of `ledgr-react`)
**Previous audit:** [`PRODUCT-AUDIT-2026-09.md`](./PRODUCT-AUDIT-2026-09.md), against app `4d9aa63`

Purpose: bring the landing page, and the shared copy it renders, back in line with
the application after the 391 commits (219 non-merge) between the two audits. As
before, every claim was checked against application **source** — the navigation
config, the route gates and the page components — not against the app's
documentation or its own plan-card strings. Where those disagree with each other
the disagreement is recorded in §5 rather than quietly resolved.

The demo was not only read but run: a production build of `7fb872d` was opened in
a headless browser through `/demo/enter` and walked page by page. §4 is what that
showed.

---

## 1. What changed in the application

| Area | What was added | Where it is gated |
| --- | --- | --- |
| Construction | Project workspace: BOQ, valuations, payment certificates, retention register, change orders, subcontractors, purchase orders / goods received / bill matching, RFIs, ITPs, NCRs, HSE incidents, toolbox talks, schedule, project P&L | `construction` capability — **Enterprise**, and only for a business whose operating models include Construction |
| Manufacturing | Dashboard, bills of materials, MRP workbench, work orders, production runs with output and scrap, routings, work centres | `manufacturing` capability — **Enterprise**, operating model Manufacturing |
| Approval workflows | Multi-step, in-order approvals for purchase orders and journal entries | `approval_workflows` — **Enterprise** |
| Budgets | Budget by account for a period; budget vs actual with variance | `minPlan: 'growth'` |
| Cash forecast | Rolling monthly projection from receivables, payables and payroll, with saved scenarios | `minPlan: 'growth'` |
| Payroll | Employee management UI; pay runs (calculate → approve → post, payslips, pension, weekly / fortnightly / monthly); leave requests | Employees **Starter** (`core_accounting`); pay runs and leave **Growth** (`accounting_organisation`) |
| Reports | Standalone trial balance, P&L, balance sheet, cash flow, changes in equity, revenue breakdown, branch performance — with CSV and print export; VAT return and WHT schedule | `minPlan: 'growth'` |
| POS | Named registers, shift history and reconciliation, held orders, returns with restock, manager approval queue | `/pos` and `/pos/registers` **Starter** + Retail operating model; `/pos/shifts`, a second register, more than two tenders per sale and returns on earlier shifts' receipts **Growth** |
| Dashboard | "Executive health" strip — cash in the bank, receivable, payable, next payroll commitment; tax-payment-due reminder with a link to the MRA portal | all plans |
| Operating models | Retail, Wholesale / distribution, Product sales, Service sales, Project-based work, Grant-funded, Construction, Manufacturing — chosen when a business is created and editable in Settings. Modules for other lines of work are hidden, not locked | n/a |
| AI | The assistant (chat grounded in the business's own figures) stays on Pro. The diagnostics page — duplicate expenses, outliers, missing tax tags, payroll variance — shows an "Enterprise feature" gate below Enterprise | `ai_insights` Pro; diagnostics Enterprise (`AiInsightsPage.tsx`) |
| Data import | CSV templates exposed for chart of accounts, contacts, products, opening balances, trial balance, invoices, bills, fixed assets, inventory opening, bank transactions, employees; rows validated before import | no plan gate on `/import` |

Prices, transaction limits and annual discounts in `src/lib/billing/plans.ts` are
**unchanged**, so no price on the site moved and annual prices stay off the site
for the reason given in the September audit §6.1.

---

## 2. Claims on the site that had become wrong — fixed

| # | The site said | The application does | Fixed in |
| --- | --- | --- | --- |
| 1 | Free includes payroll | Employee records need Starter, pay runs need Growth | `lib/pricing.ts`, `lib/faqs.ts`, `pricing/page.tsx`, `features/page.tsx` |
| 2 | Financial reports start on Starter | Every standalone report, the VAT return and the WHT schedule are `minPlan: 'growth'` | same four files |
| 3 | "The application does not gate the till on a plan" | `/pos` is Starter-and-up and Retail-only; one register and two tenders on Starter | `PricingPlans.tsx` "Where the till fits", `pricing/page.tsx`, `lib/faqs.ts`, homepage pricing intro |
| 4 | "You can … turn on the till later" (unqualified) | The till appears when Retail is one of the business's operating models | `lib/faqs.ts` |
| 5 | "AI insights — Pro plan" | Only the assistant is Pro; the diagnostics are Enterprise | `lib/pricing.ts`, `features/page.tsx`, homepage |
| 6 | The demo is "the full app … with an open till shift you can sell from", with "stock, invoices, payroll, VAT and the reports" | See §4 — the demo has no till, and stock crashes | hero, `ProductTour.tsx`, `PricingPlans.tsx`, `customers/page.tsx`, `lib/faqs.ts`, `DEMO.md` |
| 7 | Outreach template: "Pay yearly and you get two months free", "Pro … once you have staff on payroll" | Starter has no annual discount; payroll is Growth | `lib/marketing.ts` (`pricing-help`) |

---

## 3. What the site was missing — added

**Landing page (`src/app/(site)/page.tsx`)**

- New **"Recently added"** section (`#new`, between Features and the USP band):
  eight cards, each labelled with the plan it starts on — Construction,
  Manufacturing, Budgets & cash forecast, Pay runs & leave, Tills / shifts /
  returns, Ledgr AI assistant, Approval workflows, Data import. The array
  (`recentlyAdded`) carries a note to prune it at the next audit.
- `featureGroups`: "Receipts" folded into **Payments & receipts** to make room for
  **Returns & refunds**; "Branch performance" and "Sales analytics" merged to make
  room for **Budgets & cash forecast**; Payroll, Business dashboard, Financial
  reports and Filing dates rewritten to describe what those screens do now.
- Hero and tour **dashboard illustration** (`public/images/dashboard-web.svg`)
  redrawn to the current layout: the executive-health strip, period figures,
  income-vs-expenses line chart and upcoming tax dates. It is still an
  illustration with invented figures, and its `alt` text says what it shows.
- "How it works" step 2 now mentions operating models and CSV import.
- Pricing intro names what each paid tier is for.

**Shared copy**

- `lib/pricing.ts` — plan bullets rewritten to follow the gates (§1).
- `lib/faqs.ts` — three new questions (construction / manufacturing, payroll,
  importing records), four corrected answers. These also feed the FAQPage
  JSON-LD.
- `ProductTour.tsx` — dashboard and POS bullets updated; segment note mentions
  builders and manufacturers.
- `lib/site.ts` — "Manufacturers" added to `businessSegments` (homepage pills and
  the lead form's dropdown).

**Other pages touched because they repeat the same claims**

- `/features` — new "Beyond the counter" group; plan labels on the cards that
  moved tier; "Which plan has what" rewritten.
- `/pricing` — two new questions (reports & payroll; construction &
  manufacturing), three corrected.
- `/customers` — new "If you build or make things" pair of cards.

No `data-track` id was added, renamed or removed. No price changed. No
testimonial, customer count, logo or certification claim was added.

---

## 4. The live demo — tested, and it has regressed

Production build of `Ledgr-react@7fb872d`, entered through `/demo/enter?ref=audit`.

| Page | Result |
| --- | --- |
| `/dashboard` | ✅ Lands here as "Lilongwe Trading Ltd", Pro tier. Executive health, net profit, VAT accrued, chart all populated. Tax reminder modal appears |
| `/invoices`, `/income` | ✅ 18 invoices |
| `/payroll/employees` | ✅ 3 employees |
| `/reports/revenue-breakdown`, `/reports/changes-in-equity` | ✅ populated |
| `/pos` | ❌ No sidebar link; redirects to `/income`. The demo business row has no `operating_models`, and the till now requires `RETAIL` |
| `/products`, `/warehouse`, `/transfers` | ❌ **Crash** — "Something went wrong" (React error #185, maximum update depth). `src/hooks/useInventoryPageLabels.ts` selects `operating_models ?? []`, which is a new array every render when the field is undefined |
| `/reports/profit-loss`, `/trial-balance`, `/balance-sheet`, `/cash-flow` | ⚠️ Render, but empty — the demo client's `rpc()` does not emulate `get_trial_balance` |
| `/reports/vat-return` | ⚠️ Renders with 0.00 |
| `/payroll/pay-runs` | ⚠️ 0 runs |
| `/ai` | ⚠️ Enterprise upgrade gate (expected on a Pro demo tenant) |

One crash also poisons the session: after `/products` fails, the page-level error
boundary keeps showing "Something went wrong" on every route visited afterwards
until a full reload.

**What the site does about it:** every demo blurb now promises only what was seen
working — a sample business with six months of invoices, income, expenses and
staff behind the dashboard. Nothing on the site says the demo has a till, stock
or the financial reports.

**What the app needs** (not something this repo can fix):

1. Give the demo business `operating_models: ['RETAIL']` (and seed a register and
   an open shift) so the till is back in the demo.
2. Make the selector in `useInventoryPageLabels` return a stable empty array.
3. Emulate `get_trial_balance` in `src/lib/demo/client.ts` so the statements have
   figures, and seed at least one posted pay run.

When those land, restore the till and stock to the demo copy — `grep -rn "demo.link(" src`
finds every blurb.

---

## 5. Open flags — recorded, not resolved

| # | Flag | Why it is left open |
| --- | --- | --- |
| 1 | The app's own plan cards (`PLANS[tier].features`) still say "income, expenses, invoices & payroll" on Free and "Accounts, Tax, Assets, Capital & Reports" on Starter, while its gates put payroll on Starter/Growth and reports on Growth | The site follows the gates, because that is what a customer actually gets. The app's plan strings should be corrected, or the gates relaxed — a product decision |
| 2 | POS still defaults VAT to **16.5%** (`PosSettingsModal.tsx`, `PosRepository.ts`, `usePosPermissions.ts`) while `src/lib/vat.ts` and the rest of the app use 17.5% | Carried over from September. The site says 17.5% throughout |
| 3 | "Multi-user roles & permissions" is listed as an Enterprise bullet (mirrored from the app), yet cashier / manager roles work at the till on lower plans | Carried over; the bullet was left as the app words it |
| 4 | `/pricing` FAQ: "we keep a read-only copy available for 90 days" after cancelling | Not verified in app source in either audit. Confirm or remove |
| 5 | Bank statement import is CSV only | The site says "CSV"; do not write "any bank export" |
| 6 | Pay run reversal shows "not available yet"; TEVET has a due date but no levy calculation; payroll runs in the functional currency only | The site claims none of these |
| 7 | Only `en.json` grew for the new modules | The site does not claim the new modules are translated |
| 8 | Not looked for, so still unsupported: quotes, automatic reminders to late payers, aged receivables, e-invoicing, store-credit vouchers | Do not add without checking source |

---

## 6. How to repeat this audit

```bash
git clone https://github.com/gremu-ship-it/Ledgr-react.git && cd Ledgr-react
git log --no-merges --oneline 7fb872d..HEAD        # what changed since this audit
```

The files that decide what the site may say:

- `src/lib/billing/plans.ts` — prices, limits, capabilities per tier
- `src/components/layout/navConfig.ts` — `minPlan`, `requiresCapability`,
  `requiredOperatingModels` per screen
- `src/App.tsx` — the route gates (`PlanGate`, `PartnerPlanGate`, `CapabilityGate`)
- `src/pages/PosPage.tsx` — per-plan limits inside the till
- `src/lib/capabilities/profile.ts` — operating models
- `src/lib/demo/` — what the demo seeds and which RPCs it emulates

Then run the demo rather than reading about it: `npm ci && npx vite build &&
npx vite preview`, open `/demo/enter`, and visit each screen the site mentions.
