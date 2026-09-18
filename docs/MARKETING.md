# Marketing follow-ups

How the site turns anonymous traffic into follow-up conversations — and the
rules that keep it honest.

The short version: **you can't email or WhatsApp an anonymous visitor.** Nobody
knows who they are. So this works in two moves: measure the traffic, then stitch
a person to that traffic the moment they fill in a form, and follow up with the
people who left enough signal to be worth a message.

---

## The stitch: anonymous browsing → a name

`identifyContact()` (`src/lib/contacts.ts`) runs after *every* form on the site —
waitlist, contact, newsletter. It is best-effort and never throws: a lead is
always saved even if the marketing layer is unavailable.

What it does:

1. Reads the `ledgr_vid` cookie (which only exists if the visitor accepted the
   banner) and pulls their **first-touch attribution** off the visitor row.
2. Upserts the person into `contacts` by email. `coalesce(excluded.x, existing)`
   means a later, thinner form never erases a name or phone you already had.
3. Links the browser (and any other browser they've used) to that contact in
   `contact_visitors` — a person with a phone and a laptop is one person.
4. Logs the conversion event and marks the session converted.
5. Records the marketing opt-in **only if they ticked the box**.

Without consent the contact is still created — they asked to be contacted — but
nothing is linked to their browsing. That's the line: you may reply to the
person; you may not use their history.

---

## Permission, which is not the same as an email address

| State | Meaning | Can you market to them? |
|---|---|---|
| Ticked the box on a form | Explicit opt-in (`marketing_opt_in = true`) | Yes, email |
| Newsletter signup | The signup *is* the opt-in | Yes, email |
| Submitted a form without ticking | They asked for an answer | No — reply about their enquiry only |
| Unsubscribed | `unsubscribed_at` set | Never, until they opt in again themselves |

`canMessage()` in `src/lib/marketing.ts` is the single gate every send passes
through — composer, bulk API, everything. It enforces:

- **Suppression first.** Unsubscribed contacts are excluded from every segment,
  even "All contacts". There is no override in the UI.
- **Marketing email needs an opt-in.** Transactional-only contacts are refused
  with the reason shown on screen.
- **A 3-day cooling-off period** between messages to the same person.
- **A cap of 6 messages**, after which the contact is flagged for review rather
  than messaged again.
- **WhatsApp needs a phone number**, is sent by hand one at a time, and never in
  bulk.

Two sanctioned ways to clear an unsubscribe:

1. **They opt in again themselves** — signing up or ticking the box a second
   time. `identifyContact` clears the suppression because the consent is fresh
   and theirs.
2. **You record a fresh opt-in** — the "Record a fresh opt-in" button on the
   contact page, for when someone asks you by phone to start emailing again.

Nothing else re-subscribes anybody. Declining is one click and permanent.

---

## Segments

Defined in `SEGMENTS` (`src/lib/marketing.ts`) as plain predicates over the
scored audience, so they're readable and easy to change:

| Segment | Who | Usual play |
|---|---|---|
| Hot leads, not yet replied to | score ≥ 30, not contacted in a week | WhatsApp, personal |
| Tried the demo, didn't sign up | demo click, no register click | Email: one clear answer |
| Read the pricing page, no signup | pricing views, no form or signup | Email: the plan comparison |
| Started a form and stopped | more `form_start` than `form_submit` | Email: "want me to just call?" |
| Read the tax & money guides | 2+ blog views | Email: the next guide, not a pitch |
| New this week | joined in the last 7 days | Welcome + first tip |
| Went quiet (opted in) | opted in, silent 14+ days | Win-back |
| Everyone opted in | all opted-in contacts | Announcements |
| All contacts (not unsubscribed) | everyone else | Transactional only |

The dashboard counts each segment live and links straight into the composer, so
"3 people worth following up with" is one click from a message.

---

## Sending

### Composer mode (default, no setup)

A send means: the message opens in your own mail client or WhatsApp with the
text already written, you press send, then click **"I sent it — log it"**. The
log records the **template version** of the message (not your last-minute edits)
so the timeline stays consistent, and it starts that person's cooling-off period.

Why it works this way: a first message from a real inbox gets read, and a
campaign can't fire by accident.

### Bulk API mode (one key)

Set `RESEND_API_KEY` or `BREVO_API_KEY` **plus** `MARKETING_FROM_EMAIL` to a
verified sender, and the same templates can go out in bulk from
`/admin/campaigns`. Until both are set, bulk sending stays off and says why.

- **Send a test to myself first.** Always.
- `MARKETING_DRY_RUN=true` validates and logs every send without delivering —
  run one campaign in dry-run before your first real one.
- Campaign sizes are capped per run (50) so a request can't time out halfway.
- Recipients are **recomputed server-side** from the segment and the gates. The
  browser never gets to say who receives a message.
- Every email carries a one-click unsubscribe link in the text *and*
  `List-Unsubscribe` / `List-Unsubscribe-Post` headers, so Gmail and Outlook show
  their own unsubscribe button.

Failing sends are logged with the provider's error message rather than retried
blindly — check the campaign log.

### Templates

Plain text with `{{placeholders}}` (`first_name`, `business`,
`business_or_your_business`, `last_read_topic`, `whatsapp_number`, `demo_url`,
`unsubscribe_url`…). Unknown placeholders stay visible rather than silently
vanishing — you'll see the mistake before anyone else does.

Templates live in code (`TEMPLATES` in `src/lib/marketing.ts`) so they're
versioned and reviewable. Every email gets the permission reminder plus the
unsubscribe link appended by `emailWithFooter()`, including the reason the person
is receiving it and which form they opted in through.

Email bodies are capped around 1,500 characters by convention — mailto and
`wa.me` links both have length limits, and short messages get replies.

---

## The unsubscribe path

- **In the message:** `/unsubscribe?token=…` — a confirmation page showing the
  masked address, then one button.
- **In the headers:** `/api/unsubscribe?token=…` — `POST` unsubscribes in one
  click (what mail clients use); `GET` only *redirects* to the confirmation page.
  A link prefetched by a corporate mail scanner must never remove someone from
  the list.
- **In the dashboard:** "Suppress (they asked me to stop)" on the contact page,
  for requests that arrive by phone.

All three set the same flag. There is exactly one suppression state, so "we
emailed someone who opted out" can't happen by mistake.

---

## Working agreement

- Reply to enquiries within one business day; the forms promise it.
- WhatsApp is for conversations, not broadcasts. One message, one person.
- If the segment and your instinct disagree, trust the instinct — the score is a
  sorting tool, not a verdict.
- Log the phone calls. A note on the timeline is worth more than another email.
