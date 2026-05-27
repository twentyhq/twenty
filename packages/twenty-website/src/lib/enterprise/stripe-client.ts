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

export const getEnterprisePriceId = (
  billingInterval: 'monthly' | 'yearly' = 'monthly',
): string => {
  const envKey =
    billingInterval === 'yearly'
      ? 'STRIPE_ENTERPRISE_YEARLY_PRICE_ID'
      : 'STRIPE_ENTERPRISE_MONTHLY_PRICE_ID';

  const priceId = process.env[envKey];

  if (!priceId) {
    throw new Error(`${envKey} is not configured`);
  }

  return priceId;
};
