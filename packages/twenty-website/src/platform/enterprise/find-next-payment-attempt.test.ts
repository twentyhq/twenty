import type Stripe from 'stripe';

import { findNextPaymentAttempt } from './find-next-payment-attempt';

const RETRY_AT = 1786363200;

const stripeWithOpenInvoices = (invoices: unknown[]) => {
  const list = jest.fn().mockResolvedValue({ data: invoices });

  return { stripe: { invoices: { list } } as unknown as Stripe, list };
};

describe('findNextPaymentAttempt', () => {
  it('lists the open invoices of the subscription', async () => {
    const { stripe, list } = stripeWithOpenInvoices([]);

    await findNextPaymentAttempt({ stripe, subscriptionId: 'sub_123' });

    expect(list).toHaveBeenCalledWith({
      subscription: 'sub_123',
      status: 'open',
      limit: 100,
    });
  });

  it('finds the retry on an older open invoice when a newer one carries none', async () => {
    const { stripe } = stripeWithOpenInvoices([
      { next_payment_attempt: null },
      { next_payment_attempt: RETRY_AT },
    ]);

    await expect(
      findNextPaymentAttempt({ stripe, subscriptionId: 'sub_123' }),
    ).resolves.toBe(RETRY_AT);
  });

  it('returns the latest retry when several invoices are being retried', async () => {
    const { stripe } = stripeWithOpenInvoices([
      { next_payment_attempt: RETRY_AT },
      { next_payment_attempt: RETRY_AT + 3600 },
    ]);

    await expect(
      findNextPaymentAttempt({ stripe, subscriptionId: 'sub_123' }),
    ).resolves.toBe(RETRY_AT + 3600);
  });

  it('returns null when no open invoice has a retry scheduled', async () => {
    const { stripe } = stripeWithOpenInvoices([{ next_payment_attempt: null }]);

    await expect(
      findNextPaymentAttempt({ stripe, subscriptionId: 'sub_123' }),
    ).resolves.toBeNull();
  });

  it('returns null when the subscription has no open invoice', async () => {
    const { stripe } = stripeWithOpenInvoices([]);

    await expect(
      findNextPaymentAttempt({ stripe, subscriptionId: 'sub_123' }),
    ).resolves.toBeNull();
  });
});
