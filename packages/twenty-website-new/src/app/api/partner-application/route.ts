import {
  createRateLimiter,
  fetchWithTimeout,
  getClientIpKey,
  readJsonBody,
} from '@/lib/api';
import { splitFullName } from '@/lib/partner-application';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const partnerApplicationRequestSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email address.' })),
  name: z.string().trim().min(1, { error: 'Name is required.' }),
});

const webhookUrlSchema = z
  .string()
  .trim()
  .pipe(z.httpUrl({ error: 'Invalid webhook URL.' }));

// Generous-but-finite cap for a 2-field form. The largest legitimate
// payload is well under 1 KB; 4 KB leaves headroom for unicode names.
const MAX_BODY_BYTES = 4 * 1024;

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

  const { name, email } = parsed.data;
  const { firstName, lastName } = splitFullName(name);

  const upstream = await fetchWithTimeout(
    webhookUrl,
    {
      body: JSON.stringify({
        Email: email,
        FirstName: firstName,
        LastName: lastName,
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
