import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { identifyContact } from "@/lib/contacts";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = ["general", "sales", "support", "demo", "partnership"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const topicRaw = typeof body.topic === "string" ? body.topic.trim() : "general";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  // Only ever true when the visitor ticked the marketing box themselves.
  const marketingOptIn = body.marketingOptIn === true;

  if (!name) {
    return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return Response.json(
      { ok: false, error: "Please tell us a little more (at least 10 characters)." },
      { status: 400 },
    );
  }

  const topic = (TOPICS as readonly string[]).includes(topicRaw) ? topicRaw : "general";

  try {
    const [row] = await getDb()
      .insert(contactMessages)
      .values({
        name,
        email,
        phone: phone || null,
        company: company || null,
        topic,
        message,
      })
      .returning({ id: contactMessages.id });

    // Add the person to the marketing layer and stitch their browsing to them.
    // Best effort by design: if this fails, the message is still safely stored.
    await identifyContact({
      email,
      name,
      phone,
      businessName: company,
      source: `contact:${topic}`,
      marketingOptIn,
      event: "form_submit",
      eventName: `contact-${topic}`,
      request,
    });

    return Response.json({ ok: true, id: row.id });
  } catch {
    return Response.json(
      {
        ok: false,
        error:
          "We couldn't save your message right now. Please try again or email us directly.",
      },
      { status: 503 },
    );
  }
}
