import { NextResponse } from 'next/server';

import {
  getStripeClient,
  getSubscriptionCurrentPeriodEnd,
  signValidityToken,
  verifyEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

const ACTIVATABLE_STATUSES = new Set(['active', 'trialing']);

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.ENTERPRISE_JWT_PUBLIC_KEY ||
    !process.env.ENTERPRISE_JWT_PRIVATE_KEY
  ) {
    console.error(
      '[enterprise-validate] 503 — STRIPE_SECRET_KEY, ENTERPRISE_JWT_PUBLIC_KEY and/or ENTERPRISE_JWT_PRIVATE_KEY are not configured',
    );
    return NextResponse.json(
      { error: 'Enterprise validation is not configured.' },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { enterpriseKey?: unknown };
    const { enterpriseKey } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing enterpriseKey' },
        { status: 400 },
      );
    }

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid enterprise key' },
        { status: 403 },
      );
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(payload.sub);

    if (!ACTIVATABLE_STATUSES.has(subscription.status)) {
      return NextResponse.json(
        { error: 'Subscription is not active', status: subscription.status },
        { status: 403 },
      );
    }

    const rawCancelAt = subscription.cancel_at;
    const rawCancelAtPeriodEnd = subscription.cancel_at_period_end;
    const rawCurrentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);
    const effectiveCancelAt =
      rawCancelAt ??
      (rawCancelAtPeriodEnd && rawCurrentPeriodEnd
        ? rawCurrentPeriodEnd
        : null);

    const validityToken = signValidityToken(payload.sub, {
      subscriptionCancelAt: effectiveCancelAt,
    });

    return NextResponse.json({
      validityToken,
      licensee: payload.licensee,
      subscriptionId: payload.sub,
      subscriptionStatus: subscription.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Validation error: ${message}` },
      { status: 500 },
    );
  }
}
