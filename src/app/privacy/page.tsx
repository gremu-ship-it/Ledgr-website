import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ledgr collects, uses and protects your data.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-8 text-lg font-bold text-ink">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="my-3 leading-relaxed text-ink-soft">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        sub="Last updated: September 2026. Short version: your data is yours — we protect it, never sell it, and delete it when you ask."
      />
      <article className="mx-auto max-w-3xl px-5 pb-16">
        <H>1. What we collect</H>
        <P>
          When you use this website or the Ledgr app, we collect: account details you give
          us (name, email, phone, business name); business records you enter (transactions,
          invoices, payroll); messages you send us through forms; and basic technical data
          (device type, pages visited) via privacy-friendly, cookie-free analytics.
        </P>
        <H>2. How we use it</H>
        <P>
          We use your data to provide the service (your books, reports and reminders), to
          reply to your messages, to improve the product, and to meet legal obligations
          such as tax record-keeping. We do not sell your personal data, and we do not
          share it for advertising.
        </P>
        <H>3. Storage & security</H>
        <P>
          Data is encrypted in transit (TLS) and stored securely in managed cloud
          infrastructure with regular backups. A copy may be cached on your own device so
          offline mode works. Only you — and users you explicitly invite to your business
          — can see your books.
        </P>
        <H>4. Your rights</H>
        <P>
          You can export your data at any time (CSV/PDF), correct it, or ask us to delete
          your account and data by emailing {site.email}. We keep read-only backups for up
          to 90 days after deletion for disaster recovery, then they are purged.
        </P>
        <H>5. Cookies</H>
        <P>
          This marketing site uses no tracking cookies. Our analytics (Plausible) is
          cookie-free and does not identify you across sites. The Ledgr app itself uses
          strictly-necessary session storage to keep you signed in.
        </P>
        <H>6. Contact</H>
        <P>
          Questions about privacy? Email{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {site.email}
          </a>{" "}
          and we will respond within a few business days.
        </P>
      </article>
    </div>
  );
}
