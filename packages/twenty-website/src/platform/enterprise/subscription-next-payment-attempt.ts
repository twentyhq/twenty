import type Stripe from 'stripe';

export function getSubscriptionNextPaymentAttempt(
  subscription: Stripe.Response<Stripe.Subscription>,
): number | null {
  const latestInvoice = subscription.latest_invoice;

  if (latestInvoice === null || typeof latestInvoice === 'string') {
    return null;
  }

  const nextPaymentAttempt = latestInvoice.next_payment_attempt;

  return typeof nextPaymentAttempt === 'number' ? nextPaymentAttempt : null;
}
