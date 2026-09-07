import type Stripe from 'stripe';

type SubscriptionWithPeriodStart = Stripe.Subscription & {
  current_period_start?: number;
};

export function getSubscriptionCurrentPeriodStart(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const extended = subscription as Stripe.Response<SubscriptionWithPeriodStart>;
  const start = extended.current_period_start;

  return typeof start === 'number' ? start : null;
}
