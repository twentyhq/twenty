import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  getLicenseeFromStripeCustomer,
  getStripeClient,
  signEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

function isSecretValid(providedSecret: string): boolean {
  const expectedSecret = process.env.ENTERPRISE_ADMIN_API_SECRET;

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const comparisonKey = randomBytes(32);
  const expectedDigest = createHmac('sha256', comparisonKey)
    .update(expectedSecret)
    .digest();
  const providedDigest = createHmac('sha256', comparisonKey)
    .update(providedSecret)
    .digest();

  return timingSafeEqual(expectedDigest, providedDigest);
}

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.ENTERPRISE_JWT_PRIVATE_KEY ||
    !process.env.ENTERPRISE_ADMIN_API_SECRET
  ) {
    console.error(
      '[enterprise-reissue] 503 — STRIPE_SECRET_KEY, ENTERPRISE_JWT_PRIVATE_KEY and/or ENTERPRISE_ADMIN_API_SECRET are not configured',
    );
    return NextResponse.json(
      { error: 'Enterprise key reissue is not configured.' },
      { status: 503 },
    );
  }

  try {
    let body: { subscriptionId?: unknown; secret?: unknown } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const secret = typeof body.secret === 'string' ? body.secret : '';

    if (!isSecretValid(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId =
      typeof body.subscriptionId === 'string' ? body.subscriptionId : '';

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer'],
    });

    const licensee = getLicenseeFromStripeCustomer(subscription.customer);
    const enterpriseKey = signEnterpriseKey(subscription.id, licensee);

    const response = NextResponse.json({
      enterpriseKey,
      licensee,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error: unknown) {
    console.error('Enterprise key reissue failed', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
