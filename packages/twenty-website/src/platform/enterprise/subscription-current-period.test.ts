import type Stripe from 'stripe';

import { getSubscriptionCurrentPeriodEnd } from './subscription-current-period-end';
import { getSubscriptionCurrentPeriodStart } from './subscription-current-period-start';

const PERIOD_START = 1786363200;
const PERIOD_END = 1788955200;

const subscriptionWith = (
  shape: Record<string, unknown>,
): Stripe.Response<Stripe.Subscription> =>
  shape as unknown as Stripe.Response<Stripe.Subscription>;

describe('subscription current period accessors', () => {
  it('reads the period bounds from the subscription item', () => {
    const subscription = subscriptionWith({
      items: {
        data: [
          {
            current_period_start: PERIOD_START,
            current_period_end: PERIOD_END,
          },
        ],
      },
    });

    expect(getSubscriptionCurrentPeriodStart(subscription)).toBe(PERIOD_START);
    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBe(PERIOD_END);
  });

  it('falls back to the legacy top-level bounds', () => {
    const subscription = subscriptionWith({
      items: { data: [] },
      current_period_start: PERIOD_START,
      current_period_end: PERIOD_END,
    });

    expect(getSubscriptionCurrentPeriodStart(subscription)).toBe(PERIOD_START);
    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBe(PERIOD_END);
  });

  it('returns null when neither shape carries the bounds', () => {
    const subscription = subscriptionWith({ items: { data: [{}] } });

    expect(getSubscriptionCurrentPeriodStart(subscription)).toBeNull();
    expect(getSubscriptionCurrentPeriodEnd(subscription)).toBeNull();
  });
});
