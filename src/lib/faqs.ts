import { ANNUAL_DISCOUNT_PCT, billingSwitchLive, mwk, plans } from "@/lib/pricing";

export type FaqItem = { q: string; a: string };

/**
 * Single source of truth for the FAQ. Lives in a plain module (not the client
 * component) because a value exported from a "use client" file arrives in a
 * server component as a client reference, not the real array — which broke the
 * FAQPage structured data. Both the accordion and the JSON-LD read from here.
 *
 * Rule for this file: every answer must be true of the application as it is
 * today. Nothing here describes a roadmap item, and nothing claims a
 * certification. Plan/tier statements are checked against the app's gates
 * (`Ledgr-react/src/App.tsx`, `lib/billing/plans.ts`, `navConfig.ts`) on
 * 2026-11-16 — see docs/PRODUCT-AUDIT-2026-09.md and
 * docs/PRODUCT-AUDIT-2026-11.md.
 */
export const faqs: FaqItem[] = [
  {
    q: "Does Ledgr have a point of sale?",
    a: "Yes. Ledgr includes a till. Build a sale by scanning a barcode or searching your product list, apply a discount within the limit you've set, and take cash, Airtel Money, TNM Mpamba, bank transfer, card or credit — split across more than one method if the customer needs to. Print the receipt from the browser or straight to a Bluetooth thermal printer. Shifts open with a float, record cash in and out, and close against the counted drawer with a Z-report showing the variance. The till is available from the Starter plan, and it switches on for businesses whose profile is set up as retail.",
  },
  {
    q: "Can my cashier use Ledgr?",
    a: "Yes, and only the part of it you want them in. Ledgr has roles: a cashier signs in and lands on the till, where they can sell, take payment and open and close their own shift. They don't get your reports, expenses or ledger. Discounts above the cashier limit, refunds and voids can be set to need a manager's approval, and every one of them is recorded against the person who approved it.",
  },
  {
    q: "Does a sale at the till update my stock?",
    a: "Yes. The sale takes the items off the branch or warehouse that sold them, so each shop's stock reflects what that shop actually sold. The movement appears alongside your transfers and goods received in the same history. If Ledgr can't read the stock position for a branch it tells the cashier rather than quietly showing zero.",
  },
  {
    q: "Can I track sales by branch?",
    a: "Yes. The till is tied to a branch, and the POS analytics break sales down by branch, by cashier and by day — with average sale value, discounts given and returns taken. Reports also includes a branch performance report so you can compare shops rather than guess. Branches, and the branch reports, are part of the Growth plan and above.",
  },
  {
    q: "Does Ledgr run payroll?",
    a: "Yes, from Starter upwards. You keep an employee list, run a pay run, and Ledgr works out PAYE on the MRA bands and pension at the statutory rates, with a printable payslip per employee. Pay runs and leave requests are on Growth and above. The Employee list, tax configuration and payslips are on Starter.",
  },
  {
    q: "Which plan do I need for the financial reports?",
    a: "Growth. Profit or loss, the balance sheet, cash flow, changes in equity, trial balance, revenue breakdown, branch performance and the VAT and withholding-tax schedules are all on Growth and above. Starter gives you the records those reports are built from — chart of accounts, tax codes, assets and capital — but not the statements themselves. The dashboard, income, expenses and invoices are on every plan.",
  },
  {
    q: "Can I budget and compare against actuals?",
    a: "Yes, on Growth and above. Build a budget by account and period, then open it as a budget-versus-actual report to see where you planned to spend and where you actually did. The same tier also has depreciation runs for fixed assets, a cash-flow forecast, and FX revaluation for foreign-currency balances.",
  },
  {
    q: "Can I see my business when I'm not there?",
    a: "Yes. Ledgr runs in a browser, so you can sign in from your phone at home or from another branch and see today's sales, stock and profit without phoning anyone. It's the same account and the same numbers your team is working in.",
  },
  {
    q: "Can I use Ledgr without the POS?",
    a: "Yes. The till is one part of Ledgr, not the whole of it. Plenty of businesses never open it and use Ledgr for invoicing, expenses, payroll, tax and reports. You can also start with the books and turn on the till later, when you need it.",
  },
  {
    q: "Is Ledgr suitable for service businesses?",
    a: "Yes. If you bill rather than sell over a counter — a consultant, a contractor, a lodge, a repair business — you invoice from Ledgr, record payments and expenses against it, and get the same dashboard, tax tools and financial reports. The POS side simply stays out of your way.",
  },
  {
    q: "Does Ledgr handle construction or manufacturing?",
    a: "It does, on Enterprise, and only when the business profile is set up for it. A construction business gets a project workspace with procurement, subcontractors, payment certificates and retention, RFIs, change orders, inspection and test plans, non-conformance reports, HSE incidents, toolbox talks and a project schedule — plus sites and site stores in place of branches and warehouses. A manufacturer gets bills of materials, MRP, production runs, routings and work centres. A business that also retails keeps the till alongside them. If you run neither, those workspaces never appear in your account.",
  },
  {
    q: "What does the AI actually do?",
    a: "There are two things, and they sit on different plans. On Pro and above, the Ledgr AI assistant answers questions about your own books — what you spent, what you're owed, how the month compares, what's coming — and it can still work from a built-in rules engine if the language model is unavailable. On Enterprise, AI Financial Intelligence scans the ledger for duplicates, untagged tax, unusual amounts and payroll swings, and produces runway and forecasting summaries. Neither one is an accountant: the numbers come from your books, and the wording is a starting point for a decision.",
  },
  {
    q: "Can I import my books from another system?",
    a: "Yes. Ledgr imports CSV files for your chart of accounts, contacts, products and services, and opening balances, using column mappings that already understand QuickBooks and Xero exports. You can preview every row, see validation errors before anything is written, and download a template if you'd rather start clean. Onboarding help is free if you'd like us to do the first import with you.",
  },
  {
    q: "What happens when the internet goes down?",
    a: "You keep trading. Sales and entries are stored on the device and queue up, then sync by themselves the moment the connection returns — nothing is lost and nothing is entered twice. What you can't do offline is see figures you hadn't already loaded, so stock levels and reports catch up once you're back online.",
  },
  {
    q: "Is Ledgr really free?",
    a: "There is a free plan, and it is genuinely free. It covers the dashboard, income, expenses and invoices for up to 50 transactions a month, with community support. Starter at MWK 50,000/month adds products and stock, the till, the accounting modules, payroll and 200 transactions. Growth at MWK 100,000/month adds the financial reports, branches, bank reconciliation, budgets, journals and the audit log. Pro at MWK 200,000/month adds the AI assistant, the API and webhooks. Enterprise adds AI Financial Intelligence, construction and manufacturing, custom branding and approval workflows.",
  },
  {
    q: "Is there a discount for paying yearly?",
    a: yearlyAnswer(),
  },
  {
    q: "Can I try Ledgr without creating an account?",
    a: "Yes. The live demo opens the full app on a sample Malawian business with months of books, a product list and an open till shift you can sell from. There is no sign-up, no password and no card, and nothing is sent to a server: the sample data is generated in your own browser and resets after 24 hours. If you'd rather just look, there's a one-minute read-only tour. When you're ready for your own numbers, create a free account — the demo data is deliberately not carried over.",
  },
  {
    q: "Does Ledgr handle Malawi VAT and the other MRA taxes?",
    a: "Ledgr is built around the Malawi Revenue Authority's rules — it is not a certification. VAT is split at the standard 17.5% on sales and purchases, with zero-rated and exempt items handled per line. PAYE is calculated on the MRA bands for the fiscal year, and withholding tax at 10%, 15% or 20% is applied where it belongs. You can produce a VAT return and a WHT schedule from your own books, and Ledgr shows you the filing dates with the days left: PAYE and WHT on the 14th, VAT on the 25th, and the TEVET levy on 1 April. You don't need to be VAT-registered to use Ledgr — if you're not, leave VAT switched off.",
  },
  {
    q: "What languages does Ledgr speak?",
    a: "English and Chichewa are translated throughout, and Swahili, French and Portuguese are available in the language menu. Numbers, dates and Kwacha amounts follow the language you pick. Where a phrase hasn't been translated yet it falls back to readable English rather than showing a raw key.",
  },
  {
    q: "Is my financial data safe?",
    a: "Your data is encrypted in transit and stored in the cloud, with a copy cached on your own device so the app keeps working offline. Only you and the people you invite to your business can see your books, and what each of them can see depends on the role you give them. Every business's records are isolated at the database level, not just hidden in the interface, and there is an audit log of who changed what.",
  },
  {
    q: "Can I use Ledgr outside Malawi?",
    a: "Ledgr is Kwacha-first and its tax tools are Malawi's. You can record transactions in other currencies — Zambian kwacha, Tanzanian shilling, Mozambican metical, rand, US dollars, euro and pounds — with exchange rates applied to your books and FX revaluation on Growth, so cross-border trade works. But if your business files its taxes somewhere other than Malawi, Ledgr won't do that part for you.",
  },
];

