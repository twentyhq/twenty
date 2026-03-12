import { verifyEnterpriseKey } from '@/shared/enterprise/enterprise-jwt';
import { getStripeClient } from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey, seatCount } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing enterpriseKey' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (typeof seatCount !== 'number' || seatCount < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid seatCount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid enterprise key' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const stripe = getStripeClient();

    const subscription = await stripe.subscriptions.retrieve(payload.sub);

    const NON_UPDATABLE_STATUSES = [
      'canceled',
      'incomplete_expired',
    ];

    if (
      NON_UPDATABLE_STATUSES.includes(subscription.status) ||
      subscription.cancel_at_period_end
    ) {
      return Response.json({
        success: false,
        reason: 'Subscription is canceled or scheduled for cancellation',
        seatCount: subscription.items.data[0]?.quantity ?? 0,
        subscriptionId: payload.sub,
      });
    }

    if (!subscription.items.data[0]) {
      return new Response(
        JSON.stringify({ error: 'No subscription item found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
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

    return Response.json({
      success: true,
      seatCount,
      subscriptionId: payload.sub,
    });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Seat update error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
