import type { Metadata } from "next";
import { PageHero, CtaBand } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Ledgr exists: business software built for Malawi — the till, the stock and the books in one place, in Kwacha, working with or without a connection.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: "🇲🇼",
    title: "Malawi first",
    desc: "MWK by default, MRA tax rules built in, and an app that works on a market-day data bundle — not retrofitted, designed in from day one.",
  },
  {
    icon: "🤝",
    title: "Owners and their teams",
    desc: "Plain language, sensible defaults and guardrails. A cashier should be productive in ten minutes; an owner shouldn't need a finance degree to read the result.",
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
            Business software, <span className="text-brand-700">built for Malawi</span>
          </>
        }
        sub="Most of this software is built for London or New York — priced in dollars, assuming perfect internet and a finance degree. We built the opposite."
      />
      <section className="mx-auto max-w-3xl px-5 pb-6">
        <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            Ledgr started with a simple observation: most businesses here run on paper
            books, memory and hope — not because owners don&apos;t care about their
            numbers, but because the available tools weren&apos;t made for them.
          </p>
          <p>
            So we started with the books, in Kwacha, knowing the MRA rulebook, working
            without internet and running on the phone and computer you already have.
            Then we followed the work backwards. Numbers come from somewhere: a sale
            at a counter, stock going out of a door, cash in a drawer. So Ledgr now
            carries that end of the business too — a till, a product list, stock per
            branch — and lands all of it in the same books.
          </p>
          <p>
            The point isn&apos;t to become an everything-system. It is that a business
            shouldn&apos;t have to re-type its own day into a second app to find out
            whether it made money.
          </p>
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
