import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// The fetch-based HTTP client is required on Cloudflare Workers: the Stripe
// SDK's default Node transport hangs on outbound TLS even under nodejs_compat.
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripeInstance = new Stripe(secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  return stripeInstance;
}
