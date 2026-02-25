import {
  getEnterprisePriceId,
  getStripeClient,
} from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const body = await request.json();
    const billingInterval = body.billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const priceId = getEnterprisePriceId(billingInterval);
    const successUrl =
      body.successUrl ??
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/enterprise/activate?session_id={CHECKOUT_SESSION_ID}`;


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

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Checkout error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
