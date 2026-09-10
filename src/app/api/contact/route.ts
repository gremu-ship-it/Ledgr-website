import { db } from "@/db";
import { contactMessages } from "@/db/schema";

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
    const [row] = await db
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
