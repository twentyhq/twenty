import { splitFullName } from '@/lib/partner-application/split-full-name';
import { NextResponse } from 'next/server';

type PartnerApplicationRequestBody = {
  name?: string;
  email?: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  const webhookUrl = process.env.PARTNER_APPLICATION_WEBHOOK_URL;

  if (!isNonEmptyString(webhookUrl)) {
    return NextResponse.json(
      { error: 'Partner application webhook is not configured.' },
      { status: 503 },
    );
  }

  let body: PartnerApplicationRequestBody;

  try {
    body = (await request.json()) as PartnerApplicationRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, email } = body;

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  if (!isNonEmptyString(email)) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const { firstName, lastName } = splitFullName(name.trim());

  if (!firstName) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const webhookPayload = {
    Email: email.trim(),
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
