import { getDb } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { identifyContact } from "@/lib/contacts";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" && body.source.trim() ? body.source.trim() : "website";

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const existing = await getDb()
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      // Somebody signing up again after opting out is a real, deliberate
      // opt-in — the marketing layer records it as such and clears the
      // suppression, which is why this still runs on a repeat signup.
      await identifyContact({
        email,
        source,
        // Joining a list *is* the opt-in: the field is labelled as such on
        // every form that posts here.
        marketingOptIn: true,
        event: "newsletter_signup",
        eventName: source,
        request,
      });
      return Response.json({ ok: true, already: true });
    }

    await getDb().insert(newsletterSubscribers).values({ email, source });

    await identifyContact({
      email,
      source,
      marketingOptIn: true,
      event: "newsletter_signup",
      eventName: source,
      request,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 503 },
    );
  }
}
