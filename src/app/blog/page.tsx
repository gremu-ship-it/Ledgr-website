import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import NewsletterForm from "@/components/NewsletterForm";
import { posts, formatPostDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical guides to Malawi tax and small-business finance: VAT, PAYE, withholding tax, invoicing and more.",
};

export default function BlogPage() {
  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Tax & money guides, <span className="text-brand-600">in plain language</span>
          </>
        }
        sub="Practical explainers on Malawi tax and small-business finance — no jargon, no accounting degree required."
      />
      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <a
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-700">
                  {p.category}
                </span>
                <span className="text-slate-400">
                  {formatPostDate(p.date)} · {p.readMinutes} min read
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold leading-snug text-ink transition group-hover:text-brand-600">
                {p.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.excerpt}</p>
              <span className="mt-4 text-sm font-semibold text-brand-600">
                Read guide →
              </span>
            </a>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-slate-100 bg-brand-50/60 p-8 text-center">
          <h2 className="text-lg font-bold text-ink">Get new guides by email</h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Tax tips and product news, roughly monthly. No spam, unsubscribe anytime.
          </p>
          <div className="mt-4">
            <NewsletterForm source="blog" />
          </div>
        </div>
      </section>
    </div>
  );
}
