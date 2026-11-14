import Image from "next/image";
import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";
import BrowserMockup from "@/components/BrowserMockup";
import TaxCalculator from "@/components/TaxCalculator";
import ProductTour from "@/components/ProductTour";
import PricingPlans from "@/components/PricingPlans";
import ContactStrip from "@/components/ContactStrip";
import Faq from "@/components/Faq";
import PwaInstall from "@/components/PwaInstall";
import { demo, site } from "@/lib/site";
import { faqs } from "@/lib/faqs";
import {
  faqSchema,
  organizationSchema,
  softwareSchema,
  JsonLd,
} from "@/lib/schema";

/**
 * The chain the whole site is built around: work happens at the front of the
 * business, and Ledgr carries it through to the numbers at the back. Rendered
 * as the strip under the hero and referenced again by the "one sale" section.
 */
const flow = [
  { icon: "🛒", label: "Sell" },
  { icon: "📦", label: "Stock" },
  { icon: "💵", label: "Payments" },
  { icon: "📘", label: "Accounting" },
  { icon: "📊", label: "Reports" },
];

/** What happens after a cashier presses Charge. Each step is a real behaviour. */
const saleSteps = [
  {
    n: "01",
    title: "The cashier rings up the sale",
    desc: "Scan or search, take cash, mobile money, card or a mix of them, and print the receipt.",
  },
  {
    n: "02",
    title: "Stock comes off the shelf",
    desc: "The items leave the branch they were actually sold from, not a single blurred total.",
  },
  {
    n: "03",
    title: "The payment is recorded",
    desc: "The tender lands against the sale, the till and the shift, so the drawer can be counted at closing.",
  },
  {
    n: "04",
    title: "It reaches your books",
    desc: "Revenue, VAT and cost of sales are posted with the sale — not re-keyed from a notebook later.",
  },
  {
    n: "05",
    title: "You can see it",
    desc: "From home, from another branch, or on your phone: today's takings, margin and what is running out.",
  },
];

/**
 * Features grouped by what a business does, not by what the software is made
 * of. Every item is implemented in the Ledgr application today — last checked
 * against `Ledgr-react@7fb872d`. See docs/PRODUCT-AUDIT-2026-11.md for what
 * changed, and docs/PRODUCT-AUDIT-2026-09.md for what was removed and why.
 */
const featureGroups = [
  {
    eyebrow: "Sell",
    items: [
      {
        icon: "🛒",
        title: "Point of sale",
        desc: "A till your cashier can learn in ten minutes: barcode or search, discounts within their limit, park a sale and pick it up again, close the shift against the drawer.",
      },
      {
        icon: "🧾",
        title: "Invoices",
        desc: "Numbered PDF invoices with VAT split per line, and a clear view of who has paid, who is part-paid and who is late.",
      },
      {
        icon: "💵",
        title: "Payments & receipts",
        desc: "Cash, Airtel Money, TNM Mpamba, bank transfer, card or on credit — split when a customer needs to — with the receipt printed from the browser or a Bluetooth thermal printer.",
      },
      {
        icon: "↩️",
        title: "Returns & refunds",
        desc: "Find the receipt, take back all of it or part of it, and the items go back into stock — with a manager's approval when you say one is needed.",
      },
    ],
  },
  {
    eyebrow: "Manage",
    items: [
      {
        icon: "📦",
        title: "Stock",
        desc: "Quantity on hand per branch and warehouse, transfers between them, reorder levels, and movement history that includes every sale.",
      },
      {
        icon: "👥",
        title: "Customers & suppliers",
        desc: "One contact list for the people you sell to and buy from, reusable on invoices and at the till.",
      },
      {
        icon: "💸",
        title: "Expenses",
        desc: "Record what you spend against the right account, with input VAT separated so your return adds up.",
      },
      {
        icon: "🧮",
        title: "Payroll",
        desc: "Weekly, fortnightly or monthly pay runs with PAYE worked out from the MRA bands and pension at the statutory rates — approved, posted to the books, payslips out. Leave is tracked alongside.",
      },
    ],
  },
  {
    eyebrow: "Understand",
    items: [
      {
        icon: "📊",
        title: "Business dashboard",
        desc: "Cash in the bank, money owed to you, bills to pay and the next payroll at the top; then income, expenses, profit and VAT accrued for the period, in Kwacha.",
      },
      {
        icon: "📑",
        title: "Financial reports",
        desc: "Profit or loss, balance sheet, cash flow, changes in equity and trial balance, from proper double-entry books — printed, or exported to CSV for your accountant.",
      },
      {
        icon: "🎯",
        title: "Budgets & cash forecast",
        desc: "Set a budget and watch actuals land against it, then project your cash month by month from what you are owed, what you owe and the payroll to come.",
      },
      {
        icon: "🏬",
        title: "Branch & sales analytics",
        desc: "Compare branches instead of guessing which one carries the business, and see sales by cashier and by day — with discounts given and returns taken.",
      },
    ],
  },
  {
    eyebrow: "Stay compliant",
    items: [
      {
        icon: "🏛️",
        title: "VAT at 17.5%",
        desc: "Split automatically on sales and purchases, with zero-rated and exempt items handled per line.",
      },
      {
        icon: "👔",
        title: "PAYE",
        desc: "Calculated on the MRA bands for the fiscal year, and editable if your business has its own arrangement.",
      },
      {
        icon: "✂️",
        title: "Withholding tax",
        desc: "WHT at 10%, 15% or 20% applied per line and tracked where it belongs in the accounts.",
      },
      {
        icon: "🗓️",
        title: "Filing dates",
        desc: "PAYE and WHT on the 14th, VAT on the 25th, the TEVET levy on 1 April — shown with days left, and a reminder when one falls due within the week.",
      },
    ],
  },
];

