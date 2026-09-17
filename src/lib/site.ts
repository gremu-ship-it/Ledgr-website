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

/**
 * Public demo account — a pre-seeded, read-only sample business visitors can
 * open without registering. The app is Supabase-auth only and has no standalone
 * demo mode, so the button goes to the app's login page and the credentials are
 * printed next to it.
 *
 * These defaults are PUBLIC BY DESIGN — they are rendered into the page HTML for
 * anyone to read. Only ever point this at an account whose data you are happy for
 * the whole internet to see. Override with env vars (no code change needed).
 * See DEMO.md.
 */
const demoUrlEnv = process.env.NEXT_PUBLIC_DEMO_URL?.trim() || "";
const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL?.trim() || "demo@ledgr.test";
const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD?.trim() || "gremu@1989";

export const demo = {
  /** Explicit demo route, else the app login page. */
  url: demoUrlEnv || site.loginUrl,
  email: demoEmail,
  password: demoPassword,
  /** True when a demo entry point is configured. */
  get available() {
    return this.url.length > 0;
  },
  /** Credentials are only shown if BOTH are set. */
  get showCredentials() {
    return Boolean(this.email && this.password);
  },
};

/** Where "try it" CTAs point: the demo when available, else free signup. */
export const tryUrl = demo.url || site.registerUrl;
export const tryLabel = demo.url ? "Try the live demo" : "Try it yourself free";

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
