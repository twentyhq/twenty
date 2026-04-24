import { signEnterpriseKey } from '@/lib/enterprise/enterprise-jwt';
import { getStripeClient } from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    const SUCCESSFUL_PAYMENT_STATUSES: Array<typeof session.payment_status> = [
      'paid',
      'no_payment_required',
    ];

    if (
      session.status !== 'complete' ||
      !SUCCESSFUL_PAYMENT_STATUSES.includes(session.payment_status)
    ) {
      return NextResponse.json(
        { error: 'Checkout session is not completed' },
        { status: 402 },
      );
    }

    const subscription = session.subscription;

    if (!subscription || typeof subscription === 'string') {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 400 },
      );
    }

    const ACTIVATABLE_SUBSCRIPTION_STATUSES: Array<typeof subscription.status> =
      ['active', 'trialing'];

    if (!ACTIVATABLE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      return NextResponse.json(
        {
          error: 'Subscription is not active',
          status: subscription.status,
        },
        { status: 402 },
      );
    }

    const customer = session.customer;
    const licensee =
      customer && typeof customer !== 'string' && !customer.deleted
        ? (customer.name ?? customer.email ?? 'Unknown')
        : 'Unknown';

    const enterpriseKey = signEnterpriseKey(subscription.id, licensee);

    return NextResponse.json({
      enterpriseKey,
      licensee,
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Activation error: ${message}` },
      { status: 500 },
    );
  }
}
