import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/ui";
import NewsletterForm from "@/components/NewsletterForm";
import { posts, getPost, formatPostDate } from "@/lib/posts";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: `${post.title} — Ledgr`,
      description: post.excerpt,
      type: "article",
      url: `${site.siteUrl}/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <Link
            href="/blog"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            ← All guides
          </Link>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-700">
              {post.category}
            </span>
            <span className="text-slate-500">
              {formatPostDate(post.date)} · {post.readMinutes} min read
            </span>
          </div>
          <h1 className="mt-4 text-[clamp(1.9rem,4.5vw,2.8rem)] font-extrabold leading-tight tracking-tight text-ink">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-5 pb-8">
        {post.blocks.map((b, i) => {
          if (b.type === "h2") {
            return (
              <h2 key={i} className="mb-3 mt-9 text-xl font-bold text-ink">
                {b.text}
              </h2>
            );
          }
          if (b.type === "list") {
            return (
              <ul key={i} className="my-4 space-y-2.5">
                {b.items.map((item) => (
                  <li key={item} className="flex gap-3 text-[1.02rem] leading-relaxed text-ink-soft">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-700 text-[10px] text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          if (b.type === "tip") {
            return (
              <div
                key={i}
                className="my-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-[0.98rem] leading-relaxed text-ink"
              >
                <span className="font-bold text-brand-700">💡 Tip: </span>
                {b.text}
              </div>
            );
          }
          return (
            <p
              key={i}
              className="my-4 text-[1.02rem] leading-relaxed text-ink-soft"
            >
              {b.text}
            </p>
          );
        })}
        <p className="mt-8 rounded-2xl bg-slate-50 p-5 text-xs leading-relaxed text-slate-500">
          Disclaimer: this guide is general information, not tax advice. MRA rates and
          thresholds change — always confirm current figures on mra.mw or with your
          accountant before filing.
        </p>
      </article>

      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-ink">Do this automatically in Ledgr</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-soft">
            Everything in this guide — calculated, tracked and reminded. Start free.
          </p>
          <a
            href={site.registerUrl}
            className="mt-5 inline-block rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Get Started Free →
          </a>
        </div>
        {related.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-brand-200"
              >
                <p className="text-xs font-bold text-brand-700">{r.category}</p>
                <p className="mt-1.5 text-sm font-bold leading-snug text-ink">{r.title}</p>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8 rounded-3xl bg-ink p-8 text-center text-white">
          <h2 className="text-lg font-bold">Get new guides by email</h2>
          <p className="mt-1.5 text-sm text-slate-300">
            Roughly monthly. No spam, unsubscribe anytime.
          </p>
          <div className="mx-auto mt-4 max-w-md">
            <NewsletterForm source="blog-post" />
          </div>
        </div>
      </section>
      <CtaBand />
    </div>
  );
}
