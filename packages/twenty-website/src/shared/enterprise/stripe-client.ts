import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripeClient = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    stripeInstance = new Stripe(secretKey, {});
  }

  return stripeInstance;
};

export const getEnterprisePriceId = (): string => {
  const priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;

  if (!priceId) {
    throw new Error('STRIPE_ENTERPRISE_PRICE_ID is not configured');
  }

  return priceId;
};
