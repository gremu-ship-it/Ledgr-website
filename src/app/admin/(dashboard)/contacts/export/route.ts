import { isAdmin } from "@/lib/admin-auth";
import { filterBySegment, listAudience } from "@/lib/marketing";

export const dynamic = "force-dynamic";

/** Escapes one CSV cell. Quotes are doubled, per RFC 4180. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    value instanceof Date ? value.toISOString() : typeof value === "string" ? value : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * CSV export of contacts, optionally narrowed to one segment
 * (`/admin/contacts/export?segment=hot`). Useful for a mail merge, a phone
 * campaign, or handing a list to someone else in the business.
 *
 * Guarded by the same admin session as the dashboard — the whole point of
 * first-party analytics is that this list doesn't leak.
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Unauthorised", { status: 401 });
  }

  const url = new URL(request.url);
  const segmentId = url.searchParams.get("segment");

  const audience = await listAudience();
  const rows = segmentId
    ? filterBySegment(audience, segmentId)
    : audience.filter((contact) => !contact.unsubscribedAt);

  const header = [
    "email",
    "name",
    "phone",
    "business_name",
    "business_type",
    "status",
    "marketing_opt_in",
    "unsubscribed",
    "score",
    "segments",
    "first_channel",
    "first_landing_path",
    "utm_campaign",
    "pageviews",
    "visits",
    "last_page",
    "first_seen",
    "last_seen",
    "last_contacted",
    "messages_sent",
    "notes",
  ];

  const lines = [header.join(",")];
  for (const contact of rows) {
    lines.push(
      [
        contact.email,
        contact.name,
        contact.phone,
        contact.businessName,
        contact.businessType,
        contact.status,
        contact.marketingOptIn ? "yes" : "no",
        contact.unsubscribedAt ? "yes" : "no",
        contact.score,
        contact.segments.join("|"),
        contact.firstChannel,
        contact.firstLandingPath,
        contact.utmCampaign,
        contact.pageviews,
        contact.sessions,
        contact.lastPath,
        contact.createdAt,
        contact.lastSeen,
        contact.lastContactedAt,
        contact.outreachCount,
        contact.notes,
      ]
        .map(cell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = segmentId ? `-${segmentId}` : "";

  return new Response(`\uFEFF${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ledgr-contacts${suffix}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
