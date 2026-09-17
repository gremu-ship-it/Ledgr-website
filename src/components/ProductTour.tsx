"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import BrowserMockup from "@/components/BrowserMockup";
import PhoneMockup from "@/components/PhoneMockup";
import { demo, site, tryLabel, tryUrl } from "@/lib/site";

type Tab = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  kind: "desktop" | "phone";
  src: string;
  alt: string;
};

const tabs: Tab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    eyebrow: "The books, at a glance",
    title: "Know your profit the moment you make it",
    blurb:
      "Open Ledgr and the three numbers that matter are already waiting: income, expenses and net profit — in Malawian Kwacha, updated as you record.",
    bullets: [
      "Live income, expenses and net profit for the month",
      "Automatic month-on-month comparison so you see the trend",
      "VAT payable to MRA with the due date and days left",
      "Recent invoices and payments in one list",
    ],
    kind: "desktop",
    src: "/images/dashboard-web.svg",
    alt: "Ledgr desktop dashboard showing income, expenses, net profit and the VAT payable to MRA in Malawian Kwacha",
  },
  {
    id: "mobile",
    label: "Phone & offline",
    eyebrow: "Capture sales where you trade",
    title: "Record a sale at the market with no signal",
    blurb:
      "Ledgr runs on your phone and keeps working when the network drops. Entries are stored on your device and sync by themselves the moment you reconnect — nothing is lost.",
    bullets: [
      "Record income and expenses offline, sync automatically later",
      "Works in any browser — no app store, no download required",
      "Install it to your home screen like a normal app",
      "One account across phone, tablet and laptop",
    ],
    kind: "phone",
    src: "/images/dashboard.svg",
    alt: "Ledgr mobile dashboard showing net profit, income and expenses in Malawian Kwacha",
  },
  {
    id: "invoicing",
    label: "Invoices & VAT",
    eyebrow: "Get paid, stay compliant",
    title: "Professional invoices with the VAT already worked out",
    blurb:
      "Create a branded invoice, split VAT at 17.5% automatically and send a clean PDF — then let Ledgr track the PAYE, WHT and TEVETA dates that catch people out.",
    bullets: [
      "Automatic 17.5% VAT split on every invoice line",
      "One-tap PDF invoices you can send straight to a client",
      "PAYE, WHT & TEVETA due-date reminders before each filing",
      "Proper double-entry books behind every report",
    ],
    kind: "phone",
    src: "/images/invoice.svg",
    alt: "Ledgr VAT invoice on a phone showing the 17.5% VAT breakdown and total in Malawian Kwacha",
  },
];

// Who the product is actually for — the first question a visitor asks.
const businessTypes = [
  { icon: "🛒", label: "Shops & traders" },
  { icon: "📦", label: "Wholesalers" },
  { icon: "🧱", label: "Contractors" },
  { icon: "💼", label: "Consultants" },
  { icon: "🍲", label: "Restaurants & lodges" },
  { icon: "🚚", label: "Service providers" },
];

export default function ProductTour() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = tabs[active];

  // Standard tablist keyboard support: arrows move between tabs.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? (active + 1) % tabs.length
        : (active - 1 + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="tour" className="border-b border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Product tour
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Try it yourself before you sign up
          </h2>
          <p className="mt-4 text-ink-soft">
            Real screens from the app. {demo.available
              ? "Open the live demo and click around a sample business — no sign-up, no sales call."
              : "Tap through the screens below, or start a free account and use it for real in under a minute."}
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Product screenshots"
          onKeyDown={onKeyDown}
          className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-2"
        >
          {tabs.map((t, i) => {
            const selected = i === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tour-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`tour-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                type="button"
                onClick={() => setActive(i)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`tour-panel-${tab.id}`}
          aria-labelledby={`tour-tab-${tab.id}`}
          className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="order-2 lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {tab.eyebrow}
            </p>
            <h3 className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-ink">
              {tab.title}
            </h3>
            <p className="mt-4 leading-relaxed text-ink-soft">{tab.blurb}</p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {tab.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-700 text-[10px] text-white">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={tryUrl}
                {...(demo.available
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800"
              >
                {tryLabel} →
              </a>
              <a
                href={site.registerUrl}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                Create a free account
              </a>
              <Link
                href="/features"
                className="rounded-xl px-6 py-3.5 text-sm font-semibold text-ink-soft transition hover:text-brand-700"
              >
                See every feature
              </Link>
            </div>

            {demo.available && demo.showCredentials && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Demo login
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Email{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-ink ring-1 ring-slate-200">
                    {demo.email}
                  </code>{" "}
                  · Password{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-ink ring-1 ring-slate-200">
                    {demo.password}
                  </code>
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  A sample business with realistic figures. Please don&apos;t enter real
                  financial data.
                </p>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            {tab.kind === "desktop" ? (
              <BrowserMockup src={tab.src} alt={tab.alt} />
            ) : (
              <PhoneMockup src={tab.src} alt={tab.alt} />
            )}
          </div>
        </div>

        {/* Who it's for */}
        <div className="mt-14 border-t border-slate-100 pt-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-brand-700">
            Built for businesses like yours
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {businessTypes.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-sm"
              >
                <span aria-hidden>{b.icon}</span>
                {b.label}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-center text-sm text-ink-soft">
            If you sell anything and pay tax in Malawi, Ledgr is for you.{" "}
            <Link
              href="/customers"
              className="font-semibold text-brand-700 hover:underline"
            >
              See what it does for your kind of business →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
