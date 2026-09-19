export type FaqItem = { q: string; a: string };

/**
 * Single source of truth for the FAQ. Lives in a plain module (not the client
 * component) because a value exported from a "use client" file arrives in a
 * server component as a client reference, not the real array — which broke the
 * FAQPage structured data. Both the accordion and the JSON-LD read from here.
 */
export const faqs: FaqItem[] = [
  {
    q: "Is Ledgr really free?",
    a: "Yes. The Free plan is free forever and includes a basic dashboard and reports plus income and expense tracking for up to 50 transactions a month. Paid plans start at MWK 50,000/month (Starter) and unlock professional invoicing, bank reconciliation, AI insights, API access and higher limits.",
  },
  {
    q: "Can I try Ledgr without creating an account?",
    a: "Yes. The live demo opens the full app on a sample Malawian business with six months of books — invoices, expenses, VAT, payroll, stock and the financial reports. There is no sign-up, no password and no card, and nothing is sent to a server: the sample books are generated in your own browser and reset after 24 hours. If you would rather just look at the screens first, there is a one-minute read-only tour. When you are ready for your own books, create a free account — the demo data is deliberately not carried over.",
  },
  {
    q: "How does offline mode work?",
    a: "Ledgr stores your transactions on your device using secure on-device storage. When you have no internet, everything keeps working — entries queue up and sync automatically the moment you reconnect. Nothing is lost.",
  },
  {
    q: "Is Ledgr compliant with MRA tax rules?",
    a: "Ledgr is built around Malawi Revenue Authority requirements — VAT at 17.5%, PAYE, WHT and TEVETA. It calculates the splits for you and reminds you before each due date so you never miss a filing.",
  },
  {
    q: "Do I need to be VAT-registered to use Ledgr?",
    a: "No. Ledgr works whether or not you're VAT-registered. If you are registered, switch on VAT in your tax settings and Ledgr handles the 17.5% split on every transaction automatically.",
  },
  {
    q: "Is my financial data safe?",
    a: "Your data is encrypted in transit and stored securely in the cloud, with a copy cached on your own device for offline access. Only you and the users you invite to your business can see your books.",
  },
  {
    q: "Can I use Ledgr outside Malawi?",
    a: "Yes. Ledgr is MWK-first but works across the SADC region — Zambia, Zimbabwe, Tanzania and Kenya. The accounting engine, reports and offline features work everywhere.",
  },
];
