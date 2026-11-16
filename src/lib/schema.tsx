import { site } from "@/lib/site";
import { ANNUAL_DISCOUNT_PCT, billingSwitchLive, plans } from "@/lib/pricing";
import type { FaqItem } from "@/lib/faqs";

export type { FaqItem };

/**
 * FAQPage structured data (schema.org). Lets Google show the questions as a
 * rich result under the Ledgr listing — real extra search visibility for a
 * marketing site, and it costs nothing at runtime.
 */
export function faqSchema(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Renders a JSON-LD block. Server components only — no client JS shipped. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is authored in-repo, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.siteUrl,
    description:
      "Ledgr is a Malawi-focused business platform: POS and sales, stock, invoicing, expenses and accounting in Malawian Kwacha.",
    email: site.email,
    areaServed: "MW",
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "FinanceApplication",
    operatingSystem: "Web, Android, iOS, Windows, macOS",
    description:
      "Business software for Malawi: a point of sale that updates stock and the books, invoicing with 17.5% VAT, payroll with PAYE, multi-branch stock, budgets, bank reconciliation, VAT and WHT returns, financial reports and an AI assistant — all in Malawian Kwacha. Sales and entries can be captured offline and sync when the connection returns.",
    // Monthly offers are always published — both sides agree on them. Yearly
    // offers come on with the billing switch: a flat ANNUAL_DISCOUNT_PCT off
    // twelve months on every paid plan. They stay off while the application
    // still charges a per-tier discount, because structured data is a price
    // promise to a search engine and must not front-run checkout.
    offers: plans.flatMap((p) => {
      const monthly = {
        "@type": "Offer",
        name: p.name,
        price: String(p.monthly),
        priceCurrency: "MWK",
        billingIncrement: 1,
        unitText: "MONTH",
      };
      if (p.free || !billingSwitchLive) return [monthly];
      return [
        monthly,
        {
          "@type": "Offer",
          name: `${p.name} (yearly)`,
          price: String(p.yearly),
          priceCurrency: "MWK",
          billingIncrement: 12,
          unitText: "MONTH",
          description: `Twelve months, ${ANNUAL_DISCOUNT_PCT}% less than paying monthly.`,
        },
      ];
    }),
  };
}
