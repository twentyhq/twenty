import type Stripe from 'stripe';

export function getSubscriptionCurrentPeriodStart(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const start = subscription.items?.data?.[0]?.current_period_start;

  return typeof start === 'number' ? start : null;
}
