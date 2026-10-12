// Typed to what the handler reads, not Stripe.Invoice: a full fixture would be hundreds of lines of noise.
export type MockStripeInvoiceFinalizedData = {
  object: {
    id: string;
    object: 'invoice';
    billing_reason: string;
    created: number;
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
  // The handler resolves the period boundary from the invoice's created time, not our clock.
  createdAt = periodStart,
}: {
  periodStart: Date;
  periodEnd: Date;
  createdAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  billingReason?: string;
  invoiceId?: string;
}): MockStripeInvoiceFinalizedData => ({
  object: {
    id: invoiceId,
    object: 'invoice',
    billing_reason: billingReason,
    created: toUnixSeconds(createdAt),
    customer: stripeCustomerId,
    period_start: toUnixSeconds(periodStart),
    period_end: toUnixSeconds(periodEnd),
    parent: {
      subscription_details: {
        subscription: stripeSubscriptionId,
      },
    },
  },
});
