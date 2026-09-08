import type Stripe from 'stripe';

type SubscriptionWithLegacyPeriodStart = Stripe.Subscription & {
  current_period_start?: number;
};

export function getSubscriptionCurrentPeriodStart(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const itemStart = subscription.items?.data?.[0]?.current_period_start;

  if (typeof itemStart === 'number') {
    return itemStart;
  }

  const legacy =
    subscription as Stripe.Response<SubscriptionWithLegacyPeriodStart>;

  return typeof legacy.current_period_start === 'number'
    ? legacy.current_period_start
    : null;
}
