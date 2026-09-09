import { NextResponse } from 'next/server';

import {
  getEnterpriseConfigError,
  getStripeClient,
  getSubscriptionCurrentPeriodEnd,
  getSubscriptionNextPaymentAttempt,
  resolveSubscriptionLicenseState,
  SUBSCRIPTION_LICENSE_OUTCOME,
  verifyEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const configError = getEnterpriseConfigError({
    route: 'enterprise-status',
    feature: 'Enterprise status',
    requiredEnvVars: ['STRIPE_SECRET_KEY', 'ENTERPRISE_JWT_PUBLIC_KEY'],
  });

  if (configError) {
    return configError;
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
    const subscription = await stripe.subscriptions.retrieve(payload.sub, {
      expand: ['latest_invoice'],
    });

    const rawCancelAt = subscription.cancel_at;
    const rawCancelAtPeriodEnd = subscription.cancel_at_period_end;
    const rawCurrentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);

    const effectiveCancelAt =
      rawCancelAt ??
      (rawCancelAtPeriodEnd && rawCurrentPeriodEnd
        ? rawCurrentPeriodEnd
        : null);

    const isCancellationScheduled =
      subscription.status !== 'canceled' && effectiveCancelAt !== null;

    const licenseState = resolveSubscriptionLicenseState({
      status: subscription.status,
      nextPaymentAttempt: getSubscriptionNextPaymentAttempt(subscription),
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAt: effectiveCancelAt,
      currentPeriodEnd: rawCurrentPeriodEnd,
      isCancellationScheduled,
      isInGracePeriod:
        licenseState.outcome === SUBSCRIPTION_LICENSE_OUTCOME.GRACE,
      graceExpiresAt: licenseState.graceExpiresAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Status error: ${message}` },
      { status: 500 },
    );
  }
}
