import {
  createRateLimiter,
  fetchWithTimeout,
  getClientIpKey,
  readJsonBody,
} from '@/lib/api';
import {
  buildLogicFunctionPayload,
  partnerApplicationRequestSchema,
} from '@/app/api/partner-application/partner-application-schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Use z.url() (not z.httpUrl) so localhost destinations are accepted in dev.
// z.httpUrl enforces a TLD-shaped hostname and would reject http://localhost:2020/...
const webhookUrlSchema = z
  .string()
  .trim()
  .pipe(z.url({ error: 'Invalid webhook URL.' }));

const applicationSecretSchema = z.string().trim().min(1);

const MAX_BODY_BYTES = 16 * 1024;
const WEBHOOK_TIMEOUT_MS = 8_000;

const checkRateLimit = createRateLimiter({
  capacity: 5,
  refillPerSec: 1 / 60,
});

export async function POST(request: Request) {
  const webhookUrlResult = webhookUrlSchema.safeParse(
    process.env.PARTNER_APPLICATION_WEBHOOK_URL,
  );
  const secretResult = applicationSecretSchema.safeParse(
    process.env.PARTNER_APPLICATION_SECRET,
  );

  if (!webhookUrlResult.success || !secretResult.success) {
    const rawWebhookUrl = process.env.PARTNER_APPLICATION_WEBHOOK_URL;
    const rawSecret = process.env.PARTNER_APPLICATION_SECRET;
    console.error(
      '[partner-application] 503 — endpoint env vars failed validation',
      JSON.stringify({
        PARTNER_APPLICATION_WEBHOOK_URL: {
          present: rawWebhookUrl !== undefined,
          isEmptyAfterTrim: (rawWebhookUrl ?? '').trim() === '',
          length: (rawWebhookUrl ?? '').length,
          value: rawWebhookUrl,
          parseError: webhookUrlResult.success
            ? null
            : (webhookUrlResult.error.issues[0]?.message ?? 'unknown'),
        },
        PARTNER_APPLICATION_SECRET: {
          present: rawSecret !== undefined,
          isEmptyAfterTrim: (rawSecret ?? '').trim() === '',
          length: (rawSecret ?? '').length,
          parseError: secretResult.success
            ? null
            : (secretResult.error.issues[0]?.message ?? 'unknown'),
        },
        envFileHint:
          'Next dev reads .env.local (not .env.prod). After editing env vars you must restart `yarn nx dev twenty-website` — Next does not hot-reload env vars.',
      }),
    );
    return NextResponse.json(
      { error: 'Partner application endpoint is not configured.' },
      { status: 503 },
    );
  }

  const webhookUrl = webhookUrlResult.data;
  const applicationSecret = secretResult.data;

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

  const payload = buildLogicFunctionPayload(parsed.data);

  const upstream = await fetchWithTimeout(
    webhookUrl,
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Application-Secret': applicationSecret,
      },
      method: 'POST',
    },
    { timeoutMs: WEBHOOK_TIMEOUT_MS },
  );

  if (!upstream.ok) {
    const status = upstream.error === 'timeout' ? 504 : 502;
    console.error(
      '[partner-application] upstream fetch failed',
      JSON.stringify({
        url: webhookUrl,
        error: upstream.error,
        payloadKeys: Object.keys(payload),
      }),
    );
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
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
    console.error(
      '[partner-application] upstream returned non-2xx',
      JSON.stringify({
        url: webhookUrl,
        status: upstream.response.status,
        statusText: upstream.response.statusText,
        body: upstreamBody.slice(0, 2000),
        payloadKeys: Object.keys(payload),
      }),
    );
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
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
    console.error(
      '[partner-application] logic function returned non-ok result',
      JSON.stringify({
        url: webhookUrl,
        body: upstreamBody.slice(0, 2000),
        payloadKeys: Object.keys(payload),
      }),
    );
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