/**
 * What reached the application between the September and November audits
 * (`Ledgr-react@4d9aa63..7fb872d`). Each card carries the plan it is on,
 * because several of these are deliberately not on the cheaper plans and a
 * visitor should not have to find that out at checkout. `plan` strings follow
 * the gates in the app's `navConfig.ts` and `plans.ts`.
 *
 * This is a "recently added" list, so prune it at the next audit: anything
 * that has stopped being new belongs in `featureGroups` above or on /features.
 */
const recentlyAdded = [
  {
    icon: "🏗️",
    title: "Construction",
    plan: "Enterprise",
    desc: "A workspace per project: bill of quantities, valuations and payment certificates with retention, change orders, subcontractors, and profit or loss for each job.",
  },
  {
    icon: "🏭",
    title: "Manufacturing",
    plan: "Enterprise",
    desc: "Bills of materials, material requirements planning, work orders and production runs that record what was made — and what was scrapped.",
  },
  {
    icon: "🎯",
    title: "Budgets & cash forecast",
    plan: "Growth",
    desc: "Budget against actual by account, and a cash forecast you can re-run as a scenario: what if customers pay thirty days later?",
  },
  {
    icon: "🧮",
    title: "Pay runs & leave",
    plan: "Growth",
    desc: "Payroll as a run rather than a spreadsheet: calculate, approve, post and issue payslips, with leave requests handled in the same place.",
  },
  {
    icon: "🏪",
    title: "Tills, shifts & returns",
    plan: "Starter",
    desc: "Name each till, open and reconcile its shifts, and take returns against the receipt. More than one till, and the full shift history, on Growth.",
  },
  {
    icon: "🧠",
    title: "Ledgr AI assistant",
    plan: "Pro",
    desc: "Ask a question in plain words and get an answer worked out from your own books. On Enterprise it also flags duplicate expenses and unusual entries.",
  },
  {
    icon: "✅",
    title: "Approval workflows",
    plan: "Enterprise",
    desc: "Purchase orders and journal entries pass through the approval steps you set, in order, before they take effect.",
  },
  {
    icon: "📥",
    title: "Bring your records with you",
    plan: "Setup",
    desc: "CSV templates for accounts, contacts, products, opening balances, invoices, bills, assets and employees — checked row by row before anything is saved.",
  },
];

const steps = [
  {
    n: "01",
    title: "Sign up free",
    desc: "Create your account in under a minute — no card, no commitment.",
  },
  {
    n: "02",
    title: "Set up your business",
    desc: "Tell Ledgr how you trade — retail, wholesale, services, projects, construction or manufacturing — and it shows the parts that fit. Import your products, contacts and opening balances from a spreadsheet.",
  },
  {
    n: "03",
    title: "Start trading",
    desc: "Sell at the till, invoice a customer, log an expense — even offline. It syncs when you reconnect.",
  },
];

