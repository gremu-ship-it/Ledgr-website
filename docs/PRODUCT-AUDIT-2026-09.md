# Ledgr marketing site — product accuracy audit

**Audit date:** 2026-09-27
**Marketing repo:** `gremu-ship-it/Ledgr-website` @ `main` (9d8ffa0)
**Application repo:** `gremu-ship-it/Ledgr-react` @ `main` (4d9aa63, 2026-09-27)

Purpose: check every public claim on the marketing site against what the
application actually implements, and reposition the site now that POS is part
of the product. Everything below was verified by reading the application
source, not its documentation. Where the two disagree, the discrepancy is
recorded rather than quietly resolved.

---

## 1. Current landing-page structure (before changes)

`src/app/(site)/page.tsx`, top to bottom:

| # | Section | Component / source |
| --- | --- | --- |
| 1 | Hero — "Smart accounting for Malawian businesses" | inline + `BrowserMockup` |
| 2 | Numeric trust strip — `17.5% / 100% / 4 / MWK` | inline |
| 3 | Product tour — 3 tabs (Dashboard, Phone & offline, Invoices & VAT) | `ProductTour` |
| 4 | Who it's for — 6 business-type pills | inside `ProductTour` |
| 5 | Features — 6 cards | inline `features[]` |
| 6 | USP band — "Why Malawian SMEs choose Ledgr" | inline `usps[]` |
| 7 | How it works — 3 steps | inline `steps[]` |
| 8 | VAT & PAYE calculator | `TaxCalculator` |
| 9 | Pricing — 5 plans + billing switch | `PricingPlans` ← `lib/pricing.ts` |
| 10 | FAQ — 7 questions | `Faq` ← `lib/faqs.ts` |
| 11 | Contact band | `ContactStrip` |
| 12 | Final CTA / install band + lead form | inline + `WaitlistForm` |

