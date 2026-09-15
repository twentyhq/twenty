import { NextResponse } from 'next/server';

import {
  ENTERPRISE_INSTANCE_TYPE,
  ENTERPRISE_RATE_LIMIT_CODE,
  evaluateReleaseRateLimit,
  getEnterpriseConfigError,
  getReleaseLimitPerWindow,
  getStripeClient,
  parseInstanceType,
  STRIPE_METADATA_KEY,
  verifyEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

type InstanceMetadata = {
  instanceType?: string;
};

export async function POST(request: Request) {
  const configError = getEnterpriseConfigError({
    route: 'enterprise-release',
    feature: 'Enterprise binding release',
    requiredEnvVars: ['STRIPE_SECRET_KEY', 'ENTERPRISE_JWT_PUBLIC_KEY'],
  });

  if (configError) {
    return configError;
  }

  try {
    const body = (await request.json()) as {
      enterpriseKey?: unknown;
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

    const rateLimit = evaluateReleaseRateLimit({
      stripeMetadata: subscription.metadata,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `The release limit of ${getReleaseLimitPerWindow()} in the last 30 days has been reached for this enterprise key.`,
          code: ENTERPRISE_RATE_LIMIT_CODE.RELEASE,
          retryAfter: rateLimit.retryAfter.toISOString(),
        },
        { status: 429 },
      );
    }

    const instanceType = parseInstanceType(instanceMetadata?.instanceType);

    const metadataPatch: Record<string, string> =
      instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
        ? {
            [STRIPE_METADATA_KEY.DEV_SERVER_ID]: '', // removes the key on stripe metadata
            [STRIPE_METADATA_KEY.DEV_SERVER_LAST_SEEN_AT]: '',
          }
        : {
            [STRIPE_METADATA_KEY.BOUND_SERVER_ID]: '',
            [STRIPE_METADATA_KEY.BOUND_SERVER_LAST_SEEN_AT]: '',
          };

    await stripe.subscriptions.update(payload.sub, {
      metadata: { ...metadataPatch, ...rateLimit.metadataPatch },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: payload.sub,
      instanceType,
    });
  } catch (error: unknown) {
    console.error('Enterprise binding release failed', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
