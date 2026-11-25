import type Stripe from 'stripe';

export function getSubscriptionCurrentPeriodEnd(subscription: {
  items?: {
    data?: Partial<Pick<Stripe.SubscriptionItem, 'current_period_end'>>[];
  };
}): number | null {
  const end = subscription.items?.data?.[0]?.current_period_end;

  return typeof end === 'number' ? end : null;
}
