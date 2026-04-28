import { verifyEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey, seatCount } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing enterpriseKey' },
        {
          status: 400,
        },
      );
    }

    if (typeof seatCount !== 'number' || seatCount < 1) {
      return NextResponse.json(
        { error: 'Invalid seatCount' },
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

    const NON_UPDATABLE_STATUSES = ['canceled', 'incomplete_expired'];

    if (
      NON_UPDATABLE_STATUSES.includes(subscription.status) ||
      subscription.cancel_at_period_end
    ) {
      return NextResponse.json({
        success: false,
        reason: 'Subscription is canceled or scheduled for cancellation',
        seatCount: subscription.items.data[0]?.quantity ?? 0,
        subscriptionId: payload.sub,
      });
    }

    if (!subscription.items.data[0]) {
      return NextResponse.json(
        { error: 'No subscription item found' },
        { status: 400 },
      );
    }

    const subscriptionItemId = subscription.items.data[0].id;

    await stripe.subscriptions.update(payload.sub, {
      items: [
        {
          id: subscriptionItemId,
          quantity: seatCount,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return NextResponse.json({
      success: true,
      seatCount,
      subscriptionId: payload.sub,
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Seat update error: ${message}` },
      { status: 500 },
    );
  }
}