Other routes: `/features`, `/pricing`, `/customers`, `/faq`, `/about`,
`/contact`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`, `/unsubscribe`, plus
the private `/admin` area. Chrome: `Navbar`, `Footer`, `StickyCta`,
`ConsentBanner`, analytics.

**Structural findings**

- POS appeared **nowhere** on the site — zero occurrences of "POS", "point of
  sale", "till" or "cashier" in `src/`.
- The whole site was framed as accounting ("Smart accounting for Malawian
  businesses" in the H1, `<title>`, OG title, OG image, manifest, footer strapline
  and `site.tagline`).
- Feature lists were flat topic lists, not organised around what a business does.

## 2. Outdated / unsupported product claims

Verified against the application source. Nothing here is a judgement call about
wording — each is a claim with no implementation behind it.

| Claim | Where | Evidence in app | Verdict |
| --- | --- | --- | --- |
| "Professional invoices **& quotes**" (Starter) | `lib/pricing.ts`, `/pricing` FAQ | No quote/quotation entity, route, repository or status anywhere in `Ledgr-react` | **Unsupported — removed** |
| "Automatic reminders chase late payers politely" | `/features` | Invoices have an `overdue` status *filter* only. The only reminders implemented are MRA tax due dates (`TaxReminderModal`) and subscription renewal (`useRenewalReminder`) | **Unsupported — removed** |
| "snap receipts" | `/features` | No attachment/upload/OCR path on `ExpensesPage` or `ExpenseRepository` | **Unsupported — removed** |
| "Sequential invoice numbers, **certificates** …" | `/features` | "Certificate" appears once, as the description text of chart-of-accounts code 1136 (*WHT Receivable*). No certificate is produced | **Unsupported — removed** |
| "Real P&L **per project**" | `/customers` | No project dimension. The app has branches and departments | **Unsupported — replaced with branch/department** |
| "…the **TEVETA** levy — **calculated for you**" | `/features`, `/`, `ProductTour`, `lib/faqs.ts` | `getMraDueDates()` emits a **TEVET Levy** due date (1 April, annual). There is no TEVETA/TEVET *calculation*, and no `tpr`/levy tax code. Tax codes implemented: `vat_standard`, `vat_zero`, `vat_exempt`, `wht_10/15/20`, `paye`, `tpr_pension` | **Overclaim — reworded to "due-date reminder", spelling corrected to TEVET** |
| "Works across the SADC region — Zambia, Zimbabwe, Tanzania and **Kenya**" | `lib/faqs.ts` | `PRIMARY_CURRENCIES = MWK, ZMW, TZS, MZN, USD, EUR, GBP, ZAR`. No KES, no ZWL. (Kenya is also not in SADC.) | **Wrong — corrected to the currencies actually supported** |
| "**180+** businesses getting started" | `/about` | No source. Nothing in either repo supports a customer count | **Removed** |
| "Join **hundreds** of Malawian businesses…" | `CtaBand` default (appears on 4 pages) | Same | **Removed** |
| "**MRA-compliant** accounting" | `public/manifest.webmanifest` | Explicitly removed from the rest of the site by the 2026-09-18 conversion audit; the manifest was missed | **Removed (consistency fix)** |
| "100% works offline" | homepage strip, `/about` | Offline covers capture + queued sync, not every module | **Removed — replaced with plain-language offline copy** |
| Free plan includes "basic dashboard **& reports**" | `lib/pricing.ts`, `lib/faqs.ts`, `/pricing` FAQ | Reports sit behind the `core_accounting` capability → **Starter and above** | **Corrected** |
| Invoicing starts at Starter | `lib/pricing.ts` | App's Free plan: *"Finance: income, expenses, invoices & payroll"* | **Corrected** |

## 3. Current functionality the site was missing

Implemented in the app, previously invisible on the site:

- **POS / till** (`/pos`, `PosPage.tsx`, 852 lines + 14 components + 5 services
  + `PosRepository`): see §4.
- **Multi-branch**: `BranchesPage`, branch-scoped POS, `BranchPerformanceReport`
  in Reports, branch filter in POS analytics.
- **Branch performance report** and **revenue breakdown report** — the site only
  mentioned P&L / Balance Sheet / Cash Flow / Trial Balance.
- **Cash Flow Statement (IFRS)**, **Statement of Changes in Equity**.
- **Stock transfers and warehouses** (`/transfers`, `/warehouse`) — the site said
  only "inventory & stock".
- **Multi-currency** with exchange rates (8 currencies) — the site claimed SADC
  coverage but never said what that means.
- **Departments**, **audit log**, **period locking**, **data import**,
  **API keys / Zapier**, **AI insights** (Pro), **bank reconciliation** (Growth).
- **Role-based access**: a cashier signs in and lands on `/pos` and can reach
  almost nothing else (`usePermissions.isPathAllowedForRole`).

## 4. POS-related gaps (what the app really does)

All confirmed in source. Category **1 = implemented in the application** unless
stated.

| Capability | Evidence | Status |
| --- | --- | --- |
| Till screen with product catalogue, category filter, search | `PosProductCatalog.tsx` | 1 |
| Barcode scan-to-cart (scanner keyboard input) + search by name/SKU/barcode | `PosProductCatalog.tsx` | 1 |
| Barcode label / shelf-tag printing | `PosBarcodeLabelGenerator.tsx`, `lib/pos/barcodeGenerator.ts` | 1 |
| Cart: quantities, line discount, order discount, notes | `PosCart.tsx`, `posService.ts` | 1 |
| Park / recall a sale, keyboard shortcuts (F4 pay, F8 park) | `PosPage.tsx` | 1 |
| Payment methods: cash, Airtel Money, TNM Mpamba, bank transfer, card, credit sale | `types/pos.ts`, `PosPaymentModal.tsx` | 1 |
| Split tender + change due | `PosPaymentModal.tsx` | 1 |
| Walk-in or named customer; create a customer at the till | `PosCart.tsx`, `posService.ts` | 1 |
| Receipt on screen, browser print, **ESC/POS thermal print over Bluetooth + cash-drawer pulse** | `PosReceiptModal.tsx`, `lib/pos/escpos.ts` | 1 |
| Receipt **sharing by WhatsApp/email** | — | **Not implemented — not claimed** |
| Shifts: open with float, cash in/out, close with counted cash + variance | `PosShiftModal.tsx`, `PosCashMovementModal.tsx` | 1 |
| Z-report: gross, discounts, net, tax, refunds, drawer expected vs counted, variance, payment mix, transaction count | `PosZReportModal.tsx`, `posReportService.ts` | 1 |
| Sales history with search | `PosSalesHistoryModal.tsx` | 1 |
| Refunds / returns (part or whole sale) | `processReturn`, `posCorrectionRpc` | 1 |
| Voids with reason | `processVoid`, `posCorrectionRpc` | 1 |
| Manager approval for over-cap discount / void / refund, server-minted tokens | `PosManagerApprovalModal.tsx`, `posPriceOverrideRpc.ts`, migration `…r07_correction_commands.sql` | 1 |
| Owner analytics: revenue, transactions, average sale, discounts, returns, by cashier, by branch, today/7d/30d | `PosOwnerAnalytics.tsx` | 1 |
| Branch-scoped till; assigned branch locks the selector | `PosPage.tsx` | 1 |
| Stock deducted by the sale; server is the stock authority; unknown-stock banner rather than a silent zero | `PosStockStatusBanner.tsx`, migration `…ic_pos_stock_availability.sql`, `…r06_stock_balance_authority.sql` | 1 |
| Sale posts invoice + lines + tenders + ledger + stock release in **one** transaction | `post_pos_sale` RPC (migration `20260923000000`), `posSaleRpc.ts` | 1 |
| Offline sale capture → queued in the shared offline queue → auto-sync | `posService.processSale`, `offline/queueApi`, `offline/syncEngine` | 1 |
| POS roles/permissions (26 permissions, 14 roles; cashier home = `/pos`) | `types/pos.ts`, `usePosPermissions.ts`, `usePermissions.ts` | 1 |
| POS settings: enabled payment methods, discount caps, receipt template, approval rules | `PosSettingsModal.tsx` | 1 |
| POS in the public demo (seeded open shift, cashier, branches, products) | `lib/demo/dataset.ts`, `DEMO_PLAN_TIER = 'pro'` | 1 |
| Server-side **refund/void** RPCs described in `docs/database/pos-sale-posting-rpc.md` as "not built" | superseded by the R07 correction commands migration — but the doc still says stage 3 (narrowing cashier ledger policies) is **not** done | **2 — implemented, production state not verifiable from the repo** |

**Deliberately not turned into marketing copy:** `post_pos_sale`, RPC/atomicity,
idempotency keys, quarantined legacy queue, override tokens, RLS. These are
implementation details. The site states the user-facing consequence instead —
a sale reaches stock, the drawer and the books as one record.

## 5. CTA / terminology inconsistencies

- **"Talk to a human"** existed in two places: the `/contact` page `<h1>`
  ("Talk to a **human**") and a `ContactStrip` doc comment. Meanwhile
  `CtaBand` and the mobile nav already said "Talk to us" → the site said two
  different things for one action. **Fixed: "Talk to us" everywhere.**
- Primary CTA label varied across the site: "Get Started Free", "Get Started",
  "Try Ledgr — no sign-up", "Try it yourself free", "Create your free account",
  "Try the live demo". **Standardised on "Try Ledgr" (primary) / "Talk to us"
  (secondary).** `data-track` attribute values are unchanged so analytics
  history stays comparable.
- Contact was labelled "Contact" in the desktop nav and footer but "Talk to us"
  in CTAs. **Aligned to "Talk to us"; the `/contact` URL is unchanged.**
- The product tour had three CTAs stacked in one row (demo, register, features).
  **Reduced to two.**

## 6. Pricing inconsistencies

Monthly prices **match** the application exactly and were left alone:

| Plan | Site | App (`lib/billing/plans.ts`) |
| --- | --- | --- |
| Free | 0 | 0 |
| Starter | MWK 50,000 | 50,000 |
| Growth | MWK 100,000 | 100,000 |
| Pro | MWK 200,000 | 200,000 |
| Enterprise | MWK 500,000 | 500,000 |

Two real discrepancies:

1. **Annual discount — NOT FIXED, needs a pricing decision.**
   The site charges 10 months for 12 (≈17% off) on *every* paid plan.
   The app's `computePriceMWK()` applies `annualDiscount` per tier:
   Starter **0%**, Growth **20%**, Pro **20%**, Enterprise **25%**.

   | Plan | Site yearly | App yearly | Difference |
   | --- | --- | --- | --- |
   | Starter | 500,000 | 600,000 | site is **100,000 cheaper** |
   | Growth | 1,000,000 | 960,000 | site is 40,000 dearer |
   | Pro | 2,000,000 | 1,920,000 | site is 80,000 dearer |
   | Enterprise | 5,000,000 | 4,500,000 | site is 500,000 dearer |

   The app also notes `computeAmount` in
   `supabase/functions/initiate-subscription-payment` must stay in sync, so the
   checkout price is the app's. A visitor who picks yearly Starter on the site
   would be charged 20% more at checkout. **Flagged, not changed** — the brief
   says pricing only changes when the repo shows pricing changed, and this is a
   commercial decision, not a copy fix.

2. **Plan contents were wrong** — corrected, because the app's `PLANS` array is
   unambiguous about which capability each tier unlocks:
   - Free: dashboard, income, expenses, **invoices**, payroll, 50 txn/month.
     (Site previously promised *reports* on Free and withheld *invoices*.)
   - Starter: + inventory (products, warehouses, transfers) + core accounting
     (chart of accounts, tax, assets, capital, **reports**), 200 txn.
   - Growth: + bank reconciliation + journals, periods, audit log, contacts,
     **branches**, departments, 500 txn.
   - Pro: + AI insights, API, webhooks, 2,000 txn.
   - Enterprise: + custom branding, unlimited txn, roles, SLA.
   - Site previously implied multi-branch was Enterprise; branches unlock at
     **Growth** (`navConfig.ts: minPlan: 'growth'`).

3. **Which plan includes POS — FLAGGED, stated cautiously on the site.**
   `/pos` carries **no** `PlanGate`, no `requiresCapability` and no `minPlan`
   in `App.tsx` or `navConfig.ts`, so on the current code POS is reachable on
   every tier including Free. But there is no `pos` capability either, so
   nothing *guarantees* it. And POS sells products, while the Products /
   Inventory pages are gated at Starter — so on Free there is no supported way
   to build a catalogue. POS sales also consume the plan's monthly transaction
   allowance (`_ledgr_assert_usage_limit` inside `post_pos_sale`).
   The site therefore says POS is part of Ledgr and that selling from a product
   catalogue needs Starter or above, and does **not** print "POS included" on
   any plan card. **A product decision is needed on whether POS should be a
   priced capability.**

## 7. Tax / compliance inconsistencies

**Consistent (no change needed):**

- VAT 17.5% — site `TaxCalculator` and copy vs app `VAT_STANDARD_RATE = 0.175`
  (`lib/vat.ts`, verified 2026-08-16 as the rate effective January 2026). ✔
- PAYE bands — the site's monthly bands (0 / 170,000 / 1,570,000 / 10,000,000 at
  0/30/35/40%) are exactly the app's seeded annual 2026/27 bands ÷ 12
  (`20260816000000_phase9_paye_reference_data.sql`). Spot check: MWK 500,000/month
  → MWK 99,000 PAYE on both. ✔
- WHT 10/15/20% — site vs app tax codes. ✔
- Due dates: PAYE & WHT 14th, VAT 25th, TEVET Levy 1 April — `useTaxData.ts`. ✔

**⚠ DISCREPANCY TO RESOLVE IN THE APPLICATION (not changed here):**

The POS module still carries the **old 16.5% VAT rate** in two user-visible
places, while the rest of the app uses the centralised 17.5%:

- `src/services/posReportService.ts:117` — the exported Z-report text prints
  `Tax / VAT (16.5%):` as a hard-coded label.
- `src/components/pos/PosSettingsModal.tsx:217` — helper text under the default
  tax rate field: *"Standard Malawi MRA VAT (typically 16.5% or 0%)"*.

(Also `src/services/__tests__/posService.test.ts` and `posIntegration.test.ts`
use `tax_rate: 16.5` as fixture data, which is fine in itself but means no test
would catch the labels above.)

These are **application** issues; this repo was not the right place to fix them
and the brief says not to pick a winner silently. The marketing site states
17.5%, matching `lib/vat.ts`, the invoice pipeline and the statutory rate.
**Recommendation: raise a ticket on `Ledgr-react` to derive both strings from
`VAT_STANDARD_RATE_PERCENT`.**

## 8. SEO issues

| Issue | Fix |
| --- | --- |
| `<title>` / description / OG / OG image / manifest / footer all said "Smart accounting…" — no POS, sales, stock or business-management term anywhere | Rewritten around "Run your business. Know your numbers." with accounting **and** POS/stock/sales terms |
| No Twitter/X card metadata | `twitter: { card: "summary_large_image", … }` added |
| No canonical URL | `alternates.canonical` added on the root layout and per page via `metadataBase` |
| `SoftwareApplication` schema described accounting only; `Organization` schema unused anywhere | Description updated to include POS/stock; `organizationSchema()` now actually rendered on the homepage |
| Single H1 per page ✔ but the homepage jumped H1 → H3 inside the tour | Tour panel headings are `h3` under a section `h2` — hierarchy kept H1 → H2 → H3 |
| Image alt text present but accounting-only | New POS/stock images carry descriptive alt text |
| `keywords` list had no POS/business-management terms | Updated (kept short — no stuffing) |
| Sitemap/robots correct, no dead internal links found | No change needed |

Production URL is unchanged: `https://ledgr.mw` (`NEXT_PUBLIC_SITE_URL`,
`site.siteUrl`), app links still derive from `NEXT_PUBLIC_APP_URL`
(default `https://ledgr-react.vercel.app`).

