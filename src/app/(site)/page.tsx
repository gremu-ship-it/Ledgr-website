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
import { faqSchema, softwareSchema, JsonLd } from "@/lib/schema";

const features = [
  {
    icon: "📊",
    title: "Real-time dashboard",
    desc: "Live P&L, income, expenses and net profit at a glance — always in Malawian Kwacha.",
  },
  {
    icon: "🧾",
    title: "Invoices & income",
    desc: "Record income and generate professional PDF invoices with VAT split in seconds.",
  },
  {
    icon: "🏛️",
    title: "Malawi tax tools",
    desc: "Built-in VAT (17.5%), PAYE, WHT and TEVETA with automatic due-date reminders.",
  },
  {
    icon: "📦",
    title: "Inventory & stock",
    desc: "Track stock levels and movement so you always know what you have on hand.",
  },
  {
    icon: "👥",
    title: "Payroll & contacts",
    desc: "Manage payroll with PAYE calculation, plus customers and suppliers in one place.",
  },
  {
    icon: "📑",
    title: "Real financial reports",
    desc: "P&L, Balance Sheet, Cash Flow and Trial Balance from proper double-entry books.",
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
    desc: "Add your business details, tax settings and chart of accounts. Multi-business ready.",
  },
  {
    n: "03",
    title: "Start recording",
    desc: "Log income and expenses — even offline. Everything syncs when you reconnect.",
  },
];

const usps = [
  { title: "Built for Malawi", desc: "MWK currency, MRA tax codes and local payment methods — by design, not retrofitted." },
  { title: "Works offline", desc: "Record transactions without internet. They queue and sync automatically." },
  { title: "Phone, tablet & computer", desc: "One account on every screen. Capture sales on your phone, review reports on your laptop." },
  { title: "Affordable", desc: "Priced for small businesses that QuickBooks and Sage price out." },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={softwareSchema()} />
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
              🇲🇼 Built for Malawi · Phone + Desktop
            </span>
            <h1 className="mt-5 text-[clamp(2.4rem,6vw,4rem)] font-extrabold leading-[1.04] tracking-tight text-ink">
              Smart accounting for{" "}
              <span className="text-brand-700">Malawian businesses</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Ledgr is an MWK-first accounting and business management app for your
              phone <em className="not-italic font-semibold text-ink">and</em> your
              computer. Track income, expenses, stock, tax and reports — at the shop,
              the market or the office, online or offline.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={demo.available ? demo.link("hero") : site.registerUrl}
                data-track="hero-demo"
                className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-800"
              >
                {demo.available ? "Try Ledgr — no sign-up" : "Get Started Free"} →
              </a>
              <a
                href={demo.available ? demo.tourUrl : "#tour"}
                data-track="hero-tour"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                See how it works
              </a>
            </div>
            {demo.available && (
              <p className="mt-3 text-sm text-ink-soft">
                Opens a full sample business — invoices, payroll, VAT and reports — with
                no sign-up.{" "}
                <a
                  href={demo.tourUrl}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  See the 1-minute tour →
                </a>
              </p>
            )}
            <p className="mt-5 text-sm font-medium text-ink-soft">
              📱 Android &amp; iPhone <span className="mx-1 text-slate-300">·</span> 💻
              Windows &amp; Mac <span className="mx-1 text-slate-300">·</span> 🌐 Any
              browser
            </p>
            <p className="mt-5 text-sm font-medium text-ink-soft">
              Free to explore · no card · no sign-up required for the demo
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-brand-200/40 to-transparent blur-2xl" />
            <BrowserMockup
              src="/images/dashboard-web.svg"
              alt="Ledgr dashboard on desktop showing revenue, expenses and profit in Malawian Kwacha"
              className="relative"
              priority
            />
          </div>
        </div>
      </section>

      {/* LOGO / TRUST STRIP */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-8 text-center md:grid-cols-4">
          {[
            ["17.5%", "VAT handled automatically"],
            ["100%", "Works offline"],
            ["4", "Financial reports built-in"],
            ["MWK", "First-class currency"],
          ].map(([big, small]) => (
            <div key={small}>
              <p className="text-2xl font-extrabold text-brand-700">{big}</p>
              <p className="mt-1 text-xs text-ink-soft">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT TOUR — answer "what does it actually look like?" up front */}
      <ProductTour />

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Everything in one app
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Run your whole business from anywhere
          </h2>
          <p className="mt-4 text-ink-soft">
            From the first sale to your tax return — Ledgr brings accounting, invoicing,
            payroll, inventory and reports together. Start on your phone, finish on your
            laptop: everything stays in sync.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl transition group-hover:bg-brand-100">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/features"
            className="inline-block rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
          >
            Explore all features →
          </Link>
        </div>
      </section>

      {/* USP / OFFLINE SHOWCASE */}
      <section className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <div className="relative">
            <Image
              src="/images/sme-owner.jpg"
              alt="Small business owner using Ledgr"
              width={1200}
              height={627}
              sizes="(max-width: 768px) 100vw, 560px"
              className="rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-brand-700 px-5 py-4 shadow-xl">
              <p className="text-xs font-medium text-brand-50">Offline transactions</p>
              <p className="text-lg font-bold">Synced ✓</p>
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight">
              Why Malawian SMEs choose Ledgr
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
            Create your free account →
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
            Affordable for every business
          </h2>
          <p className="mt-4 text-ink-soft">
            Start free. Upgrade only when you grow. No expensive dollar subscriptions —
            and two months free if you pay yearly.
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

      {/* TALK TO A HUMAN — for people who won't self-serve */}
      <ContactStrip
        note="No pressure and no scripts — just ask. We'll tell you honestly if Ledgr isn't a fit for your business."
      />

      {/* EVERY SCREEN / FINAL CTA */}
      <section id="download" className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200">
              One account, every screen
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-tight">
              On your phone. On your computer.{" "}
              <span className="text-brand-400">Always in sync.</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Ledgr runs in any browser and installs to your home screen or desktop in
              two taps — no app store, no download queue. Capture sales at the market on
              your phone, then review reports on your laptop at home. It keeps working
              when the network doesn&apos;t.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={site.registerUrl}
                className="flex items-center gap-3 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold transition hover:bg-brand-800"
              >
                <span className="text-xl" aria-hidden>
                  🚀
                </span>
                Create your free account
              </a>
              <PwaInstall
                label="Install the app"
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              />
            </div>
            <ul className="mt-7 grid gap-2.5 text-sm text-slate-300 sm:grid-cols-2">
              {[
                "Free plan, no card required",
                "Works offline, syncs automatically",
                "MWK-first with MRA tax built in",
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
              Leave your details and we&apos;ll help you load your business, tax settings
              and opening balances — free, on WhatsApp or a call.
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
