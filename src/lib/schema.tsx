import { site } from "@/lib/site";
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
      "MWK-first, MRA-compliant accounting and business management app for Malawian SMEs.",
    email: site.email,
    areaServed: "MW",
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, Android, iOS, Windows, macOS",
    description:
      "MWK-first accounting for Malawian SMEs: invoicing with automatic 17.5% VAT, PAYE and WHT tracking, inventory, payroll and financial reports. Works offline.",
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "MWK" },
      { "@type": "Offer", name: "Growth", price: "100000", priceCurrency: "MWK" },
      { "@type": "Offer", name: "Pro", price: "200000", priceCurrency: "MWK" },
      { "@type": "Offer", name: "Enterprise", price: "500000", priceCurrency: "MWK" },
    ],
  };
}
