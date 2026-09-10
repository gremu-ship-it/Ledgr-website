import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Ledgr.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 text-lg font-bold text-ink">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="my-3 leading-relaxed text-ink-soft">{children}</p>;
}

export default function TermsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        sub="Last updated: September 2026. By using Ledgr you agree to these terms."
      />
      <article className="mx-auto max-w-3xl px-5 pb-16">
        <H>1. The service</H>
        <P>
          Ledgr provides cloud accounting software for small businesses, including
          invoicing, expense tracking, payroll, inventory and tax calculations. Tax
          features apply published MRA rates but do not constitute professional tax advice
          — you remain responsible for your filings.
        </P>
        <H>2. Your account</H>
        <P>
          You must provide accurate information when registering and keep your password
          confidential. You are responsible for activity under your account and for the
          users you invite to your business.
        </P>
        <H>3. Plans & payment</H>
        <P>
          The Free plan is free forever. Paid plans are billed monthly in MWK. You can
          upgrade, downgrade or cancel at any time; downgrades and cancellations take
          effect at the end of the current billing month. Fees already paid are
          non-refundable except where required by law.
        </P>
        <H>4. Your data</H>
        <P>
          You own your business data. You can export it at any time, including after
          cancelling. If your account is inactive or cancelled, we retain a read-only copy
          for 90 days and then delete it. See our Privacy Policy for details.
        </P>
        <H>5. Acceptable use</H>
        <P>
          You agree not to misuse the service — including attempting to access other users
          data, disrupting the service, or using Ledgr for unlawful activity. We may
          suspend accounts that breach these terms.
        </P>
        <H>6. Availability & liability</H>
        <P>
          We work hard to keep Ledgr available but do not guarantee uninterrupted service.
          To the maximum extent permitted by law, Ledgr&apos;s liability is limited to the
          fees you paid in the 12 months before the claim.
        </P>
        <H>7. Changes & contact</H>
        <P>
          We may update these terms as the product evolves; material changes will be
          communicated in-app or by email. Questions? Contact us at{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {site.email}
          </a>
          .
        </P>
      </article>
    </div>
  );
}
