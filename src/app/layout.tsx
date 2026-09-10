import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import Analytics from "@/components/Analytics";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Ledgr — Smart accounting for Malawian businesses",
    template: "%s — Ledgr",
  },
  description:
    "Ledgr is an MWK-first, MRA-compliant accounting PWA for Malawian SMEs. Works offline, installs on Android, and keeps you on top of VAT, PAYE & WHT.",
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
      "MWK-first accounting & business management for growing Malawian SMEs. Offline-ready, MRA tax compliant, mobile-first.",
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
        <Analytics />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <StickyCta />
      </body>
    </html>
  );
}
