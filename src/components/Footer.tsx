import Link from "next/link";
import { site, socials } from "@/lib/site";
import NewsletterForm from "@/components/NewsletterForm";

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link href={href} className="transition hover:text-brand-700">
                {label}
              </Link>
            ) : (
              <a href={href} className="transition hover:text-brand-700">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5" aria-label="Ledgr home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-lg font-bold text-white">
              L
            </span>
            <span className="text-xl font-bold text-ink">Ledgr</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-ink-soft">
            MWK-first accounting &amp; business management for growing Malawian SMEs.
          </p>
          <p className="mt-3 text-xs text-slate-500">🇲🇼 Made for Malawi &amp; SADC</p>
          <div className="mt-5 max-w-xs">
            <p className="text-xs font-semibold text-ink">Tax tips &amp; product news</p>
            <div className="mt-2">
              <NewsletterForm source="footer" compact />
            </div>
          </div>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Features", "/features"],
            ["Pricing", "/pricing"],
            ["How it works", "/#how"],
            ["Tax calculator", "/#calculator"],
            ["Download", "/#download"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About", "/about"],
            ["Customers", "/customers"],
            ["Blog", "/blog"],
            ["Contact", "/contact"],
            ["Sign in", site.loginUrl],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["FAQ", "/faq"],
          ]}
        />
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 pb-24 text-xs text-slate-500 sm:flex-row md:pb-6">
          <p>© {new Date().getFullYear()} Ledgr. All rights reserved.</p>
          <p>
            <a href={`mailto:${site.email}`} className="transition hover:text-brand-700">
              {site.email}
            </a>{" "}
            · Smart accounting for Malawian businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
