import type Stripe from 'stripe';

type SubscriptionWithPeriodBounds = Stripe.Subscription & {
  current_period_end?: number;
};

export const getSubscriptionCurrentPeriodEnd = (
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null => {
  const extended =
    subscription as Stripe.Response<SubscriptionWithPeriodBounds>;
  const end = extended.current_period_end;

  return typeof end === 'number' ? end : null;
};
