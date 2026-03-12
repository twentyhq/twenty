import { signEnterpriseKey } from '@/shared/enterprise/enterprise-jwt';
import { getStripeClient } from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing session_id parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const subscription = session.subscription;

    if (!subscription || typeof subscription === 'string') {
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const customer = session.customer;
    const licensee =
      customer && typeof customer !== 'string' && !customer.deleted
        ? (customer.name ?? customer.email ?? 'Unknown')
        : 'Unknown';

    const enterpriseKey = signEnterpriseKey(subscription.id, licensee);

    return Response.json({
      enterpriseKey,
      licensee,
      subscriptionId: subscription.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Activation error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