## 9. Technical issues found while crawling

- **Fixed:** `public/manifest.webmanifest` still claimed "MRA-compliant"
  (removed everywhere else in the 2026-09-18 audit).
- **Fixed:** duplicated `businessTypes` list — `lib/site.ts` (contact form) and
  `ProductTour.tsx` (pills) held different, drifting lists.
- **Fixed:** the numeric strip presented decoration as evidence ("4 financial
  reports built-in", "100% works offline").
- **Fixed:** `/customers` promised "Real P&L per project" — no such dimension.
- **Checked, no action:** every internal `href` resolves to a real route or a
  real anchor (`#tour`, `#features`, `#how`, `#calculator`, `#pricing`, `#faq`,
  `#download`, `#top`); no `#` placeholders; socials render only when
  configured; mobile nav is keyboard-reachable with `aria-expanded`; tour tabs
  implement the tablist keyboard pattern; lint, typecheck and build were green
  before and after.
- **Fixed:** `WaitlistForm.tsx` hard-coded `https://ledgr-react.vercel.app/register`
  instead of `site.registerUrl`, so it would have been missed by an app-domain
  move. It now uses the same constant as everything else.
- **Fixed (blog, `lib/posts.ts`):** the four SEO guides are educational and stay
  as they are, but three product claims inside them were wrong and had to go:
  - *"Ledgr tracks [WHT + PAYE + TEVETA + pension] … with due-date reminders
    before every deadline"* — the TEVET levy is **not** calculated anywhere.
  - *"Payroll picks up the TEVETA levy alongside PAYE"* — it does not.
  - *"sends polite automatic reminders … one ageing screen"* — there is no
    invoice reminder and no aged-receivables report, only an `overdue` filter.
  - *"e-invoicing"* in the VAT post's excerpt described content the post does
    not contain and a feature Ledgr does not have.
  The replacement copy sticks to what exists: PAYE and pension on payroll, WHT
  at 10/15/20% per line, `wht_exempt` on a contact, part-payments, the overdue
  filter, and the TEVET date as a *reminder*.
- **Verified, claim kept:** bank reconciliation is real
  (`src/components/bank/BankReconciliation.tsx`, route `/bank-reconcile`, gated
  on the `bank_reconciliation` capability = Growth+), as are AI insights, API
  keys, API docs, Zapier, period management, journals and the audit log — each
  has a page and a plan gate. Multi-currency invoicing with a settlement
  exchange rate is real too (`InvoicesPage.tsx` + `ExchangeRateRepository`),
  which is what `/customers` claims for consultants.
- **Verified, claim kept:** the demo really is six months of trading history
  (`lib/demo/dataset.ts`) and really does reset after 24 hours
  (`DEMO_RESET_LABEL`), which is what the FAQ now says.
- **Fixed:** the hero's second button changed destination (product tour →
  `/contact`) so its analytics label moved `hero-tour` → `hero-contact`; keeping
  the old name would have merged two different intents in the funnel report.
  `hero-demo`, `pricing-demo` and the `plan-*` labels are untouched.
