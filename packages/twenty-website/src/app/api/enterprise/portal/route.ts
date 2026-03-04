import { verifyEnterpriseKey } from '@/shared/enterprise/enterprise-jwt';
import {
  getStripeClient
} from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enterpriseKey, returnUrl } = body;

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

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: fullReturnUrl,
      });

      return Response.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Portal error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
