import * as crypto from 'crypto';

import { signEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getLicenseeFromStripeCustomer } from '@/lib/enterprise/stripe-customer-helpers';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';

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

    const licensee = getLicenseeFromStripeCustomer(subscription.customer);
    const enterpriseKey = signEnterpriseKey(subscription.id, licensee);

    return NextResponse.json({
      enterpriseKey,
      licensee,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    });
  } catch (error: unknown) {
    console.error('Enterprise key reissue failed', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
