import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Ledgr team — sales, demos, support and partnerships. We usually reply within one business day.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to a <span className="text-brand-700">human</span>
          </>
        }
        sub="Questions about plans, a demo for your team, or help with setup — send a message and we'll reply within one business day."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-700">
              Email us
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 block text-lg font-bold text-ink hover:text-brand-700"
            >
              {site.email}
            </a>
            <p className="mt-1 text-sm text-ink-soft">
              Best for anything detailed — attach screenshots if it helps.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-700">
              Already using Ledgr?
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Jump straight back into your books:
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <a
                href={site.dashboardUrl}
                className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                Open dashboard
              </a>
              <a
                href={site.loginUrl}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
              >
                Sign in
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-ink p-6 text-white">
            <h2 className="font-bold">Want a guided demo?</h2>
            <p className="mt-1.5 text-sm text-slate-300">
              Choose “Request a demo” in the form and tell us about your business — we&apos;ll
              set up a walkthrough at a time that suits you.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-500/5 sm:p-8">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
