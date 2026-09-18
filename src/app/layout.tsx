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
    default: "Ledgr — Smart accounting for Malawian businesses",
    template: "%s — Ledgr",
  },
  description:
    "Ledgr is an MWK-first, MRA-compliant accounting app for Malawian SMEs. Works on your phone and computer, offline-capable, and keeps you on top of VAT, PAYE & WHT.",
  keywords: [
    "Malawi accounting software",
    "MWK accounting",
    "MRA tax compliance",
    "VAT PAYE WHT Malawi",
    "SME accounting app",
    "offline accounting PWA",
  ],
  openGraph: {
    title: "Ledgr — Built for Malawi. Works everywhere.",
    description:
      "MWK-first accounting for growing Malawian SMEs. Phone and desktop, offline-ready, MRA tax compliant.",
    type: "website",
    url: site.siteUrl,
    siteName: "Ledgr",
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
