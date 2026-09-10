"use client";

import { useState } from "react";

export default function NewsletterForm({
  source = "website",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), source }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700"
      >
        ✓ You&apos;re subscribed. Welcome aboard!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Newsletter signup"
      className={compact ? "flex flex-wrap gap-2" : "mx-auto flex max-w-md flex-wrap gap-2"}
    >
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@business.mw"
        aria-label="Email address"
        className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