const usps = [
  {
    title: "Built for Malawi",
    desc: "Kwacha, MRA tax codes, Airtel Money and Mpamba at the till — designed in, not bolted on.",
  },
  {
    title: "Keeps working offline",
    desc: "Sales and entries are kept on the device when the network drops and sync themselves when it returns.",
  },
  {
    title: "Phone, tablet & computer",
    desc: "One account on every screen. Sell on a tablet at the counter, read the reports on a laptop at home.",
  },
  {
    title: "Priced in Kwacha",
    desc: "Free to start, then MWK 50,000 a month — billed in Kwacha, not dollars, and no foreign card needed.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={softwareSchema()} />
      <JsonLd data={organizationSchema()} />
      {/* HERO */}
      <section
        id="top"
        className="relative bg-gradient-to-b from-brand-50 via-white to-white"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(60rem 30rem at 80% -10%, rgba(29,158,117,0.18), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:py-16 lg:grid-cols-[1fr_1.15fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
              🇲🇼 Built for Malawi · Till, stock and books in one place
            </span>
            <h1 className="mt-5 text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.04] tracking-tight text-ink">
              Run your business.{" "}
              <span className="text-brand-700">Know your numbers.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Ledgr brings sales, POS, stock, expenses, invoicing and accounting
              together in one place — built for businesses in Malawi. Sell at the
              counter, bill from your phone, and see what it all did to the
              bottom line.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {/* Analytics: `hero-demo` and `hero-tour` are kept on the links
                  they have always measured (hero -> demo, hero -> tour) so the
                  existing history stays comparable. This slot changed
                  destination — it used to open the demo and now goes to
                  sign-up — so it gets its own id rather than inheriting one. */}
              <a
                href={site.registerUrl}
                data-track="hero-register"
                className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-800"
              >
                Try Ledgr →
              </a>
              <Link
                href="/contact"
                data-track="hero-contact"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                Talk to us
              </Link>
            </div>
            {demo.available && (
              <p className="mt-3 text-sm text-ink-soft">
                Rather look before you sign up?{" "}
                <a
                  href={demo.link("hero")}
                  data-track="hero-demo"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Open the live demo
                </a>{" "}
                — a sample Malawian business with six months of invoices,
                income and expenses behind the dashboard, and no sign-up. Or{" "}
                <a
                  href={demo.tourUrl}
                  data-track="hero-tour"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  watch the 1-minute tour
                </a>
                .
              </p>
            )}
            <p className="mt-5 text-sm font-medium text-ink-soft">
              📱 Android &amp; iPhone <span className="mx-1 text-slate-300">·</span> 💻
              Windows &amp; Mac <span className="mx-1 text-slate-300">·</span> 🌐 Any
              browser
            </p>
            <p className="mt-5 text-sm font-medium text-ink-soft">
              Free plan · no card · nothing to install
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-brand-200/40 to-transparent blur-2xl" />
            <BrowserMockup
              src="/images/dashboard-web.svg"
              alt="Ledgr dashboard on a computer showing cash in the bank, money owed, bills to pay, the next payroll, net profit and VAT accrued in Malawian Kwacha"
              className="relative"
              priority
            />
          </div>
        </div>
      </section>

      {/* THE CHAIN — what connects the front of the business to the books */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            One system, front to back
          </p>
          <ol className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {flow.map((f, i) => (
              <li key={f.label} className="flex items-center gap-3">
                <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm">
                  <span aria-hidden>{f.icon}</span>
                  {f.label}
                </span>
                {i < flow.length - 1 && (
                  <span className="text-brand-500" aria-hidden>
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRODUCT TOUR — answer "what does it actually look like?" up front */}
      <ProductTour />

      {/* ONE SALE — the POS story, told as a chain rather than a feature card */}
      <section id="one-sale" className="bg-slate-50/70 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              A sale is not an island
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
              One sale. Five things happen.
            </h2>
            <p className="mt-4 text-ink-soft">
              In most small businesses the till, the stock book and the accounts
              are three different stories that only meet at month end — badly. In
              Ledgr they are the same record.
            </p>
          </div>
          <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {saleSteps.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <span className="text-2xl font-extrabold text-brand-200">{s.n}</span>
                <h3 className="mt-2 text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-7 max-w-2xl text-center text-sm text-ink-soft">
            Not selling over a counter? The same chain runs from an invoice
            instead — bill the customer, record the payment, and the books and
            reports keep up on their own.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            What Ledgr does
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Sell, manage, understand, stay compliant
          </h2>
          <p className="mt-4 text-ink-soft">
            Finance stays at the centre — it is what turns the day&apos;s activity
            into something you can make decisions with.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {featureGroups.map((g) => (
            <div key={g.eyebrow}>
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-brand-700">
                  {g.eyebrow}
                </h3>
                <span className="h-px flex-1 bg-slate-100" aria-hidden />
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {g.items.map((f) => (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl transition group-hover:bg-brand-100">
                      <span aria-hidden>{f.icon}</span>
                    </div>
                    <h4 className="mt-4 text-base font-bold text-ink">{f.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/features"
            className="inline-block rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
          >
            See the detail →
          </Link>
        </div>
      </section>

      {/* RECENTLY ADDED — what the app gained since the site was last audited */}
      <section
        id="new"
        aria-labelledby="new-heading"
        className="border-y border-brand-100 bg-brand-50/50 py-14"
      >
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Recently added
            </p>
            <h2
              id="new-heading"
              className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink"
            >
              Ledgr now goes further than the shop counter
            </h2>
            <p className="mt-4 text-ink-soft">
              Builders and manufacturers get their own workspaces, and every
              business gets better tools for planning ahead. Each one is marked
              with the plan it starts on.
            </p>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyAdded.map((f) => (
              <li
                key={f.title}
                className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl">
                    <span aria-hidden>{f.icon}</span>
                  </div>
                  <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-800">
                    {f.plan}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-ink-soft">
            Construction and manufacturing appear when you set your business up
            as one or the other, so a shop never has to scroll past them.{" "}
            <Link
              href="/pricing"
              className="font-semibold text-brand-700 hover:underline"
            >
              See what each plan includes →
            </Link>
          </p>
        </div>
      </section>

      {/* USP / OFFLINE SHOWCASE */}
      <section className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <div className="relative">
            <Image
              src="/images/sme-owner.jpg"
              alt="A Malawian small-business owner checking their figures on a phone"
              width={1200}
              height={627}
              sizes="(max-width: 768px) 100vw, 560px"
              className="rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-brand-700 px-5 py-4 shadow-xl">
              <p className="text-xs font-medium text-brand-50">Sold offline</p>
              <p className="text-lg font-bold">Synced ✓</p>
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight">
              Why businesses here choose Ledgr
            </h2>
            <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {usps.map((u) => (
                <div key={u.title} className="flex gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-bold">{u.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            How it works
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Up and running in three steps
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-slate-100 bg-gradient-to-b from-brand-50/60 to-white p-7"
            >
              <span className="text-4xl font-extrabold text-brand-200">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href={site.registerUrl}
            className="rounded-xl bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800"
          >
            Try Ledgr →
          </a>
        </div>
      </section>

      {/* TAX CALCULATOR */}
      <TaxCalculator />

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Pricing
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Priced for businesses here
          </h2>
          <p className="mt-4 text-ink-soft">
            Start free. Paid plans from MWK 50,000/month — Starter once you are
            selling from a till and a product list, Growth for the financial
            reports, pay runs and branches, Pro for the AI assistant and
            integrations, Enterprise for construction and manufacturing. Paid in
            Kwacha, by mobile money or card.
          </p>
        </div>
        <PricingPlans />
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Compare plans in detail →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* TALK TO US — for people who won't self-serve */}
      <ContactStrip note="No pressure and no scripts — just ask. We'll tell you honestly if Ledgr isn't a fit for your business." />

      {/* EVERY SCREEN / FINAL CTA */}
      <section id="download" className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200">
              One account, every screen
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-tight">
              On the counter. In your pocket.{" "}
              <span className="text-brand-400">Always the same numbers.</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Ledgr runs in any browser and installs to a home screen or desktop in
              two taps — no app store, no download queue. Sell on a tablet at the
              shop, check the day&apos;s takings from your phone, close the month on
              a laptop. When the network drops, you carry on recording and it
              syncs when you&apos;re back.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={site.registerUrl}
                className="flex items-center gap-3 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold transition hover:bg-brand-800"
              >
                <span className="text-xl" aria-hidden>
                  🚀
                </span>
                Try Ledgr
              </a>
              <PwaInstall
                label="Install the app"
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              />
            </div>
            <ul className="mt-7 grid gap-2.5 text-sm text-slate-300 sm:grid-cols-2">
              {[
                "Free plan, no card required",
                "Sell offline, syncs automatically",
                "Kwacha-first with MRA tax built in",
                "Android, iPhone, Windows & Mac",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-700 text-[10px] text-white">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-400">
              Already have an account?{" "}
              <a href={site.loginUrl} className="font-semibold text-brand-200 hover:underline">
                Sign in
              </a>
              .
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl sm:p-8">
            <h3 className="text-xl font-bold">Prefer a hand getting set up?</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              Leave your details and we&apos;ll help you load your business, branches,
              product list and opening balances — free, on WhatsApp or a call.
            </p>
            <div className="mt-5">
              <WaitlistForm source="download-cta" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
