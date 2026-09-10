// Privacy-friendly analytics (Plausible). Renders nothing unless
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set. No cookies, GDPR-friendly.
export default function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  const src =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
  return <script defer data-domain={domain} src={src} />;
}
