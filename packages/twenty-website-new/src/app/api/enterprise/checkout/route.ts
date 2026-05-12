import {
  getEnterprisePriceId,
  getStripeClient,
} from '@/lib/enterprise/stripe-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const body = await request.json();
    const billingInterval =
      body.billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const priceId = getEnterprisePriceId(billingInterval);
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const defaultSuccessUrl = websiteUrl
      ? `${websiteUrl}/enterprise/activate?session_id={CHECKOUT_SESSION_ID}`
      : undefined;
    const successUrl = body.successUrl ?? defaultSuccessUrl;

    if (!successUrl || typeof successUrl !== 'string') {
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
          quantity: body.seatCount ?? 1,
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
