import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";

// Inter is self-hosted (variable font, latin subset, wght axis) so builds never
// depend on reaching fonts.googleapis.com. See src/app/fonts/README.md.
const inter = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Ledgr — Run your business. Know your numbers.",
    template: "%s — Ledgr",
  },
  description:
    "Ledgr brings sales, POS, stock, expenses, invoicing and accounting together in one place, in Kwacha, for businesses in Malawi. Works on a phone or a computer, online or off.",
  keywords: [
    "business management software Malawi",
    "accounting software Malawi",
    "POS software Malawi",
    "inventory management Malawi",
    "SME accounting Malawi",
    "VAT PAYE WHT Malawi",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ledgr — Run your business. Know your numbers.",
    description:
      "Sales, POS, stock, expenses, invoicing and accounting in one place — built for businesses in Malawi.",
    type: "website",
    url: site.siteUrl,
    siteName: "Ledgr",
    locale: "en_MW",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ledgr — Run your business. Know your numbers.",
    description:
      "Sales, POS, stock, expenses, invoicing and accounting in one place — built for businesses in Malawi.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ledgr",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d9e75",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-ink antialiased">
        {/* Chrome, analytics and the cookie banner live in the (site) layout so
            the internal dashboard at /admin stays clean and untracked. */}
        {children}
      </body>
    </html>
  );
}
