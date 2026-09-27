"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import BrowserMockup from "@/components/BrowserMockup";
import PhoneMockup from "@/components/PhoneMockup";
import { businessSegments, demo, site } from "@/lib/site";

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
  /** Address shown in the browser chrome, so each screen reads as a real page. */
  url?: string;
};

/**
 * The order is the order a business works in: see where you are, sell, keep
 * stock straight, bill and stay compliant, then do all of it away from the
 * desk. POS sits second rather than last because it is where most of the day's
 * activity actually enters Ledgr.
 *
 * Every bullet below maps to something the application does today. Nothing
 * here is taken from a roadmap, a prototype or a migration that has not run.
 */
const tabs: Tab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    eyebrow: "The whole business, one screen",
    title: "Know where you stand without asking anyone",
    blurb:
      "Open Ledgr and the numbers are already there: what came in, what went out, what you are owed and what you owe MRA — in Kwacha, updated as your business records it.",
    bullets: [
      "Income, expenses and net profit for the month, with last month for comparison",
      "Money owed to you, and how many invoices it is sitting in",
      "VAT accrued for the period and whether it is payable or refundable",
      "Recent entries as they land, whoever recorded them",
    ],
    kind: "desktop",
    src: "/images/dashboard-web.svg",
    alt: "Ledgr dashboard showing income, expenses, net profit and VAT payable to MRA in Malawian Kwacha",
    url: "ledgr-react.vercel.app/dashboard",
  },
  {
    id: "pos",
    label: "POS",
    eyebrow: "The till",
    title: "Sell faster. Keep the books connected.",
    blurb:
      "Give your sales team a simple till while you keep visibility over sales, stock and business performance. A cashier sees the till and little else — you see what it did.",
    bullets: [
      "Scan a barcode or search by name to build the sale",
      "Cash, Airtel Money, TNM Mpamba, bank transfer, card or on credit — split across more than one if you need to",
      "Print a receipt, or send it straight to a Bluetooth thermal printer",
      "Open a shift with a float, record cash in and out, close it against the counted drawer and print the Z-report",
      "Refunds and voids need a manager's approval when you say they do",
      "Discount limits per role, so nobody quietly gives the shop away",
    ],
    kind: "desktop",
    src: "/images/pos.svg",
    alt: "Ledgr point of sale showing a product catalogue, a cart of three items, payment methods and the net payable total in Malawian Kwacha",
    url: "ledgr-react.vercel.app/pos",
  },
  {
    id: "stock",
    label: "Stock",
    eyebrow: "What you actually have",
    title: "Stock that moves when you sell",
    blurb:
      "Every sale at the till takes the items off the shelf it sold them from. No separate stock book, no Friday-afternoon reconciliation.",
    bullets: [
      "Quantity on hand per branch or warehouse, not one blurred total",
      "Sales, transfers and goods received all show up in the same movement history",
      "Reorder levels so slow-moving and about-to-run-out are both obvious",
      "Stock valued at weighted average cost, and cost of sales posted with the sale",
    ],
    kind: "desktop",
    src: "/images/stock.svg",
    alt: "Ledgr stock screen listing products with quantity on hand per branch, low-stock warnings and recent stock movements",
    url: "ledgr-react.vercel.app/products",
  },
  {
    id: "invoicing",
    label: "Invoicing & VAT",
    eyebrow: "Get paid, stay compliant",
    title: "Invoices with the VAT already worked out",
    blurb:
      "Bill a customer properly, split VAT at 17.5% automatically and send a clean PDF — then let Ledgr keep the PAYE, WHT and VAT dates in front of you.",
    bullets: [
      "17.5% VAT handled per line, including zero-rated and exempt items",
      "PDF invoices you can send straight to a customer",
      "Outstanding invoices tracked, so you know who has not paid",
      "PAYE, WHT, VAT and the TEVET levy shown with their due dates",
    ],
    kind: "phone",
    src: "/images/invoice.svg",
    alt: "Ledgr VAT invoice on a phone showing the 17.5% VAT breakdown and total in Malawian Kwacha",
  },
  {
    id: "mobile",
    label: "Mobile & offline",
    eyebrow: "Where you actually trade",
    title: "Keep selling when the network stops",
    blurb:
      "Ledgr runs in a browser on the phone, tablet or computer you already own. When the connection drops, sales and entries are kept on the device and sync by themselves once you are back.",
    bullets: [
      "Sales and expenses recorded offline, synced automatically later",
      "Nothing to install from an app store — add it to your home screen instead",
      "One account across phone, tablet and laptop",
      "Take the reports home with you; the shop keeps trading",
    ],
    kind: "phone",
    src: "/images/dashboard.svg",
    alt: "Ledgr on a phone showing net profit, income and expenses in Malawian Kwacha",
  },
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
            See it before you sign up
          </h2>
          <p className="mt-4 text-ink-soft">
            The screens your team would use. {demo.available
              ? "Open the live demo and click around a sample Malawian business — no sign-up, no sales call."
              : "Tap through them below, or start a free account and use it for real in under a minute."}
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Product screenshots"
          onKeyDown={onKeyDown}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-2"
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
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
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
                href={site.registerUrl}
                className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800"
              >
                Try Ledgr →
              </a>
              <Link
                href="/features"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                See every feature
              </Link>
            </div>

            {demo.available && demo.showEmail && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  No sign-up, no password
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  The demo opens the full app signed in as{" "}
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-ink ring-1 ring-slate-200">
                    {demo.email}
                  </code>{" "}
                  on a sample business with realistic Malawian figures — including an
                  open till shift you can sell from. It lives in your own browser, so
                  nothing is sent anywhere — and please don&apos;t enter real financial
                  data.
                </p>
                {demo.tourUrl && (
                  <p className="mt-2 text-xs text-slate-500">
                    Prefer to just look?{" "}
                    <a
                      href={demo.tourUrl}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      See the 1-minute tour
                    </a>{" "}
                    — real screens, and nothing is written.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            {tab.kind === "desktop" ? (
              <BrowserMockup src={tab.src} alt={tab.alt} url={tab.url} />
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
            {businessSegments.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-sm"
              >
                <span aria-hidden>{b.icon}</span>
                {b.label}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-ink-soft">
            The till is for businesses that sell face to face. If you invoice instead
            — a consultant, a contractor, a service business — you skip it and use the
            same invoicing, expenses, tax and reports.{" "}
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
