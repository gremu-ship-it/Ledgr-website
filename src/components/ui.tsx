import { site } from "@/lib/site";

export function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 80% -10%, rgba(29,158,117,0.18), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-14 text-center md:py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {sub && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-soft">{sub}</p>}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Ready to balance your books?",
  sub = "Join hundreds of Malawian businesses running calmer finances with Ledgr.",
}: {
  title?: string;
  sub?: string;
}) {
  return (
    <section className="bg-ink py-14 text-white">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">{sub}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={site.registerUrl}
            className="rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600"
          >
            Get Started Free →
          </a>
          <a
            href="/contact"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10"
          >
            Talk to us
          </a>
        </div>
        <p className="mt-5 text-xs text-slate-400">Free plan · No credit card · MWK-first</p>
      </div>
    </section>
  );
}
