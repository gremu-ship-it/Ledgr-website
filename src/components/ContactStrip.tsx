import Link from "next/link";
import { site, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui";

type Props = {
  title?: string;
  sub?: string;
  /** Optional extra detail line, e.g. on the pricing page. */
  note?: string;
};

/**
 * Compact "talk to us" band. Shown after the FAQ on the landing page and on
 * other high-intent pages, so visitors who aren't ready to self-serve can still
 * start a conversation in one tap. The wording matches the /contact page and
 * the CTA bands — one name for one action, everywhere.
 */
export default function ContactStrip({
  title = "Talk to us",
  sub = "Have a question about Ledgr, pricing or setup? Talk to us directly. We'll help you work out whether Ledgr fits the way your business operates — and say so if it doesn't.",
  note,
}: Props) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-b from-brand-50/70 to-white p-7 shadow-sm sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-tight text-ink">
                {title}
              </h2>
              <p className="mt-3 max-w-xl text-ink-soft">{sub}</p>
              {note && <p className="mt-2 max-w-xl text-sm text-slate-500">{note}</p>}
            </div>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#1ebe5b]"
              >
                <WhatsAppIcon className="h-6 w-6 shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">
                    Chat on WhatsApp
                  </span>
                  <span className="block truncate text-xs font-medium text-white/90">
                    {site.whatsappNumber}
                  </span>
                </span>
                <span className="ml-auto text-lg leading-none" aria-hidden>
                  →
                </span>
              </a>

              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-ink shadow-sm transition hover:border-brand-300 hover:text-brand-700"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center text-lg" aria-hidden>
                  ✉️
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">Email us</span>
                  <span className="block truncate text-xs font-medium text-slate-500">
                    {site.email}
                  </span>
                </span>
                <span className="ml-auto text-lg leading-none" aria-hidden>
                  →
                </span>
              </a>

              <Link
                href="/contact"
                className="block rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                Send us a message
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
