import { verifyEnterpriseKey } from '@/shared/enterprise/enterprise-jwt';
import { getStripeClient } from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing enterpriseKey' }),
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

    const rawCancelAt = subscription.cancel_at;
    const rawCancelAtPeriodEnd = subscription.cancel_at_period_end;
    const rawCurrentPeriodEnd = (subscription as any).current_period_end as
      | number
      | null;

    const effectiveCancelAt =
      rawCancelAt ?? (rawCancelAtPeriodEnd ? rawCurrentPeriodEnd : null);

    const isCancellationScheduled =
      subscription.status !== 'canceled' && effectiveCancelAt !== null;

    return Response.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAt: effectiveCancelAt,
      currentPeriodEnd: rawCurrentPeriodEnd,
      isCancellationScheduled,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Status error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
