import type Stripe from 'stripe';

import { getSubscriptionNextPaymentAttempt } from './subscription-next-payment-attempt';

const NEXT_ATTEMPT = 1786363200;

const subscriptionWith = (
  shape: Record<string, unknown>,
): Stripe.Response<Stripe.Subscription> =>
  shape as unknown as Stripe.Response<Stripe.Subscription>;

describe('getSubscriptionNextPaymentAttempt', () => {
  it('reads the scheduled retry from the expanded latest invoice', () => {
    expect(
      getSubscriptionNextPaymentAttempt(
        subscriptionWith({
          latest_invoice: { next_payment_attempt: NEXT_ATTEMPT },
        }),
      ),
    ).toBe(NEXT_ATTEMPT);
  });

  it('returns null once Stripe has stopped retrying', () => {
    expect(
      getSubscriptionNextPaymentAttempt(
        subscriptionWith({ latest_invoice: { next_payment_attempt: null } }),
      ),
    ).toBeNull();
  });

  it('returns null when the latest invoice was not expanded', () => {
    expect(
      getSubscriptionNextPaymentAttempt(
        subscriptionWith({ latest_invoice: 'in_123' }),
      ),
    ).toBeNull();
  });

  it('returns null when there is no latest invoice', () => {
    expect(
      getSubscriptionNextPaymentAttempt(
        subscriptionWith({ latest_invoice: null }),
      ),
    ).toBeNull();
  });
});
