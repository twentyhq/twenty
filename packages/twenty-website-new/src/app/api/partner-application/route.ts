import {
  createRateLimiter,
  fetchWithTimeout,
  getClientIpKey,
  readJsonBody,
} from '@/lib/api';
import { splitFullName } from '@/lib/partner-application';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Allowed values mirror `PARTNER_PROGRAM_OPTIONS` in
// `src/lib/partner-application/partner-application-modal-data.ts`. Kept as a
// literal here to avoid the route handler depending on a client module.
const PARTNER_PROGRAM_IDS = ['technology', 'content', 'solutions'] as const;

const partnerApplicationRequestSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email address.' })),
  name: z.string().trim().min(1, { error: 'Name is required.' }),
  company: z.string().trim().min(1, { error: 'Company is required.' }),
  website: z
    .string()
    .trim()
    .min(1, { error: 'Website is required.' })
    .pipe(z.httpUrl({ error: 'Invalid website URL.' })),
  message: z.string().trim().min(1, { error: 'Message is required.' }),
  // The form lets users pick a program type; treat it as soft-required (we
  // accept submissions that omit it for backwards compatibility, but reject
  // unknown values so we don't silently store typos).
  programId: z.enum(PARTNER_PROGRAM_IDS).optional(),
  // Optional in the form copy ("Estimated monthly opportunities (optional)").
  // Empty string is filtered client-side, but accept it here just in case.
  opportunities: z.string().trim().optional(),
});

const webhookUrlSchema = z
  .string()
  .trim()
  .pipe(z.httpUrl({ error: 'Invalid webhook URL.' }));

// Cap chosen for a 6-field form whose largest input is the free-form
// `message` textarea. 16 KB comfortably fits a multi-paragraph message
// (~3000 chars even after JSON-escaping unicode) while still rejecting
// obvious abuse early. If the form ever grows file uploads, switch to a
// streaming reader; today JSON is enough.
const MAX_BODY_BYTES = 16 * 1024;

// Webhooks are user-facing latency too — the form blocks on this response.
// 8 s is comfortable for a healthy webhook and tight enough to fail fast.
const WEBHOOK_TIMEOUT_MS = 8_000;

// Best-effort, per-instance rate limit. Capacity 5 / refill 1 per minute
// allows quick legitimate retries (typo → re-submit) but caps a flood at
// ~60 requests/hour/IP per warm instance. See `lib/api/rate-limit.ts` for
// the honest scope discussion.
const checkRateLimit = createRateLimiter({
  capacity: 5,
  refillPerSec: 1 / 60,
});

export async function POST(request: Request) {
  const webhookUrlResult = webhookUrlSchema.safeParse(
    process.env.PARTNER_APPLICATION_WEBHOOK_URL,
  );

  if (!webhookUrlResult.success) {
    return NextResponse.json(
      { error: 'Partner application webhook is not configured.' },
      { status: 503 },
    );
  }

  const webhookUrl = webhookUrlResult.data;

  const rateLimit = checkRateLimit(getClientIpKey(request));
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(rateLimit.retryAfterMs / 1000),
    );
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      },
    );
  }

  const bodyResult = await readJsonBody<unknown>(request, {
    maxBytes: MAX_BODY_BYTES,
  });

  if (!bodyResult.ok) {
    switch (bodyResult.error) {
      case 'wrong-content-type':
        return NextResponse.json(
          { error: 'Content-Type must be application/json.' },
          { status: 415 },
        );
      case 'too-large':
        return NextResponse.json(
          { error: 'Request body is too large.' },
          { status: 413 },
        );
      case 'invalid-json':
        return NextResponse.json(
          { error: 'Invalid JSON body.' },
          { status: 400 },
        );
    }
  }

  const parsed = partnerApplicationRequestSchema.safeParse(bodyResult.value);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request body.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, company, website, message, programId, opportunities } =
    parsed.data;
  const { firstName, lastName } = splitFullName(name);

  const upstream = await fetchWithTimeout(
    webhookUrl,
    {
      // Existing keys (Email/FirstName/LastName) preserved so the downstream
      // automation does not break. New keys are PascalCase to match the
      // existing convention.
      body: JSON.stringify({
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        Company: company,
        Website: website,
        Message: message,
        ...(programId !== undefined && { ProgramId: programId }),
        ...(opportunities !== undefined &&
          opportunities !== '' && { Opportunities: opportunities }),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
    { timeoutMs: WEBHOOK_TIMEOUT_MS },
  );

  if (!upstream.ok) {
    const status = upstream.error === 'timeout' ? 504 : 502;
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
      { status },
    );
  }

  if (!upstream.response.ok) {
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
