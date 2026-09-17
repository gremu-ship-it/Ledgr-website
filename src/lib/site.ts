/**
 * Where the app lives. Everything this site sends a visitor *into* — sign-up,
 * sign-in, the dashboard and the demo — is derived from this one origin, so
 * moving the app to a custom domain is one env var (NEXT_PUBLIC_APP_URL) rather
 * than a hunt through components.
 *
 * Defaults to the domain README/DEPLOY document as the app today. When
 * `app.ledgr.com` is serving the app, set NEXT_PUBLIC_APP_URL and every link
 * moves together. `NEXT_PUBLIC_*` values are inlined at build time, so a change
 * here needs a redeploy.
 */
const appOrigin = (
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ledgr-react.vercel.app"
).replace(/\/+$/, "");

export const site = {
  name: "Ledgr",
  tagline: "Smart accounting for Malawian businesses",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ledgr.mw",
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "gremu.consultancy@gmail.com",
  appUrl: appOrigin,
  liveUrl: appOrigin,
  registerUrl: `${appOrigin}/register`,
  loginUrl: `${appOrigin}/login`,
  dashboardUrl: `${appOrigin}/dashboard`,
  // WhatsApp line for direct enquiries (contact page, footer, sticky CTA).
  // Override with NEXT_PUBLIC_WHATSAPP_NUMBER if it ever changes.
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+265 881 444 487",
};

/**
 * The public demo.
 *
 * `/demo/enter` is a **one-click** entry point served by the app: it seeds a
 * realistic Malawian business into the visitor's own browser, signs them in as
 * the sample owner and lands them on the dashboard. No account, no password, no
 * Supabase user and no credentials to leak — nothing is sent to a server. This
 * site's entire side of that bargain is a link.
 *
 * `/demo` is the static, read-only product tour: real screens, nothing written
 * and nobody signed in. It is the lighter option for visitors who only want to
 * look, so both are offered wherever a demo call to action appears.
 *
 * The app's own DEMO.md documents the seeded dataset and the guardrails; this
 * repo's DEMO.md covers what the marketing site has to get right.
 */
const DEFAULT_DEMO_ENTER_URL = `${appOrigin}/demo/enter`;
const DEFAULT_DEMO_TOUR_URL = `${appOrigin}/demo`;

/**
 * Kill switch. Defaults to ON (the demo is enabled out of the box), but
 * NEXT_PUBLIC_DEMO_ENABLED=false removes every demo call to action on the site
 * without a code change — which is what you want if the demo route ever breaks.
 */
const demoDisabled = ["0", "false", "off", "no"].includes(
  (process.env.NEXT_PUBLIC_DEMO_ENABLED ?? "true").trim().toLowerCase(),
);

const DEFAULT_DEMO_EMAIL = "demo@ledgr.test";

/**
 * The identity the demo signs a visitor in as. It only ever labels the demo —
 * there is no password anywhere on this site, and `demo@ledgr.test` cannot sign
 * in for real, because `.test` is a reserved TLD (RFC 2606) and the demo lives
 * in the browser. Override if the app's demo identity changes.
 */
const demoEmailRaw = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const demoEmail = demoDisabled
  ? ""
  : (demoEmailRaw === undefined ? DEFAULT_DEMO_EMAIL : demoEmailRaw.trim());
const demoUrlEnv = process.env.NEXT_PUBLIC_DEMO_URL?.trim() || "";

export const demo = {
  /** One-click entry: seeds the sample books and lands on the dashboard. */
  url: demoDisabled ? "" : demoUrlEnv || DEFAULT_DEMO_ENTER_URL,
  /** Read-only tour of real screens — no sign-in, nothing written. */
  tourUrl: demoDisabled ? "" : DEFAULT_DEMO_TOUR_URL,
  /** Whose books the visitor is looking at, shown so nobody has to wonder. */
  email: demoEmail,

  /** True when a demo entry point is configured. */
  get available() {
    return !demoDisabled && this.url.length > 0;
  },
  /** Show the demo identity only while the demo is on and one is configured. */
  get showEmail() {
    return !demoDisabled && Boolean(this.email);
  },

  /**
   * The entry URL tagged with the surface that sent the visitor, e.g.
   * `demo.link("hero")` → `…/demo/enter?ref=hero`. The app preserves query
   * parameters on that route, so the tag survives the hop and campaign links
   * like `?ref=instagram-bio` work the same way.
   */
  link(ref?: string) {
    if (!this.url) return "";
    if (!ref) return this.url;
    const [base, search] = this.url.split("?");
    const params = new URLSearchParams(search);
    params.set("ref", ref);
    return `${base}?${params.toString()}`;
  },
};

/**
 * Where a "try it" CTA points is a call-site decision, because the demo link is
 * tagged with the surface that sent the visitor:
 *
 *     href={demo.available ? demo.link("hero") : site.registerUrl}
 *
 * There is deliberately no shared `tryUrl` helper any more — every CTA used to
 * carry its own fallback anyway, and one helper meant one label ("Try the live
 * demo") applied to surfaces where it read badly.
 */

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
