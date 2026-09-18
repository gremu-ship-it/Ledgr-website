import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { sql } from "drizzle-orm";
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";
  const businessType =
    typeof body.businessType === "string" ? body.businessType.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const source =
    typeof body.source === "string" && body.source.trim() ? body.source.trim() : "waitlist";
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

  try {
    const [row] = await getDb()
      .insert(leads)
      .values({
        name,
        email,
        phone: phone || null,
        businessName: businessName || null,
        businessType: businessType || null,
        message: message || null,
        source,
      })
      .returning({ id: leads.id });

    // Add the person to the marketing layer and stitch their browsing to them.
    // Best effort by design: if this fails, the lead is still safely stored.
    await identifyContact({
      email,
      name,
      phone,
      businessName,
      businessType,
      source,
      marketingOptIn,
      event: "form_submit",
      eventName: source,
      request,
    });

    return Response.json({ ok: true, id: row.id });
  } catch {
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const [row] = await getDb()
      .execute<{ count: number }>(sql`select count(*)::int as count from ${leads}`)
      .then((r) => r.rows as { count: number }[]);
    return Response.json({ ok: true, count: row?.count ?? 0 });
  } catch {
    return Response.json({ ok: true, count: 0 });
  }
}
