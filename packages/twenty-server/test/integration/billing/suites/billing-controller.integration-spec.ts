import request from 'supertest';
import { createMockStripePriceCreatedData } from 'test/integration/billing/utils/create-mock-stripe-price-created-data.util';
import { createMockStripeProductUpdatedData } from 'test/integration/billing/utils/create-mock-stripe-product-updated-data.util';
import { createMockStripeSubscriptionCreatedData } from 'test/integration/billing/utils/create-mock-stripe-subscription-created-data.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('BillingController (integration)', () => {
  it('should handle product.updated and price.created webhook events', async () => {
    const payload = {
      type: 'product.updated',
      data: createMockStripeProductUpdatedData(),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripeProductId).toBeDefined();
      });

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'price.created',
          data: createMockStripePriceCreatedData(),
        }),
      )
      .expect(200)
      .then((res) => {
        expect(res.body.stripePriceId).toBeDefined();
        expect(res.body.stripeMeterId).toBeDefined();
      });
  });
  it('should handle subscription.created webhook event', async () => {
    const payload = {
      type: 'customer.subscription.created',
      data: createMockStripeSubscriptionCreatedData(),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload))
      .expect(200)
      .then((res) => {
        expect(res.body.stripeSubscriptionId).toBeDefined();
        expect(res.body.stripeCustomerId).toBeDefined();
      });
  });

  it('should reject webhook with invalid signature', async () => {
    const payload = {
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
      .send(JSON.stringify(payload))
      .expect(500);
  });
});
