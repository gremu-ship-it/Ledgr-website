import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20 text-center md:py-28">
      <p className="text-6xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
        This page wandered off the books
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        The link may be mistyped, or the page may have moved. Let&apos;s get you back on
        track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          ← Back home
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
