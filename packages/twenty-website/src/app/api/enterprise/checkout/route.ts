import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getEnterprisePriceId,
  getStripeClient,
  optionalRedirectUrlFieldSchema,
  resolveSameOriginUrl,
} from '@/platform/enterprise';

export const dynamic = 'force-dynamic';

// Every field falls back rather than rejecting, preserving how this endpoint
// has always coerced unusable values. Only an unsafe successUrl gets a 400.
const checkoutRequestSchema = z.object({
  billingInterval: z.enum(['monthly', 'yearly']).catch('monthly'),
  seatCount: z.number().min(1).catch(1),
  successUrl: optionalRedirectUrlFieldSchema,
});

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error(
      '[enterprise-checkout] 503 — STRIPE_SECRET_KEY is not configured',
    );
    return NextResponse.json(
      { error: 'Enterprise checkout is not configured.' },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripeClient();
    const parsedBody = checkoutRequestSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const {
      billingInterval,
      seatCount,
      successUrl: requestedSuccessUrlInput,
    } = parsedBody.data;

    const priceId = getEnterprisePriceId(billingInterval);
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const defaultSuccessUrl = websiteUrl
      ? `${websiteUrl}/enterprise/activate?session_id={CHECKOUT_SESSION_ID}`
      : undefined;
    const requestedSuccessUrl = websiteUrl
      ? resolveSameOriginUrl(requestedSuccessUrlInput, websiteUrl)
      : null;

    if (
      requestedSuccessUrlInput !== undefined &&
      requestedSuccessUrl === null
    ) {
      return NextResponse.json(
        { error: 'Invalid successUrl' },
        { status: 400 },
      );
    }

    const successUrl = requestedSuccessUrl ?? defaultSuccessUrl;

    if (!successUrl) {
      return NextResponse.json(
        {
          error:
            'Missing successUrl or NEXT_PUBLIC_WEBSITE_URL for checkout redirect',
        },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: seatCount,
        },
      ],
      success_url: successUrl,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          source: 'enterprise-self-hosted',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Checkout error: ${message}` },
      { status: 500 },
    );
  }
}
