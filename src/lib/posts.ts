export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Tax guides" | "Product" | "Business tips";
  date: string;
  readMinutes: number;
  keywords: string[];
  blocks: PostBlock[];
};

export const posts: Post[] = [
  {
    slug: "vat-guide-malawi-small-business",
    title: "VAT in Malawi: a plain-language guide for small businesses",
    excerpt:
      "The 17.5% rate, who must register, monthly returns due on the 25th, e-invoicing — and how Ledgr handles the split automatically.",
    category: "Tax guides",
    date: "2026-09-01",
    readMinutes: 6,
    keywords: ["Malawi VAT", "VAT 17.5%", "MRA VAT registration", "Msonkho Online"],
    blocks: [
      {
        type: "p",
        text: "Value Added Tax (VAT) is the tax most Malawian businesses meet first. You collect it on your sales, claim back what you paid on business purchases, and remit the difference to the Malawi Revenue Authority (MRA). Here is what that means in practice.",
      },
      { type: "h2", text: "The current rate: 17.5%" },
      {
        type: "p",
        text: "Malawi's standard VAT rate is 17.5%, in effect since January 2026. Some supplies are zero-rated (like exports) or exempt (such as healthcare and education) — everything else you sell at the standard rate if you are VAT-registered.",
      },
      { type: "h2", text: "Do you need to register for VAT?" },
      {
        type: "p",
        text: "Registration becomes compulsory once your taxable turnover crosses the MRA threshold — confirm the current figure on mra.mw or Msonkho Online, as thresholds change. Below the threshold, registration is voluntary: it can make sense if most of your customers are VAT-registered businesses that want proper tax invoices.",
      },
      {
        type: "tip",
        text: "Not sure whether to register? Talk to your accountant — and switch VAT on or off in Ledgr's tax settings with one toggle. The app handles the 17.5% split on every line automatically.",
      },
      { type: "h2", text: "Filing: monthly, by the 25th" },
      {
        type: "list",
        items: [
          "VAT returns are filed monthly through Msonkho Online, the MRA e-services portal.",
          "Payment is due by the 25th of the month following the tax period.",
          "Keep every tax invoice — for sales you issue and purchases you claim — for inspection.",
          "MRA is rolling out mandatory e-invoising: registered taxpayers must issue fiscalised electronic invoices.",
        ],
      },
      { type: "h2", text: "How Ledgr helps" },
      {
        type: "p",
        text: "Record a sale or expense and Ledgr splits out the 17.5% VAT on every line, builds your monthly VAT position in real time, and reminds you before the 25th. Come filing day, your return figures are already waiting — in MWK, down to the tambala.",
      },
    ],
  },
  {
    slug: "paye-employers-guide-malawi",
    title: "PAYE in Malawi: the employer's guide to payroll tax (2026 bands)",
    excerpt:
      "The current 0%–40% monthly bands, a worked example on a MWK 500,000 salary, and how to never miss a remittance.",
    category: "Tax guides",
    date: "2026-08-20",
    readMinutes: 7,
    keywords: ["Malawi PAYE", "PAYE bands 2026", "payroll tax Malawi", "MRA PAYE"],
    blocks: [
      {
        type: "p",
        text: "Pay As You Earn (PAYE) is income tax your business deducts from employees' salaries each month and remits to MRA. If you employ even one person earning above the tax-free threshold, this guide is for you.",
      },
      { type: "h2", text: "The 2026 monthly bands" },
      {
        type: "p",
        text: "PAYE is calculated monthly on these MRA bands, effective January 2026:",
      },
      {
        type: "list",
        items: [
          "MWK 0 – 170,000: 0% (tax-free)",
          "MWK 170,001 – 1,570,000: 30%",
          "MWK 1,570,001 – 10,000,000: 35%",
          "Above MWK 10,000,000: 40%",
        ],
      },
      { type: "h2", text: "Worked example" },
      {
        type: "p",
        text: "An employee earns MWK 500,000 per month. The first MWK 170,000 is tax-free. The remaining MWK 330,000 falls in the 30% band: 330,000 × 30% = MWK 99,000 PAYE. Take-home pay is MWK 401,000, and you remit MWK 99,000 to MRA.",
      },
      {
        type: "tip",
        text: "Try it yourself with the free VAT & PAYE calculator on our homepage — then let Ledgr payroll calculate it for every employee, every month, automatically.",
      },
      { type: "h2", text: "Employer duties checklist" },
      {
        type: "list",
        items: [
          "Deduct the correct PAYE from each payslip, every month.",
          "Remit deductions to MRA on time through Msonkho Online — late payment attracts penalties and interest.",
          "Issue each employee an annual tax certificate (P16) summarising earnings and tax deducted.",
          "Keep payroll records for inspection; MRA can audit prior years.",
        ],
      },
      { type: "h2", text: "How Ledgr helps" },
      {
        type: "p",
        text: "Ledgr payroll applies the current bands to every employee, generates compliant payslips, and tracks exactly what you owe MRA each month — so payday takes minutes, not a spreadsheet wrestling match.",
      },
    ],
  },
  {
    slug: "withholding-tax-teveta-explained",
    title: "Withholding tax & the TEVETA levy, explained for busy owners",
    excerpt:
      "What WHT is, when you must deduct it, the 1% TEVETA training levy on payroll — and how to track both without spreadsheets.",
    category: "Tax guides",
    date: "2026-08-05",
    readMinutes: 5,
    keywords: ["Malawi withholding tax", "WHT rates", "TEVETA levy", "MRA deductions"],
    blocks: [
      {
        type: "p",
        text: "Beyond VAT and PAYE, two more deductions catch Malawian businesses by surprise: withholding tax (WHT) on certain payments, and the TEVETA training levy on your wage bill. Both are straightforward once you see them clearly.",
      },
      { type: "h2", text: "Withholding tax (WHT)" },
      {
        type: "p",
        text: "WHT means deducting tax at source when you pay for certain goods and services — for example payments to suppliers, contractors, landlords or professionals — and remitting it to MRA on the payee's behalf. Rates vary by payment type, so always confirm the current rate for your specific payment on mra.mw before deducting.",
      },
      {
        type: "list",
        items: [
          "Deduct WHT at the time you pay (or credit) the supplier — not at year end.",
          "Issue the payee a withholding certificate so they can claim the credit.",
          "Remit what you withheld to MRA within the prescribed period.",
        ],
      },
      { type: "h2", text: "The TEVETA levy" },
      {
        type: "p",
        text: "Employers in Malawi pay a 1% training levy on the gross wage bill to TEVETA (Technical, Entrepreneurial and Vocational Education and Training Authority). It funds vocational training nationally — and yes, it applies on top of PAYE and pension contributions.",
      },
      {
        type: "tip",
        text: "WHT + PAYE + TEVETA + pension = four separate monthly calculations. Ledgr tracks each one against your actual payroll and supplier payments, with due-date reminders before every deadline.",
      },
      { type: "h2", text: "How Ledgr helps" },
      {
        type: "p",
        text: "Flag a supplier as subject to WHT once and Ledgr deducts it on every payment automatically, ready for your monthly remittance. Payroll picks up the TEVETA levy alongside PAYE — one payroll run, every obligation covered.",
      },
    ],
  },
  {
    slug: "professional-invoices-that-get-paid",
    title: "Invoices that get paid: 7 rules for Malawian small businesses",
    excerpt:
      "What a proper tax invoice must show, why VAT lines matter, and the follow-up rhythm that halves late payment.",
    category: "Business tips",
    date: "2026-07-22",
    readMinutes: 5,
    keywords: ["invoice template Malawi", "tax invoice", "late payment", "small business invoicing"],
    blocks: [
      {
        type: "p",
        text: "Cash flow is the oxygen of a small business — and invoices are how you breathe it in. These seven rules will get you paid faster, with less chasing.",
      },
      { type: "h2", text: "The 7 rules" },
      {
        type: "list",
        items: [
          "Invoice immediately: send the invoice the day you deliver, not at month end.",
          "Number every invoice sequentially (INV-0001, INV-0002…) — gaps raise questions at audit.",
          "Show VAT properly: your TPIN, the 17.5% VAT per line, and the VAT-inclusive total.",
          "State payment terms in days (e.g. 'Due in 14 days') plus your bank, Airtel Money or Mpamba details.",
          "Follow up on a rhythm: a reminder 3 days before due, on the due date, then weekly.",
          "Offer a small early-payment discount (e.g. 2% for payment within 7 days) to big debtors.",
          "Reconcile weekly: know exactly who owes you what, every Friday.",
        ],
      },
      {
        type: "tip",
        text: "Ledgr generates numbered, VAT-correct PDF invoices in seconds, sends polite automatic reminders, and shows every outstanding invoice on one ageing screen. No more 'I forgot to invoice' months.",
      },
      { type: "h2", text: "What a tax invoice must include" },
      {
        type: "p",
        text: "At minimum: your business name, address and TPIN; a unique invoice number and date; your customer's details; a description of goods or services; amounts excluding VAT, the VAT amount, and the total including VAT. Ledgr includes all of these on every invoice by default.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
