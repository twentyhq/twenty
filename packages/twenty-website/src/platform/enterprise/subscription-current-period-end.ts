import type Stripe from 'stripe';

type SubscriptionWithLegacyPeriodEnd = Stripe.Subscription & {
  current_period_end?: number;
};

export function getSubscriptionCurrentPeriodEnd(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const itemEnd = subscription.items?.data?.[0]?.current_period_end;

  if (typeof itemEnd === 'number') {
    return itemEnd;
  }

  const legacy =
    subscription as Stripe.Response<SubscriptionWithLegacyPeriodEnd>;

  return typeof legacy.current_period_end === 'number'
    ? legacy.current_period_end
    : null;
}
