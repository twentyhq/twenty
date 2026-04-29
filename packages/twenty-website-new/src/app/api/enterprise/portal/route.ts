import { verifyEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey, returnUrl } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing enterpriseKey' },
        {
          status: 400,
        },
      );
    }

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid enterprise key' },
        {
          status: 403,
        },
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

    const fullReturnUrl = returnUrl
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
