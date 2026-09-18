"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contacts } from "@/db/schema";

/**
 * Stops all marketing email for the contact holding this token.
 *
 * Public by design — it's the link in the footer of every message — and
 * intentionally one-directional: there is no action anywhere that subscribes
 * somebody without a fresh, explicit opt-in.
 */
export async function confirmUnsubscribeAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") || "");
  if (!token) return;

  try {
    await getDb()
      .update(contacts)
      .set({ unsubscribedAt: new Date(), marketingOptIn: false })
      .where(eq(contacts.unsubscribeToken, token));
  } catch {
    // Even a database hiccup shouldn't look like a failure to the visitor —
    // nothing more will be sent either way once they've asked to stop.
  }

  redirect(`/unsubscribe?token=${encodeURIComponent(token)}&done=1`);
}
