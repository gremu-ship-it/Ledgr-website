import { site } from "@/lib/site";
import { annualTotal, plans } from "@/lib/pricing";
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
      "Business software for Malawi: a point of sale that updates stock and the books, invoicing with 17.5% VAT, expenses, payroll, multi-branch stock and financial reports — all in Malawian Kwacha. Works offline.",
    offers: plans.flatMap((p) => {
      const monthly = {
        "@type": "Offer",
        name: `${p.name} (monthly)`,
        price: String(p.monthly),
        priceCurrency: "MWK",
      };
      if (p.free) return [monthly];
      return [
        monthly,
        {
          "@type": "Offer",
          name: `${p.name} (yearly)`,
          price: String(annualTotal(p.monthly)),
          priceCurrency: "MWK",
        },
      ];
    }),
  };
}
