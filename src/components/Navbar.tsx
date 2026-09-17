"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/ui";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </svg>
  );
}

const links = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Calculator", href: "/#calculator" },
  { label: "Customers", href: "/customers" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Ledgr home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-lg font-bold text-white shadow-md shadow-brand-500/30">
            L
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">Ledgr</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-ink-soft lg:flex">
          {links.map((l) => {
            const active =
              l.href === "/#calculator"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`transition hover:text-brand-700 ${active ? "text-brand-700" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2.5 sm:flex">
          <a
            href={site.loginUrl}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-brand-700"
          >
            Sign in
          </a>
          <a
            href={site.registerUrl}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-800"
          >
            Get Started Free
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        // Scrollable so the contact block stays reachable on short screens.
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-slate-100 bg-white px-5 pb-5 pt-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-50 hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <a
              href={site.loginUrl}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-ink"
            >
              Sign in
            </a>
            <a
              href={site.registerUrl}
              className="rounded-xl bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started Free
            </a>
          </div>

          {/* Direct contact details — one tap away from any page on mobile. */}
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Talk to us
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-3 rounded-xl bg-[#25D366] px-3.5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5b]"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              <span className="min-w-0">
                <span className="block leading-tight">WhatsApp</span>
                <span className="block truncate text-xs font-medium text-white/90">
                  {site.whatsappNumber}
                </span>
              </span>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
            >
              <MailIcon className="h-5 w-5 shrink-0 text-brand-700" />
              <span className="min-w-0">
                <span className="block leading-tight">Email</span>
                <span className="block truncate text-xs font-medium text-slate-500">
                  {site.email}
                </span>
              </span>
            </a>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 block px-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              Or send a message from the contact form →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
