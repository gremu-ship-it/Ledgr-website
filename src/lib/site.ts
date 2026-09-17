export const site = {
  name: "Ledgr",
  tagline: "Smart accounting for Malawian businesses",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ledgr.mw",
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gremu.consultancy@gmail.com",
  liveUrl: "https://ledgr-react.vercel.app",
  registerUrl: "https://ledgr-react.vercel.app/register",
  loginUrl: "https://ledgr-react.vercel.app/login",
  dashboardUrl: "https://ledgr-react.vercel.app/dashboard",
  // WhatsApp line for direct enquiries (contact page, footer, sticky CTA).
  // Override with NEXT_PUBLIC_WHATSAPP_NUMBER if it ever changes.
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+265 881 444 487",
};

// wa.me deep link (digits only) with a friendly prefilled message.
export const whatsappUrl = `https://wa.me/${site.whatsappNumber.replace(
  /\D/g,
  "",
)}?text=${encodeURIComponent("Hello Ledgr! I have a question.")}`;

export type Social = { label: string; href: string };

// Social links render only when configured via env vars, so the site
// never ships dead "#" links — except WhatsApp, which defaults to the
// direct-enquiries number in `site.whatsappNumber`. Add in Vercel env or
// .env.local: NEXT_PUBLIC_X_URL, NEXT_PUBLIC_LINKEDIN_URL,
// NEXT_PUBLIC_FACEBOOK_URL, NEXT_PUBLIC_WHATSAPP_URL
export const socials: Social[] = (
  [
    { label: "X", href: process.env.NEXT_PUBLIC_X_URL },
    { label: "LinkedIn", href: process.env.NEXT_PUBLIC_LINKEDIN_URL },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    {
      label: "WhatsApp",
      href: process.env.NEXT_PUBLIC_WHATSAPP_URL || whatsappUrl,
    },
  ] as { label: string; href: string | undefined }[]
).filter((s): s is Social => Boolean(s.href));

export const businessTypes = [
  "Trader / Retailer",
  "Consultant",
  "Contractor",
  "Service provider",
  "Wholesaler",
  "Other",
];

export const contactTopics = [
  { value: "general", label: "General question" },
  { value: "sales", label: "Pricing & plans" },
  { value: "demo", label: "Request a demo" },
  { value: "support", label: "Product support" },
  { value: "partnership", label: "Partnership" },
];
