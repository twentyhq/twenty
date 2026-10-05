import type Stripe from 'stripe';

import { getSubscriptionCurrentPeriodEnd } from './subscription-current-period-end';

const PERIOD_END = 1788955200;

const subscriptionWith = (
  shape: Record<string, unknown>,
): Stripe.Response<Stripe.Subscription> =>
  shape as unknown as Stripe.Response<Stripe.Subscription>;

describe('getSubscriptionCurrentPeriodEnd', () => {
  it('reads the period bounds from the subscription item', () => {
    const subscription = subscriptionWith({
      items: {
        data: [
          {
            current_period_end: PERIOD_END,
          },
        ],
      },
    });

    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBe(PERIOD_END);
  });

  it('ignores period bounds sitting on the subscription itself', () => {
    const subscription = subscriptionWith({
      items: { data: [] },
      current_period_end: PERIOD_END,
    });

    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBeNull();
  });

  it('returns null when the item carries no bounds', () => {
    const subscription = subscriptionWith({ items: { data: [{}] } });

    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBeNull();
  });
});