- **Fixed (a11y):** the mobile menu button now has `aria-controls` pointing at
  the menu panel's new `id`, to go with the `aria-expanded` it already had.
- **Not changed (out of scope):** admin dashboard, analytics, consent banner,
  forms, privacy/terms.

## 10. Recommended changes (implemented unless marked)

1. Reposition around **"Run your business. Know your numbers."** Keep finance at
   the centre; stop calling Ledgr an accounting app in the H1, title, OG, manifest
   and footer.
2. Make the **operational → financial chain** the spine of the homepage:
   Sell → Stock → Payments → Accounting → Reports, with a plain-language
   "what happens when a cashier rings up a sale" section.
3. Rebuild the **product tour** as Dashboard → POS → Stock → Invoices & VAT →
   Mobile & offline, with a POS screen mockup in the existing visual language.
4. Reorganise **features** into Sell / Manage / Understand / Stay compliant,
   deleting the four unsupported claims in §2.
5. Rewrite **customer segments** so POS reads as "useful if you sell face to
   face", not "Ledgr is now a shop product".
6. Correct **plan contents** to the app's capability map; leave prices alone;
   flag the annual-discount mismatch (§6.1) and the POS-plan question (§6.3).
7. Correct **tax copy**: TEVET is a reminder, not a calculation; drop
   Kenya/Zimbabwe; keep 17.5% and the PAYE bands as they are.
8. Standardise CTAs on **Try Ledgr / Talk to us**; remove "Talk to a human".
9. **SEO**: new title/description/OG/Twitter/canonical/schema; add POS terms.
10. Remove every unverifiable number ("180+", "hundreds of businesses",
    "100%") and add no testimonials.

**Left for product/production verification (not done here):**

- The annual-billing discount mismatch (§6.1) — commercial decision.
- Whether POS should be plan-gated, and on which tier (§6.3).
- The 16.5% VAT strings inside the app's POS module (§7) — app repo fix.
- Whether the POS server-side posting path (`post_pos_sale`) and the R07
  correction commands are deployed to the production Supabase project. The
  client falls back to the older path when the RPC is absent, so the repo alone
  cannot prove production state. Nothing on the site depends on it.
- Any customer evidence: no testimonials, logos, counts, awards or
  certifications were added, because none can be verified from either repo.
