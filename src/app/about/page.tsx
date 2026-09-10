import type { Metadata } from "next";
import { PageHero, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Ledgr exists: world-class, MWK-first accounting for Malawian SMEs — offline-capable, MRA-aware and affordable.",
};

const values = [
  {
    icon: "🇲🇼",
    title: "Malawi first",
    desc: "MWK by default, MRA tax rules built in, and an app that works on a market-day data bundle — not retrofitted, designed in from day one.",
  },
  {
    icon: "🤝",
    title: "Owners, not accountants",
    desc: "Plain language, smart defaults and guardrails. If you can use WhatsApp, you can run your books on Ledgr.",
  },
  {
    icon: "🔒",
    title: "Your data is yours",
    desc: "Encrypted, backed up, exportable any time. We will never sell your data or lock it behind a ransom.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About Ledgr"
        title={
          <>
            World-class accounting, <span className="text-brand-600">built for Malawi</span>
          </>
        }
        sub="Most accounting software is built for London or New York — priced in dollars, assuming perfect internet and a finance degree. We built the opposite."
      />
      <section className="mx-auto max-w-3xl px-5 pb-6">
        <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            Ledgr started with a simple observation: millions of Malawian businesses run on
            paper books, memory and hope — not because owners don&apos;t care about their
            numbers, but because the available tools weren&apos;t made for them.
          </p>
          <p>
            So we built an accounting app that speaks Kwacha first, knows the MRA rulebook,
            works without internet, and installs on the phone already in your pocket. From
            the first sale at the market to VAT filing on the 25th, Ledgr walks with you.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            ["180+", "businesses getting started"],
            ["17.5%", "VAT handled automatically"],
            ["100%", "works offline"],
          ].map(([big, small]) => (
            <div
              key={small}
              className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm"
            >
              <p className="text-2xl font-extrabold text-brand-600">{big}</p>
              <p className="mt-1 text-xs text-ink-soft">{small}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-ink">
          What we believe
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{v.icon}</div>
              <h3 className="mt-3 text-lg font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand
        title="Come build with us"
        sub="Have feedback, a feature request, or want to partner? We'd love to hear from you."
      />
    </div>
  );
}
