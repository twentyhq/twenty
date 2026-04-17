import { splitFullName } from '@/lib/partner-application/split-full-name';
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

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const bodyResult = partnerApplicationRequestSchema.safeParse(raw);

  if (!bodyResult.success) {
    const message =
      bodyResult.error.issues[0]?.message ?? 'Invalid request body.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email } = bodyResult.data;
  const { firstName, lastName } = splitFullName(name);

  const webhookPayload = {
    Email: email,
    FirstName: firstName,
    LastName: lastName,
  };

  try {
    const upstreamResponse = await fetch(webhookUrl, {
      body: JSON.stringify(webhookPayload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: 'Partner application could not be submitted.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Partner application could not be submitted.' },
      { status: 502 },
    );
  }
}
