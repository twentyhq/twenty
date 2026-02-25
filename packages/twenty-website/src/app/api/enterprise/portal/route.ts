import { verifyEnterpriseKey } from '@/shared/enterprise/enterprise-jwt';
import {
  getEnterprisePriceId,
  getStripeClient,
} from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey, returnUrl, billingInterval } = body;

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

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const frontendUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const fullReturnUrl = returnUrl
      ? `${frontendUrl}${returnUrl}`
      : frontendUrl;

    if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: fullReturnUrl,
      });

      return Response.json({ url: session.url });
    }

    const interval = billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const priceId = getEnterprisePriceId(interval);
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/enterprise/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: fullReturnUrl,
      subscription_data: {
        trial_period_days: 30,
        metadata: { source: 'enterprise-self-hosted-resubscribe' },
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Portal error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
