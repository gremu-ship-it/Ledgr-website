"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is Ledgr really free?",
    a: "Yes. The Free plan is free forever and includes a basic dashboard and reports plus income and expense tracking for up to 50 transactions a month. Paid plans unlock bank reconciliation, AI insights, API access and higher limits.",
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

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Questions &amp; answers
        </p>
        <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
          Everything you need to know
        </h2>
      </div>
      <div className="mt-8 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-brand-50/40"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-ink sm:text-base">{f.q}</span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 text-brand-700 transition ${
                    isOpen ? "rotate-45 bg-brand-700 text-white" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
