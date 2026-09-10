import type { Metadata } from "next";
import { PageHero, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Malawian retailers, traders and consultants on Ledgr — offline sales capture, painless VAT and reports their accountants love.",
};

const stories = [
  {
    quote:
      "Ledgr is the first accounting tool that actually understands how we trade in Malawi. VAT and PAYE just work.",
    name: "Chimwemwe B.",
    role: "Retailer, Blantyre",
    metric: "VAT return in minutes",
  },
  {
    quote:
      "I record sales at the market with no signal and it syncs when I get home. Game changer for my shop.",
    name: "Tadala M.",
    role: "Trader, Lilongwe",
    metric: "100% offline capture",
  },
  {
    quote:
      "Finally proper P&L and cash flow reports without paying in dollars. My accountant loves it too.",
    name: "Yamikani K.",
    role: "Consultant, Mzuzu",
    metric: "Reports in 1 click",
  },
  {
    quote:
      "Invoicing used to take my Sunday afternoons. Now I send a VAT-correct PDF before the customer reaches their car.",
    name: "Blessings P.",
    role: "Hardware supplier, Zomba",
    metric: "2-minute invoices",
  },
  {
    quote:
      "Payday for six staff took a whole day of calculator maths. With Ledgr payroll it takes twenty minutes.",
    name: "Mphatso N.",
    role: "Restaurant owner, Blantyre",
    metric: "Payroll in 20 min",
  },
  {
    quote:
      "The due-date reminders alone are worth it. I have not missed an MRA deadline since I switched.",
    name: "Dalitso C.",
    role: "Contractor, Lilongwe",
    metric: "Zero missed deadlines",
  },
];

export default function CustomersPage() {
  return (
    <div>
      <PageHero
        eyebrow="Customers"
        title={
          <>
            Loved by businesses <span className="text-brand-600">across Malawi</span>
          </>
        }
        sub="From market traders to consultants — here's what happens when accounting finally fits."
      />
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          {stories.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
            >
              <div className="text-brand-500" aria-hidden>
                ★★★★★
              </div>
              <span className="mt-3 inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                {t.metric}
              </span>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 font-bold text-white">
                  {t.name.trim()[0]}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{t.name.trim()}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <CtaBand
        title="Your story could be next"
        sub="Join free today — set up in minutes and send your first invoice before lunch."
      />
    </div>
  );
}
