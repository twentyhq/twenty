import { NextResponse } from 'next/server';

import {
  enforceTrialEligibility,
  getEnterpriseConfigError,
  getStripeClient,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const configError = getEnterpriseConfigError({
    route: 'enterprise-stripe-webhook',
    feature: 'Enterprise Stripe webhooks',
    requiredEnvVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
  });

  if (configError) {
    return configError;
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripeClient();
  const payload = await request.text();

  let event;

  try {
    // The async variant is required on Cloudflare Workers: signature
    // verification goes through SubtleCrypto, which has no sync form.
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error: unknown) {
    console.error('[enterprise-stripe-webhook] signature check failed', error);

    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const subscription = event.data.object.subscription;
  const subscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id;

  if (!subscriptionId) {
    return NextResponse.json({ received: true });
  }

  try {
    const outcome = await enforceTrialEligibility({ stripe, subscriptionId });

    console.info(
      `[enterprise-stripe-webhook] ${subscriptionId} trial eligibility: ${outcome}`,
    );
  } catch (error: unknown) {
    // A 500 makes Stripe redeliver, which is what we want for a transient
    // failure: the subscription is still trialing and can be judged later.
    console.error(
      `[enterprise-stripe-webhook] trial enforcement failed for ${subscriptionId}`,
      error,
    );

    return NextResponse.json(
      { error: 'Trial enforcement failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
