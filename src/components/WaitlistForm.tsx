"use client";

import { useState } from "react";
import { businessTypes } from "@/lib/site";

type Props = {
  source?: string;
  variant?: "card" | "inline";
};

export default function WaitlistForm({ source = "waitlist", variant = "card" }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          businessName: data.get("businessName"),
          businessType: data.get("businessType"),
          source,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Something went wrong.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-700 text-2xl text-white">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-ink">You&apos;re on the list! 🎉</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Thanks for your interest in Ledgr. We&apos;ll reach out with early access and
          setup help. In the meantime, you can start using Ledgr right now.
        </p>
        <a
          href="https://ledgr-react.vercel.app/register"
          className="mt-5 inline-flex rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Get Started Free →
        </a>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Early access signup">
      <div className={variant === "card" ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          aria-label="Your name"
          className={inputClass}
        />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          aria-label="Email address"
          className={inputClass}
        />
      </div>
      <div className={variant === "card" ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone (optional)"
          aria-label="Phone (optional)"
          className={inputClass}
        />
        <input
          name="businessName"
          autoComplete="organization"
          placeholder="Business name (optional)"
          aria-label="Business name (optional)"
          className={inputClass}
        />
      </div>
      <select
        name="businessType"
        defaultValue=""
        aria-label="What kind of business? (optional)"
        className={inputClass}
      >
        <option value="" disabled>
          What kind of business? (optional)
        </option>
        {businessTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Join the early access list"}
      </button>
      <p className="text-center text-xs text-slate-500">
        No spam. We&apos;ll only contact you about Ledgr.
      </p>
    </form>
  );
}
