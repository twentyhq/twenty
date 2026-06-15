import {
  createRateLimiter,
  fetchWithTimeout,
  getClientIpKey,
  readJsonBody,
} from '@/lib/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// z.url() (not z.httpUrl) so localhost destinations are accepted in dev, but
// constrain the scheme to http(s) so a misconfigured base fails fast.
const pickUrlSchema = z
  .string()
  .trim()
  .pipe(z.url({ error: 'Invalid pick URL.' }))
  .refine((value) => /^https?:\/\//i.test(value), {
    error: 'Pick URL must use http or https.',
  });
const secretSchema = z.string().trim().min(1);
const bodySchema = z.object({
  token: z.string().trim().min(1),
  applicationId: z.string().trim().min(1),
});

const MAX_BODY_BYTES = 4 * 1024;
const PICK_TIMEOUT_MS = 8_000;
const checkRateLimit = createRateLimiter({
  capacity: 10,
  refillPerSec: 1 / 30,
});

export async function POST(request: Request) {
  const base = process.env.BRIEF_REVIEW_BASE_URL?.trim().replace(/\/+$/, '');
  const pickUrlResult = pickUrlSchema.safeParse(
    base ? `${base}/pick` : undefined,
  );
  const secretResult = secretSchema.safeParse(
    process.env.PARTNER_APPLICATION_SECRET,
  );

  if (!pickUrlResult.success || !secretResult.success) {
    console.error(
      '[brief-pick] 503 — BRIEF_REVIEW_BASE_URL or PARTNER_APPLICATION_SECRET missing/invalid',
    );
    return NextResponse.json(
      { error: 'Brief pick endpoint is not configured.' },
      { status: 503 },
    );
  }

  const rateLimit = checkRateLimit(getClientIpKey(request));
  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(rateLimit.retryAfterMs / 1000),
    );
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
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

  const parsed = bodySchema.safeParse(bodyResult.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const upstream = await fetchWithTimeout(
    pickUrlResult.data,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Application-Secret': secretResult.data,
      },
      body: JSON.stringify(parsed.data),
    },
    { timeoutMs: PICK_TIMEOUT_MS },
  );

  if (!upstream.ok) {
    const status = upstream.error === 'timeout' ? 504 : 502;
    return NextResponse.json(
      { error: 'Could not record your choice.' },
      { status },
    );
  }

  let upstreamBody: string;
  try {
    upstreamBody = await upstream.response.text();
  } catch {
    upstreamBody = '';
  }

  if (!upstream.response.ok) {
    return NextResponse.json(
      { error: 'Could not record your choice.' },
      { status: 502 },
    );
  }

  let logicResult: unknown;
  try {
    logicResult = JSON.parse(upstreamBody);
  } catch {
    logicResult = null;
  }

  if (
    typeof logicResult !== 'object' ||
    logicResult === null ||
    (logicResult as Record<string, unknown>)['ok'] !== true
  ) {
    return NextResponse.json(
      { error: 'Could not record your choice.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
