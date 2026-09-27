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
    desc: "The tender lands against the sale and the drawer, so the shift can be counted at closing.",
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
 * of. Every item is implemented in the Ledgr application today — see
 * docs/PRODUCT-AUDIT-2026-09.md for what was removed and why.
 */
const featureGroups = [
  {
    eyebrow: "Sell",
    items: [
      {
        icon: "🛒",
        title: "Point of sale",
        desc: "A till your cashier can learn in ten minutes: barcode or search, discounts within their limit, park a sale, print a receipt.",
      },
      {
        icon: "🧾",
        title: "Invoices",
        desc: "Numbered PDF invoices with VAT split per line, and a clear view of who has paid, who is part-paid and who is late.",
      },
      {
        icon: "💵",
        title: "Payments",
        desc: "Cash, Airtel Money, TNM Mpamba, bank transfer, card or on credit — split across more than one when a customer needs to.",
      },
      {
        icon: "🧷",
        title: "Receipts",
        desc: "Print from the browser, or straight to a Bluetooth thermal printer with the cash drawer opening as it prints.",
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
        desc: "Payslips with PAYE worked out from the MRA bands and pension handled at the statutory rates.",
      },
    ],
  },
  {
    eyebrow: "Understand",
    items: [
      {
        icon: "📊",
        title: "Business dashboard",
        desc: "Income, expenses, profit, money owed to you and VAT accrued — this month against last, in Kwacha.",
      },
      {
        icon: "📑",
        title: "Financial reports",
        desc: "Profit or loss, balance sheet, cash flow, changes in equity and trial balance, from proper double-entry books.",
      },
      {
        icon: "🏬",
        title: "Branch performance",
        desc: "Compare branches instead of guessing which one carries the business — and which one quietly doesn't.",
      },
      {
        icon: "📈",
        title: "Sales analytics",
        desc: "Sales by cashier, by branch and by day, with average sale value, discounts given and returns taken.",
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
        desc: "PAYE and WHT on the 14th, VAT on the 25th, the TEVET levy on 1 April — shown with days left, before they bite.",
      },
    ],
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
    desc: "Business details, branches, tax settings and your product list. Run more than one business from one account.",
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
                — a sample Malawian business with an open till shift, stock,
                invoices, payroll, VAT and the reports, and no sign-up. Or{" "}
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
              alt="Ledgr dashboard on a computer showing income, expenses and net profit in Malawian Kwacha"
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
            selling from a product list, Growth and Pro as you add branches and
            people. Paid in Kwacha, by mobile money or card.
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
