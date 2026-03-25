import type Stripe from 'stripe';
export const createMockStripeEntitlementUpdatedData = (
  overrides = {},
): Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent.Data => ({
  object: {
    object: 'entitlements.active_entitlement_summary',
    customer: 'cus_default1',
    livemode: false,
    entitlements: {
      object: 'list',
      data: [
        {
          id: 'ent_test_61',
          object: 'entitlements.active_entitlement',
          feature: 'feat_test_61',
          livemode: false,
          lookup_key: 'SSO',
        },
      ],
      has_more: false,
      url: '/v1/customer/cus_Q/entitlements',
    },
    ...overrides,
  },
});
