"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(12,31,26,0.08)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-base font-bold text-white">
            L
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink">Start free today</p>
            <p className="text-[11px] text-slate-400">No card needed</p>
          </div>
        </div>
        <a
          href={site.registerUrl}
          className="ml-auto rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
