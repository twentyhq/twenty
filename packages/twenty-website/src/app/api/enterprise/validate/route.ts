import {
  signValidityToken,
  verifyEnterpriseKey,
} from '@/shared/enterprise/enterprise-jwt';
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

    const activeStatuses = ['active', 'trialing'];

    if (!activeStatuses.includes(subscription.status)) {
      return new Response(
        JSON.stringify({
          error: 'Subscription is not active',
          status: subscription.status,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const validityToken = signValidityToken(payload.sub);

    return Response.json({
      validityToken,
      licensee: payload.licensee,
      subscriptionId: payload.sub,
      subscriptionStatus: subscription.status,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Validation error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
