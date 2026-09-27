import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, CtaBand } from "@/components/ui";
import Faq from "@/components/Faq";
import { faqs } from "@/lib/faqs";
import { faqSchema, JsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about Ledgr: does it have a POS, can a cashier use it, does a sale update stock, branch reporting, offline working, Malawi VAT and pricing.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div>
      <JsonLd data={faqSchema(faqs)} />
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions? <span className="text-brand-700">Answered.</span>
          </>
        }
        sub={
          <>
            The things people ask us most. Anything else —{" "}
            <Link
              href="/contact"
              className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition hover:decoration-brand-700"
            >
              contact us
            </Link>
            .
          </>
        }
      />
      <div className="-mt-6">
        <Faq />
      </div>
      <CtaBand
        title="Still curious?"
        sub="Try Ledgr on your own numbers — or send us your question and a person will answer it."
      />
    </div>
  );
}
