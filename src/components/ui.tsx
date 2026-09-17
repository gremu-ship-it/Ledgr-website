import Link from "next/link";
import { site } from "@/lib/site";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

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
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
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
            className="rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-800"
          >
            Get Started Free →
          </a>
          <Link
            href="/contact"
            className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10"
          >
            Talk to us
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-400">Free plan · No credit card · MWK-first</p>
      </div>
    </section>
  );
}
