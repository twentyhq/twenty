import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getStripeClient,
  optionalRedirectUrlFieldSchema,
  resolveSameOriginUrl,
  verifyEnterpriseKey,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

const portalRequestSchema = z.object({
  enterpriseKey: z
    .string({ error: 'Missing enterpriseKey' })
    .min(1, { error: 'Missing enterpriseKey' }),
  returnUrl: optionalRedirectUrlFieldSchema,
});

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.ENTERPRISE_JWT_PUBLIC_KEY
  ) {
    console.error(
      '[enterprise-portal] 503 — STRIPE_SECRET_KEY and/or ENTERPRISE_JWT_PUBLIC_KEY are not configured',
    );
    return NextResponse.json(
      { error: 'Enterprise billing portal is not configured.' },
      { status: 503 },
    );
  }

  try {
    const parsedBody = portalRequestSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: parsedBody.error.issues[0]?.message ?? 'Invalid request body.',
        },
        { status: 400 },
      );
    }

    const { enterpriseKey, returnUrl } = parsedBody.data;

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid enterprise key' },
        { status: 403 },
      );
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(payload.sub);

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const frontendUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

    if (!frontendUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_WEBSITE_URL is not configured' },
        { status: 500 },
      );
    }

    const resolvedReturnUrl = resolveSameOriginUrl(returnUrl, frontendUrl);

    if (returnUrl !== undefined && resolvedReturnUrl === null) {
      return NextResponse.json({ error: 'Invalid returnUrl' }, { status: 400 });
    }

    const fullReturnUrl = resolvedReturnUrl ?? frontendUrl;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: fullReturnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Portal error: ${message}` },
      { status: 500 },
    );
  }
}
