"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const links = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Calculator", href: "/#calculator" },
  { label: "Customers", href: "/customers" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
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
        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-2 lg:hidden">
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
        </div>
      )}
    </header>
  );
}
