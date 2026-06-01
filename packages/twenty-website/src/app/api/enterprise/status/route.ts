import { verifyEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
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

    const rawCancelAt = subscription.cancel_at;
    const rawCancelAtPeriodEnd = subscription.cancel_at_period_end;
    const rawCurrentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);

    const effectiveCancelAt =
      rawCancelAt ??
      (rawCancelAtPeriodEnd && rawCurrentPeriodEnd
        ? rawCurrentPeriodEnd
        : null);

    const isCancellationScheduled =
      subscription.status !== 'canceled' && effectiveCancelAt !== null;

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAt: effectiveCancelAt,
      currentPeriodEnd: rawCurrentPeriodEnd,
      isCancellationScheduled,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Status error: ${message}` },
      { status: 500 },
    );
  }
}
