export type FaqItem = { q: string; a: string };

/**
 * Single source of truth for the FAQ. Lives in a plain module (not the client
 * component) because a value exported from a "use client" file arrives in a
 * server component as a client reference, not the real array — which broke the
 * FAQPage structured data. Both the accordion and the JSON-LD read from here.
 *
 * Rule for this file: every answer must be true of the application as it is
 * today. Nothing here describes a roadmap item, and nothing claims a
 * certification. See docs/PRODUCT-AUDIT-2026-09.md.
 */
export const faqs: FaqItem[] = [
  {
    q: "Does Ledgr have a point of sale?",
    a: "Yes. Ledgr includes a till. Build a sale by scanning a barcode or searching your product list, apply a discount within the limit you've set, and take cash, Airtel Money, TNM Mpamba, bank transfer, card or credit — split across more than one method if the customer needs to. Print the receipt from the browser or straight to a Bluetooth thermal printer. Shifts open with a float, record cash in and out, and close against the counted drawer with a Z-report showing the variance.",
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
    a: "Yes. The till is tied to a branch, and the POS analytics break sales down by branch, by cashier and by day — with average sale value, discounts given and returns taken. Reports also includes a branch performance report so you can compare shops rather than guess. Branches are part of the Growth plan and above.",
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
    q: "What happens when the internet goes down?",
    a: "You keep trading. Sales and entries are stored on the device and queue up, then sync by themselves the moment the connection returns — nothing is lost and nothing is entered twice. What you can't do offline is see figures you hadn't already loaded, so stock levels and reports catch up once you're back online.",
  },
  {
    q: "Is Ledgr really free?",
    a: "There is a free plan, and it is genuinely free. It covers the dashboard, income, expenses, invoices and payroll for up to 50 transactions a month, with community support. Selling from a product list — products, stock and warehouses — plus the accounting modules and the financial reports start on Starter at MWK 50,000/month. Growth adds bank reconciliation, branches, contacts and the audit log; Pro adds AI insights, the API and webhooks.",
  },
  {
    q: "Can I try Ledgr without creating an account?",
    a: "Yes. The live demo opens the full app on a sample Malawian business with six months of books, a product list and an open till shift you can sell from. There is no sign-up, no password and no card, and nothing is sent to a server: the sample data is generated in your own browser and resets after 24 hours. If you'd rather just look, there's a one-minute read-only tour. When you're ready for your own numbers, create a free account — the demo data is deliberately not carried over.",
  },
  {
    q: "Does Ledgr handle Malawi VAT and the other MRA taxes?",
    a: "Ledgr is built around the Malawi Revenue Authority's rules — it is not a certification. VAT is split at the standard 17.5% on sales and purchases, with zero-rated and exempt items handled per line. PAYE is calculated on the MRA bands for the fiscal year, and withholding tax at 10%, 15% or 20% is applied where it belongs. Ledgr also shows you the filing dates with the days left: PAYE and WHT on the 14th, VAT on the 25th, and the TEVET levy on 1 April. You don't need to be VAT-registered to use Ledgr — if you're not, leave VAT switched off.",
  },
  {
    q: "Is my financial data safe?",
    a: "Your data is encrypted in transit and stored securely in the cloud, with a copy cached on your own device so the app keeps working offline. Only you and the people you invite to your business can see your books, and what each of them can see depends on the role you give them.",
  },
  {
    q: "Can I use Ledgr outside Malawi?",
    a: "Ledgr is Kwacha-first and its tax tools are Malawi's. You can record transactions in other currencies — Zambian kwacha, Tanzanian shilling, Mozambican metical, rand, US dollars, euro and pounds — with exchange rates applied to your books, so cross-border trade works. But if your business files its taxes somewhere other than Malawi, Ledgr won't do that part for you.",
  },
];
