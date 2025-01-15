import request from 'supertest';
import { createMockStripeEntitlementUpdatedData } from 'test/integration/billing/utils/create-mock-stripe-entitlement-updated-data.util';
import { createMockStripePriceCreatedData } from 'test/integration/billing/utils/create-mock-stripe-price-created-data.util';
import { createMockStripeProductUpdatedData } from 'test/integration/billing/utils/create-mock-stripe-product-updated-data.util';
import { createMockStripeSubscriptionCreatedData } from 'test/integration/billing/utils/create-mock-stripe-subscription-created-data.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('BillingController (integration)', () => {
  it('should handle product.updated and price.created webhook events', async () => {
    const productUpdatedPayload = {
      type: 'product.updated',
      data: createMockStripeProductUpdatedData(),
    };
    const priceCreatedPayload = {
      type: 'price.created',
      data: createMockStripePriceCreatedData(),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(productUpdatedPayload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripeProductId).toBeDefined();
      });

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(priceCreatedPayload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripePriceId).toBeDefined();
        expect(res.body.stripeMeterId).toBeDefined();
      });
  });
  it('should handle subscription.created webhook event', async () => {
    const subscriptionCreatedPayload = {
      type: 'customer.subscription.created',
      data: createMockStripeSubscriptionCreatedData(),
    };
    const entitlementUpdatedPayload = {
      type: 'entitlements.active_entitlement_summary.updated',
      data: createMockStripeEntitlementUpdatedData(),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(subscriptionCreatedPayload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripeSubscriptionId).toBeDefined();
        expect(res.body.stripeCustomerId).toBeDefined();
      });

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(entitlementUpdatedPayload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripeEntitlementCustomerId).toBeDefined();
      });
  });

  it('should handle entitlements.active_entitlement_summary.updated when the subscription is not found', async () => {
    const entitlementUpdatedPayload = {
      type: 'entitlements.active_entitlement_summary.updated',
      data: createMockStripeEntitlementUpdatedData({
        customer: 'new_customer',
      }),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(entitlementUpdatedPayload))
      .expect(404);
  });

  it('should reject webhook with invalid signature', async () => {
    const entitlementUpdatedPayload = {
      type: 'customer.entitlement.created',
      data: {
        object: {
          id: 'ent_test123',
        },
      },
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'invalid-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(entitlementUpdatedPayload))
      .expect(500);
  });
});
