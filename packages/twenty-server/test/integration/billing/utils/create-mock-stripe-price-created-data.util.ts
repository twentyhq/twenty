import type Stripe from 'stripe';
export const createMockStripePriceCreatedData = (
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
