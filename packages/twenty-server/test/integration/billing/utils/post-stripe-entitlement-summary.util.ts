import request from 'supertest';
import { TEST_STRIPE_CUSTOMER_ID } from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { createMockStripeEntitlementUpdatedData } from 'test/integration/billing/utils/create-mock-stripe-entitlement-updated-data.util';

// The webhook rewrites every entitlement of the seeded customer from this list
export const postStripeEntitlementSummary = (
  lookupKeys: string[],
  { hasMore = false }: { hasMore?: boolean } = {},
) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/webhooks/stripe')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('stripe-signature', 'correct-signature')
    .set('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        type: 'entitlements.active_entitlement_summary.updated',
        data: createMockStripeEntitlementUpdatedData({
          customer: TEST_STRIPE_CUSTOMER_ID,
          entitlements: {
            object: 'list',
            data: lookupKeys.map((lookupKey, index) => ({
              id: `ent_test_${index}`,
              object: 'entitlements.active_entitlement',
              feature: `feat_test_${index}`,
              livemode: false,
              lookup_key: lookupKey,
            })),
            has_more: hasMore,
            url: `/v1/customer/${TEST_STRIPE_CUSTOMER_ID}/entitlements`,
          },
        }),
      }),
    )
    .expect(200);
