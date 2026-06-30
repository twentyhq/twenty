import { NextResponse } from 'next/server';

import { getStripeClient, verifyEnterpriseKey } from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.ENTERPRISE_JWT_PUBLIC_KEY
  ) {
    console.error(
      '[enterprise-portal] 503 — STRIPE_SECRET_KEY and/or ENTERPRISE_JWT_PUBLIC_KEY are not configured',
    );
    return NextResponse.json(
      { error: 'Enterprise billing portal is not configured.' },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      enterpriseKey?: unknown;
      returnUrl?: unknown;
    };
    const { enterpriseKey, returnUrl } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing enterpriseKey' },
        { status: 400 },
      );
    }

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid enterprise key' },
        { status: 403 },
      );
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(payload.sub);

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const frontendUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

    if (!frontendUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_WEBSITE_URL is not configured' },
        { status: 500 },
      );
    }

    const fullReturnUrl =
      typeof returnUrl === 'string'
        ? `${frontendUrl}${returnUrl}`
        : frontendUrl;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: fullReturnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Portal error: ${message}` },
      { status: 500 },
    );
  }
}
