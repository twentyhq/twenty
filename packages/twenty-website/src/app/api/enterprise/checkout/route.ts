import {
  getEnterprisePriceId,
  getStripeClient,
} from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    const priceId = getEnterprisePriceId();

    const body = await request.json();
    const successUrl =
      body.successUrl ??
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/enterprise/activate?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      body.cancelUrl ??
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/enterprise`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: body.seatCount ?? 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          source: 'enterprise-self-hosted',
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: `Checkout error: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
