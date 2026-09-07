import type Stripe from 'stripe';

type SubscriptionWithPeriodEnd = Stripe.Subscription & {
  current_period_end?: number;
};

export function getSubscriptionCurrentPeriodEnd(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const extended = subscription as Stripe.Response<SubscriptionWithPeriodEnd>;
  const end = extended.current_period_end;

  return typeof end === 'number' ? end : null;
}
