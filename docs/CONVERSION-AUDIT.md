# Ledgr marketing conversion audit

Audit date: 2026-09-18

## A. Already implemented

- The site already has a clear Malawi/MWK positioning, responsive marketing routes, a real dashboard visual, a one-click app demo (`/demo/enter`) and a separate read-only product tour (`/demo`).
- Pricing is centralized in `src/lib/pricing.ts` and shared by the homepage and `/pricing`, including transaction limits and a transaction-definition FAQ.
- VAT/PAYE calculator, FAQ, blog, sitemap, robots, Open Graph metadata, privacy/terms pages, contact, waitlist and newsletter forms exist.
- Plausible remains optional and lightweight. A first-party tracker already supports consent, cookieless pre-consent pageviews, CTA/demo/signup/WhatsApp/email/plan/calculator/form/newsletter events, first-touch UTM/referrer attribution and `?ref=` links.
- Lead/contact submissions are stored, and `identifyContact()` joins voluntarily submitted contacts to consented first-party analytics. `/admin` already provides contact, scoring and campaign views.
- Customer page correctly avoids invented testimonials and explains that real customer evidence is not yet available.
- Self-hosted fonts, local images, no unnecessary marketing dependencies and mobile-friendly layouts are already in place.

## B. Missing

- The hero's primary action was account registration rather than the lowest-friction interactive demo.
- Several global metadata/schema and hero strings called Ledgr “MRA-compliant” / “MRA tax compliant”, without evidence in this repository of a certification or compliance status. This is an avoidable trust and legal risk.
- The homepage used a live lead count and decorative numeric callouts that could read as social proof or product results; those are not needed to explain the product and should not be presented as evidence.

## C. Needs improvement

- Make the demo-versus-tour distinction explicit in the hero: try the product immediately, or see how it works without entering it.
- Use outcome-oriented hero copy and keep the real dashboard as the visual.
- Keep claims to capabilities evidenced by the existing product/site, and label calculator output as estimates rather than advice.
- Keep anonymous analytics anonymous and preserve UTM/referral attribution only until a visitor voluntarily submits a form.

## D. Recommended implementation

1. Make the one-click demo the hero primary CTA and the product tour the secondary CTA, with explicit labels and analytics-friendly names.
2. Remove unsupported MRA-compliance wording and replace it with accurate Malawi tax-tool language across metadata, hero and structured data.
3. Remove unneeded lead-count/social-proof and decorative financial-result callouts from the homepage.
4. Retain the existing analytics, consent, lead, admin and attribution architecture rather than introducing a second analytics or CRM system.
5. Document the audit and verification results in this repository.

## E. Not recommended

- No testimonial generation, fake customer stories, fabricated statistics or fake logos.
- No email gate before demo entry and no anonymous PII collection.
- No new CRM, lead-events table, analytics vendor, form dependency or schema migration: the existing `contacts`, analytics event stream and admin pages already cover the useful current funnel.
- No tax-advice claims or unverified MRA certification/compliance claim.
