import type { Metadata } from "next";
import { PageHero, CtaBand } from "@/components/ui";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Ledgr: pricing, offline mode, MRA compliance, data safety and using Ledgr across SADC.",
};

export default function FaqPage() {
  return (
    <div>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions? <span className="text-brand-600">Answered.</span>
          </>
        }
        sub="The things people ask us most. Anything else — just contact us."
      />
      <div className="-mt-6">
        <Faq />
      </div>
      <CtaBand
        title="Still curious?"
        sub="Try Ledgr free for yourself — or send us your question and get a human reply."
      />
    </div>
  );
}
