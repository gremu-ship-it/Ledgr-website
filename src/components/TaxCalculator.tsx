"use client";

import { useMemo, useState } from "react";

const VAT_RATE = 0.175;

// MRA monthly PAYE bands, effective January 2026 (MWK).
const PAYE_BANDS = [
  { upTo: 170_000, rate: 0 },
  { upTo: 1_570_000, rate: 0.3 },
  { upTo: 10_000_000, rate: 0.35 },
  { upTo: Infinity, rate: 0.4 },
];

function mwk(n: number): string {
  return "MWK " + Math.round(n).toLocaleString("en-MW");
}

function parseNum(v: string): number {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function calcPaye(gross: number): number {
  let tax = 0;
  let prev = 0;
  for (const band of PAYE_BANDS) {
    if (gross <= prev) break;
    const taxable = Math.min(gross, band.upTo) - prev;
    tax += taxable * band.rate;
    prev = band.upTo;
  }
  return tax;
}

export default function TaxCalculator() {
  const [tab, setTab] = useState<"vat" | "paye">("vat");

  // VAT mode
  const [sales, setSales] = useState("1,500,000");
  const [expenses, setExpenses] = useState("600,000");

  // PAYE mode
  const [salary, setSalary] = useState("450,000");

  const vat = useMemo(() => {
    const s = parseNum(sales);
    const e = parseNum(expenses);
    const outputVat = s * VAT_RATE;
    const inputVat = e * VAT_RATE;
    const payable = Math.max(outputVat - inputVat, 0);
    const netProfit = s - e;
    return { outputVat, inputVat, payable, netProfit };
  }, [sales, expenses]);

  const paye = useMemo(() => {
    const g = parseNum(salary);
    const tax = calcPaye(g);
    return { tax, net: g - tax, effective: g > 0 ? (tax / g) * 100 : 0 };
  }, [salary]);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <section id="calculator" className="bg-brand-50/60 py-14">
      <div className="mx-auto max-w-5xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Try it now
          </p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-ink">
            Malawi VAT &amp; PAYE calculator
          </h2>
          <p className="mt-4 text-ink-soft">
            See exactly what Ledgr works out for you automatically — in MWK, at MRA rates.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-brand-500/5">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-100">
            {(["vat", "paye"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-4 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-400 hover:text-ink"
                }`}
              >
                {t === "vat" ? "VAT & profit" : "PAYE (payroll)"}
              </button>
            ))}
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            {tab === "vat" ? (
              <>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Monthly sales (excl. VAT)
                    </span>
                    <input
                      inputMode="numeric"
                      value={sales}
                      onChange={(e) => setSales(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Monthly expenses (excl. VAT)
                    </span>
                    <input
                      inputMode="numeric"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <p className="text-xs text-slate-400">VAT charged at 17.5% (MRA).</p>
                </div>

                <div className="flex flex-col justify-center gap-3 rounded-2xl bg-ink p-6 text-white">
                  <Row label="Output VAT (on sales)" value={mwk(vat.outputVat)} />
                  <Row label="Input VAT (on expenses)" value={mwk(vat.inputVat)} />
                  <div className="my-1 h-px bg-white/10" />
                  <Row
                    label="VAT payable to MRA"
                    value={mwk(vat.payable)}
                    highlight
                  />
                  <Row label="Net profit" value={mwk(vat.netProfit)} muted />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Employee gross monthly salary
                    </span>
                    <input
                      inputMode="numeric"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <p className="text-xs text-slate-400">
                    Calculated on Malawi monthly PAYE bands (0% / 25% / 30% / 35%).
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3 rounded-2xl bg-ink p-6 text-white">
                  <Row label="PAYE tax" value={mwk(paye.tax)} highlight />
                  <Row label="Net (take-home) pay" value={mwk(paye.net)} />
                  <div className="my-1 h-px bg-white/10" />
                  <Row
                    label="Effective tax rate"
                    value={`${paye.effective.toFixed(1)}%`}
                    muted
                  />
                </div>
              </>
            )}
          </div>
          <p className="px-6 pb-6 text-center text-xs text-slate-400 sm:px-8">
            Estimates only. Ledgr applies the exact current MRA rates inside the app.
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm ${muted ? "text-slate-400" : "text-slate-300"}`}>
        {label}
      </span>
      <span
        className={`font-bold ${
          highlight ? "text-lg text-brand-400" : muted ? "text-slate-300" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
