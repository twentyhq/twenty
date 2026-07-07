import { NextResponse } from 'next/server';

import {
  ENTERPRISE_RATE_LIMIT_CODE,
  EnterpriseInstanceType,
  evaluateValidityTokenEmissionRateLimit,
  getAutoReleaseDays,
  getEnterpriseConfigError,
  getStripeClient,
  getSubscriptionCurrentPeriodEnd,
  parseInstanceType,
  resolveServerBinding,
  SERVER_BINDING_OUTCOME,
  signValidityToken,
  verifyEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

const ACTIVATABLE_STATUSES = new Set(['active', 'trialing']);

type InstanceMetadata = {
  serverId?: string;
  instanceType?: EnterpriseInstanceType;
};

export async function POST(request: Request) {
  const configError = getEnterpriseConfigError({
    route: 'enterprise-validate',
    feature: 'Enterprise validation',
    requiredEnvVars: [
      'STRIPE_SECRET_KEY',
      'ENTERPRISE_JWT_PUBLIC_KEY',
      'ENTERPRISE_JWT_PRIVATE_KEY',
    ],
  });

  if (configError) {
    return configError;
  }

  try {
    const body = (await request.json()) as {
      enterpriseKey?: string;
      instanceMetadata?: InstanceMetadata;
    };
    const { enterpriseKey, instanceMetadata } = body;

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

    const serverId = instanceMetadata?.serverId;
    const instanceType = parseInstanceType(instanceMetadata?.instanceType);

    const binding = resolveServerBinding({
      stripeMetadata: subscription.metadata,
      serverId,
      instanceType,
      autoReleaseDays: getAutoReleaseDays(),
    });

    if (binding.outcome === SERVER_BINDING_OUTCOME.REJECTED) {
      return NextResponse.json(
        {
          error: binding.reason,
          code: binding.code,
        },
        { status: 403 },
      );
    }

    const emissionRateLimit = evaluateValidityTokenEmissionRateLimit({
      stripeMetadata: subscription.metadata,
      instanceType,
    });

    if (!emissionRateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Validity token emission rate limit exceeded',
          code: ENTERPRISE_RATE_LIMIT_CODE.VALIDITY_TOKEN,
          retryAfter: emissionRateLimit.retryAfter.toISOString(),
        },
        { status: 429 },
      );
    }

    const metadataPatch = {
      ...binding.metadataPatch,
      ...emissionRateLimit.metadataPatch,
    };

    if (Object.keys(metadataPatch).length > 0) {
      await stripe.subscriptions.update(payload.sub, {
        metadata: metadataPatch,
      });
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
      instanceType,
      isBillable: binding.isBillable,
    });
  } catch (error: unknown) {
    console.error('Enterprise key validation failed', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
