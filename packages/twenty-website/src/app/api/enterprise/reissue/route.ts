import * as crypto from 'crypto';

import { signEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { getLicenseeFromStripeCustomer } from '@/lib/enterprise/stripe-customer-helpers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const isSecretValid = (providedSecret: string): boolean => {
  const expectedSecret = process.env.ENTERPRISE_ADMIN_API_SECRET;

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const comparisonKey = crypto.randomBytes(32);
  const expectedDigest = crypto
    .createHmac('sha256', comparisonKey)
    .update(expectedSecret)
    .digest();
  const providedDigest = crypto
    .createHmac('sha256', comparisonKey)
    .update(providedSecret)
    .digest();

  return crypto.timingSafeEqual(expectedDigest, providedDigest);
};

export async function POST(request: Request) {
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
