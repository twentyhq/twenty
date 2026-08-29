// Typed to what the handler actually reads rather than to Stripe.Invoice: the
// payload crosses the wire as JSON, so the runtime shape is what matters, and
// a full Stripe.Invoice fixture would be a few hundred lines of noise.
export type MockStripeInvoiceFinalizedData = {
  object: {
    id: string;
    object: 'invoice';
    billing_reason: string;
    customer: string;
    period_start: number;
    period_end: number;
    parent: {
      subscription_details: {
        subscription: string;
      };
    };
  };
};

const toUnixSeconds = (date: Date): number => Math.floor(date.getTime() / 1000);

export const createMockStripeInvoiceFinalizedData = ({
  periodStart,
  periodEnd,
  stripeCustomerId = 'cus_default0',
  stripeSubscriptionId = 'sub_default0',
  billingReason = 'subscription_cycle',
  invoiceId = 'in_test_default',
}: {
  periodStart: Date;
  periodEnd: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  billingReason?: string;
  invoiceId?: string;
}): MockStripeInvoiceFinalizedData => ({
  object: {
    id: invoiceId,
    object: 'invoice',
    billing_reason: billingReason,
    customer: stripeCustomerId,
    // The invoice for a subscription_cycle bills the period it opens, so its
    // period_start is the instant the previous period closed.
    period_start: toUnixSeconds(periodStart),
    period_end: toUnixSeconds(periodEnd),
    parent: {
      subscription_details: {
        subscription: stripeSubscriptionId,
      },
    },
  },
});
