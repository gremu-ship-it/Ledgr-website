"use client";

import { useState } from "react";
import { contactTopics, site } from "@/lib/site";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          company: data.get("company"),
          topic: data.get("topic"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-2xl text-white">
          ✓
        </div>
        <h3 className="text-xl font-bold text-ink">Message received!</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Thanks for reaching out — we usually reply within one business day.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name *" className={inputClass} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email address *"
          className={inputClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="phone" placeholder="Phone (optional)" className={inputClass} />
        <input name="company" placeholder="Business name (optional)" className={inputClass} />
      </div>
      <select name="topic" defaultValue="general" className={inputClass} aria-label="Topic">
        {contactTopics.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help? *"
        className={`${inputClass} resize-y`}
      />
      {status === "error" && (
        <p className="text-sm text-red-600">
          {error}{" "}
          <a href={`mailto:${site.email}`} className="font-semibold underline">
            Email us directly
          </a>
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
