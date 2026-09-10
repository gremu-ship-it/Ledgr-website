import Image from "next/image";
import Link from "next/link";
import { getDb } from "@/db";
import { sql } from "drizzle-orm";
import WaitlistForm from "@/components/WaitlistForm";
import PhoneMockup from "@/components/PhoneMockup";
import BrowserMockup from "@/components/BrowserMockup";
import TaxCalculator from "@/components/TaxCalculator";
import Faq from "@/components/Faq";
import PwaInstall from "@/components/PwaInstall";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

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
    title: "MRA tax compliance",
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

const testimonials = [
  {
    quote:
      "Ledgr is the first accounting tool that actually understands how we trade in Malawi. VAT and PAYE just work.",
    name: "Chimwemwe B.",
    role: "Retailer, Blantyre",
  },
  {
    quote:
      "I record sales at the market with no signal and it syncs when I get home. Game changer for my shop.",
    name: "Tadala M.",
    role: "Trader, Lilongwe",
  },
  {
    quote:
      "Finally proper P&L and cash flow reports without paying in dollars. My accountant loves it too.",
    name: "Yamikani K.",
    role: "Consultant, Mzuzu",
  },
];

const pricing = [
  {
    name: "Free",
    price: "Free",
    sub: "50 transactions/mo",
    features: [
      "Basic dashboard & reports",
      "Income & expense tracking",
      "Up to 50 transactions/month",
      "Community support",
    ],
    cta: "Get Started Free",
    href: site.registerUrl,
    highlight: false,
  },
  {
    name: "Growth",
    price: "MWK 100,000",
    sub: "per month",
    features: [
      "Everything in Free",
      "Bank reconciliation",
      "Accounting & Organisation (full access)",
      "Up to 500 transactions/month",
      "Email support",
    ],
    cta: "Upgrade to Growth",
    href: site.registerUrl,
    highlight: false,
  },
  {
    name: "Pro",
    price: "MWK 200,000",
    sub: "per month",
    features: [
      "Everything in Growth",
      "AI Insights & forecasting",
      "Public API access",
      "Webhook integrations",
      "Up to 2,000 transactions/month",
    ],
    cta: "Upgrade to Pro",
    href: site.registerUrl,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "MWK 500,000",
    sub: "per month",
    features: [
      "Everything in Pro",
      "Unlimited transactions",
      "Custom branding",
      "Multi-user roles & permissions",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlight: false,
  },
];

async function getLeadCount(): Promise<number> {
  try {
    const result = await getDb().execute<{ count: number }>(
      sql`select count(*)::int as count from leads`,
    );
    const rows = result.rows as { count: number }[];
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const leadCount = await getLeadCount();
  const joined = 180 + leadCount;

  return (
    <div className="overflow-x-hidden">
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
              Ledgr is an MWK-first, MRA-compliant accounting app for your phone{" "}
              <em className="not-italic font-semibold text-ink">and</em> your computer.
              Track income, expenses, tax and reports — at the shop, the market or the
              office, online or offline.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={site.registerUrl}
                className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-800"
              >
                Get Started Free →
              </a>
              <a
                href={site.loginUrl}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                View Demo
              </a>
            </div>
            <p className="mt-5 text-sm font-medium text-ink-soft">
              📱 Android &amp; iPhone <span className="mx-1 text-slate-300">·</span> 💻
              Windows &amp; Mac <span className="mx-1 text-slate-300">·</span> 🌐 Any
              browser
            </p>
            <div className="mt-5 flex items-center gap-4 text-sm text-ink-soft">
              <div className="flex -space-x-2">
                {["🧑🏿‍💼", "👩🏿‍💼", "👨🏿‍🔧", "👩🏿‍🌾"].map((e, i) => (
                  <span
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-100 text-sm"
                  >
                    {e}
                  </span>
                ))}
              </div>
              <span>
                <strong className="text-ink">{joined.toLocaleString()}+</strong> businesses
                getting started
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-brand-200/40 to-transparent blur-2xl" />
            <BrowserMockup
              src="/images/dashboard-web.svg"
              alt="Ledgr dashboard on desktop showing revenue, expenses and profit in Malawian Kwacha"
              className="relative"
            />
            <div className="absolute -right-2 top-6 hidden rotate-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl lg:block">
              <p className="text-xs font-medium text-slate-500">Net profit</p>
              <p className="text-lg font-bold text-brand-700">MWK 4.25M</p>
            </div>
            <div className="absolute -left-3 bottom-10 hidden -rotate-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl lg:block">
              <p className="text-xs font-medium text-slate-500">VAT due in</p>
              <p className="text-lg font-bold text-ink">6 days</p>
            </div>
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

      {/* INVOICE SHOWCASE */}
      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Invoicing & tax
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight text-ink">
              Professional invoices with VAT done right
            </h2>
            <p className="mt-4 text-ink-soft">
              Create branded invoices, split VAT at 17.5% automatically and export a clean
              PDF — all in MWK. Ledgr tracks PAYE, WHT and TEVETA due dates so you never miss
              an MRA deadline.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                "Automatic VAT split on every line",
                "One-tap PDF invoice generation",
                "PAYE, WHT & TEVETA due-date reminders",
                "Double-entry journal & chart of accounts",
                "Start on mobile, review on desktop — always in sync",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[10px] text-white">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <PhoneMockup src="/images/invoice.svg" alt="Ledgr invoice with VAT breakdown on a phone" />
          </div>
        </div>
      </section>

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
            Start free. Upgrade only when you grow. No expensive dollar subscriptions.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 ring-1 ring-brand-500"
                  : "border-slate-100 bg-white shadow-sm"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-ink">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="text-2xl font-extrabold text-ink">{p.price}</span>
                <span className="mb-1 text-sm text-slate-500">{p.sub}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-ink-soft">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="text-brand-700">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {p.href.startsWith("/") ? (
                <Link
                  href={p.href}
                  className={`mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-brand-700 text-white hover:bg-brand-800"
                      : "border border-slate-200 text-ink hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {p.cta}
                </Link>
              ) : (
                <a
                  href={p.href}
                  className={`mt-7 rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-brand-700 text-white hover:bg-brand-800"
                      : "border border-slate-200 text-ink hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {p.cta}
                </a>
              )}
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          Upgrades are processed securely through <strong>PayChangu</strong> (mobile money
          &amp; card). Downgrades take effect immediately with no charge.
        </p>
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Compare plans in detail →
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Loved by local businesses
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
              Trusted across Malawi
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-slate-100 bg-brand-50/40 p-7"
              >
                <div className="text-brand-700" aria-hidden>
                  ★★★★★
                </div>
                <span className="sr-only">Rated 5 out of 5</span>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 font-bold text-white">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
          <Link
            href="/customers"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            Read more customer stories →
          </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* EVERY SCREEN / CTA + FORM */}
      <section id="download" className="bg-ink py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-brand-200">
              One account, every screen
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-tight">
              On your phone. On your computer.{" "}
              <span className="text-brand-400">Always in sync.</span>
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Ledgr runs in any browser and installs as an app on Android, Windows and
              Mac. Capture sales at the market on your phone, then review reports on your
              laptop at home — no app store, no hassle, and it works offline.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={site.liveUrl}
                className="flex items-center gap-3 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold transition hover:bg-brand-800"
              >
                <span className="text-xl">🌐</span>
                Open the web app
              </a>
              <PwaInstall
                label="Install the app"
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              />
              <a
                href={site.liveUrl}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                <span className="text-xl">🤖</span>
                Android APK
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Airtel Money &amp; Mpamba integration · AI insights — coming soon.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl sm:p-8">
            <h3 className="text-xl font-bold">Get early access &amp; setup help</h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              Join the list and we&apos;ll help you get your books set up for free.
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
