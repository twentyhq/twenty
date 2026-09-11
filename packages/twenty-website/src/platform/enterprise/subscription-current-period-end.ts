import type Stripe from 'stripe';

export function getSubscriptionCurrentPeriodEnd(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const end = subscription.items?.data?.[0]?.current_period_end;

  return typeof end === 'number' ? end : null;
}
