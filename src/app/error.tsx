"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 text-center md:py-28">
      <p className="text-5xl" aria-hidden>
        🧾
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
        Something didn&apos;t add up
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        An unexpected error occurred. Try again — and if it keeps happening, let us know.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Try again
        </button>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
}
