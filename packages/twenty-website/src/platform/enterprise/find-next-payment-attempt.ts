import type Stripe from 'stripe';

export async function findNextPaymentAttempt({
  stripe,
  subscriptionId,
}: {
  stripe: Stripe;
  subscriptionId: string;
}): Promise<number | null> {
  const openInvoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: 'open',
    limit: 100,
  });

  const scheduledAttempts = openInvoices.data
    .map((invoice) => invoice.next_payment_attempt)
    .filter((attempt): attempt is number => typeof attempt === 'number');

  return scheduledAttempts.length > 0 ? Math.max(...scheduledAttempts) : null;
}
