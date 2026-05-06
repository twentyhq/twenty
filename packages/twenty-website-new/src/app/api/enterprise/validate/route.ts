import {
  signValidityToken,
  verifyEnterpriseKey,
} from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { getSubscriptionCurrentPeriodEnd } from '@/lib/enterprise/stripe-subscription-helpers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey } = body;

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

    const activeStatuses = ['active', 'trialing'];

    if (!activeStatuses.includes(subscription.status)) {
      return NextResponse.json(
        {
          error: 'Subscription is not active',
          status: subscription.status,
        },
        { status: 403 },
      );
    }

    const rawCancelAt = subscription.cancel_at;
    const rawCancelAtPeriodEnd = subscription.cancel_at_period_end;
    const rawCurrentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);
    const effectiveCancelAt =
      rawCancelAt ??
      (rawCancelAtPeriodEnd && rawCurrentPeriodEnd
        ? rawCurrentPeriodEnd
        : null);

    const validityToken = signValidityToken(payload.sub, {
      subscriptionCancelAt: effectiveCancelAt,
    });

    return NextResponse.json({
      validityToken,
      licensee: payload.licensee,
      subscriptionId: payload.sub,
      subscriptionStatus: subscription.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Validation error: ${message}` },
      { status: 500 },
    );
  }
}
