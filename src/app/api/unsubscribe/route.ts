import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { contacts } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe, for the `List-Unsubscribe` header mail clients use.
 * Accepts the token either in the query string or in a form body, so both
 * `List-Unsubscribe: <url>` and `List-Unsubscribe-Post: One-Click` work.
 *
 * Deliberately unauthenticated — but it needs the unguessable per-contact
 * token, and the only thing it can do is stop email. There is no "subscribe"
 * here for exactly that reason.
 */
async function unsubscribe(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let token = url.searchParams.get("token");

  if (!token && request.method === "POST") {
    try {
      const body = (await request.json()) as { token?: string };
      token = body.token ?? null;
    } catch {
      try {
        const form = await request.formData();
        token = String(form.get("token") || "") || null;
      } catch {
        token = null;
      }
    }
  }

  if (!token) {
    return Response.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  try {
    const [row] = await getDb()
      .update(contacts)
      .set({ unsubscribedAt: new Date(), marketingOptIn: false })
      .where(eq(contacts.unsubscribeToken, token))
      .returning({ email: contacts.email });

    if (!row) {
      return Response.json({ ok: false, error: "Unknown token" }, { status: 404 });
    }

    // A mail client posting one-click expects a bare 200.
    if (request.method === "POST" && request.headers.get("accept")?.includes("application/json")) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: true, email: row.email });
  } catch {
    return Response.json({ ok: false, error: "Unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  return unsubscribe(request);
}

/**
 * A GET never changes anything. Corporate mail scanners fetch links before a
 * human sees them, and an unsubscribe that fires on a prefetch would quietly
 * remove engaged people from the list. So this redirects to the confirmation
 * page; one-click POST (above) is what mail clients use.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";

  // Behind a proxy (Vercel, Cloudflare) `request.url` can carry the internal
  // host, so prefer the forwarded headers the platform actually sets.
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");

  const target = new URL("/unsubscribe", `${proto}://${host}`);
  if (token) target.searchParams.set("token", token);
  return Response.redirect(target, 302);
}