/**
 * One billing answer, shared by the homepage FAQ (and its JSON-LD) and the
 * /pricing FAQ, so the two can never state two different discounts.
 *
 * `billingSwitchLive` decides how specific it can be: while the application
 * still charges a per-tier discount, the honest answer is the model plus "the
 * amount is confirmed at checkout". Once the switch is on, the answer prints
 * the actual yearly totals, which are derived from `ANNUAL_DISCOUNT_PCT` in
 * `lib/pricing.ts`.
 */
export function yearlyAnswer(): string {
  const paid = plans.filter((p) => !p.free);
  const names = paid.map((p) => p.name).join(", ");

  if (!billingSwitchLive) {
    return `Yes — ${ANNUAL_DISCOUNT_PCT}% off, on every paid plan: ${names} alike, with no tier that quietly gets a worse deal. That is twelve months billed once instead of twelve monthly payments. The exact amount for your plan is confirmed in the app before you pay anything, so nothing is charged that you haven't seen.`;
  }

  // `mwk()` already carries the currency, so the sentence must not add it again.
  const totals = paid.map((p) => `${p.name} ${mwk(p.yearly)}`).join(", ");

  return `Yes — ${ANNUAL_DISCOUNT_PCT}% off, on every paid plan: ${names} alike. A year costs ${totals} — twelve months billed once instead of twelve monthly payments. You can start monthly and switch to yearly whenever you like, and the app shows the exact amount before you pay.`;
}
