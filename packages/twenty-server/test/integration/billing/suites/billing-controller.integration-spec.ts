import { Stripe } from 'stripe';
import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

// TODO: Add more tests
// THIS TEST ONLY WORKS IF THE BILLING TABLES ARE CREATED, VERIFY IS_BILLING_ENABLED IS TRUE
describe('BillingController (integration)', () => {
  const mockTimestamp = 1672531200;

  //put this in utils?
  const createMockSubscriptionData = (
    overrides = {},
  ): Stripe.CustomerSubscriptionCreatedEvent.Data => ({
    object: {
      object: 'subscription',
      id: 'sub_default',
      customer: 'cus_default',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              id: 'plan_default',
              object: 'plan',
              active: true,
              aggregate_usage: null,
              amount_decimal: '0',
              billing_scheme: 'per_unit',
              interval_count: 1,
              livemode: false,
              nickname: null,
              tiers_mode: null,
              transform_usage: null,
              trial_period_days: null,
              interval: 'month',
              currency: 'usd',
              amount: 0,
              created: mockTimestamp,
              product: 'prod_default',
              usage_type: 'licensed',
              metadata: {},
              meter: null,
            },
            id: '',
            object: 'subscription_item',
            billing_thresholds: null,
            created: 0,
            discounts: [],
            metadata: {},
            price: {
              id: 'price_default',
              object: 'price',
              active: true,
              billing_scheme: 'per_unit',
              created: mockTimestamp,
              currency: 'usd',
              custom_unit_amount: null,
              livemode: false,
              lookup_key: null,
              metadata: {},
              nickname: null,
              product: 'prod_default',
              recurring: {
                aggregate_usage: null,
                interval: 'month',
                interval_count: 1,
                meter: null,
                trial_period_days: null,
                usage_type: 'licensed',
              },
              tax_behavior: null,
              tiers_mode: null,
              transform_quantity: null,
              type: 'recurring',
              unit_amount: 1000,
              unit_amount_decimal: '1000',
            },
            subscription: '',
            tax_rates: null,
          },
        ],
        object: 'list',
        has_more: false,
        url: '',
      },
      cancel_at_period_end: false,
      currency: 'usd',
      current_period_end: mockTimestamp,
      current_period_start: mockTimestamp,
      metadata: { workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419' },
      trial_end: null,
      trial_start: null,
      canceled_at: null,
      ...overrides,
      application: null,
      application_fee_percent: null,
      automatic_tax: {
        enabled: true,
        liability: {
          type: 'self',
        },
      },
      billing_cycle_anchor: 0,
      billing_cycle_anchor_config: null,
      billing_thresholds: null,
      cancel_at: null,
      cancellation_details: null,
      collection_method: 'charge_automatically',
      created: 0,
      days_until_due: null,
      default_payment_method: null,
      default_source: null,
      description: null,
      discount: null,
      discounts: [],
      ended_at: null,
      invoice_settings: {
        account_tax_ids: null,
        issuer: {
          type: 'self',
        },
      },
      latest_invoice: null,
      livemode: false,
      next_pending_invoice_item_invoice: null,
      on_behalf_of: null,
      pause_collection: null,
      payment_settings: null,
      pending_invoice_item_interval: null,
      pending_setup_intent: null,
      pending_update: null,
      schedule: null,
      start_date: 0,
      test_clock: null,
      transfer_data: null,
      trial_settings: null,
    },
  });

  const createMockPriceData = (
    overrides = {},
  ): Stripe.PriceCreatedEvent.Data => ({
    object: {
      id: 'price_1Q',
      object: 'price',
      active: true,
      billing_scheme: 'per_unit',
      created: 1733734326,
      currency: 'usd',
      custom_unit_amount: null,
      livemode: false,
      lookup_key: null,
      metadata: {},
      nickname: null,
      product: 'prod_RLN',
      recurring: {
        aggregate_usage: null,
        interval: 'month',
        interval_count: 1,
        meter: null,
        trial_period_days: null,
        usage_type: 'licensed',
      },
      tax_behavior: 'unspecified',
      tiers_mode: null,
      transform_quantity: null,
      type: 'recurring',
      unit_amount: 0,
      unit_amount_decimal: '0',
      ...overrides,
    },
  });

  it('should handle product.updated and price.created webhook events', async () => {
    const productUpdatedData: Stripe.ProductUpdatedEvent.Data = {
      object: {
        id: 'prod_RLN',
        object: 'product',
        active: true,
        created: 1733410584,
        default_price: null,
        description: null,
        images: [],
        livemode: false,
        marketing_features: [],
        metadata: {},
        name: 'kjnnjkjknkjnjkn',
        package_dimensions: null,
        shippable: null,
        statement_descriptor: null,
        tax_code: 'txcd_10103001',
        type: 'service',
        unit_label: null,
        updated: 1734694649,
        url: null,
      },
      previous_attributes: {
        default_price: 'price_1Q',
        updated: 1733410585,
      },
    };
    const payload = {
      type: 'product.updated',
      data: productUpdatedData,
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload))
      .expect(200);

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'price.created',
          data: createMockPriceData(),
        }),
      )
      .expect(200);
  });
  it('should handle subscription.created webhook event', async () => {
    const payload = {
      type: 'subscription.created',
      data: createMockSubscriptionData(),
    };

    await client
      .post('/billing/webhooks')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload))
      .expect(200);
  });
  // it('should handle subscription followed by customer.entitlement.created', async () => {
  //   // First create subscription

  //   // Then create entitlement

  //   await client
  //     .post('/billing/webhooks')
  //     .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
  //     .set('stripe-signature', 'correct-signature')
  //     .set('Content-Type', 'application/json')
  //     .send(
  //       JSON.stringify({
  //         type: 'customer.entitlement.created',
  //         data: createMockCustomerEntitlementData(),
  //       }),
  //     )
  //     .expect(200);
  // });

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
