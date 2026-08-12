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
    period_start: toUnixSeconds(periodStart),
    period_end: toUnixSeconds(periodEnd),
    parent: {
      subscription_details: {
        subscription: stripeSubscriptionId,
      },
    },
  },
});
