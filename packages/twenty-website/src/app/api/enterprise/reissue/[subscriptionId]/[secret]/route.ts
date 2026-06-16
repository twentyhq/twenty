import * as crypto from 'crypto';

import { signEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const isSecretValid = (providedSecret: string): boolean => {
  const expectedSecret = process.env.ENTERPRISE_ADMIN_API_SECRET;

  if (!expectedSecret || !providedSecret) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(providedSecret);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

const getLicensee = (customer: Stripe.Subscription['customer']): string => {
  if (customer && typeof customer !== 'string' && !customer.deleted) {
    return customer.name ?? customer.email ?? 'Unknown';
  }

  return 'Unknown';
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subscriptionId: string; secret: string }> },
) {
  try {
    const { subscriptionId, secret } = await params;

    if (!isSecretValid(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const licensee = getLicensee(subscription.customer);
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
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Reissue error: ${message}` },
      { status: 500 },
    );
  }
}
