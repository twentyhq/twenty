import type Stripe from 'stripe';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';

export const createMockStripeProductUpdatedData = (
  overrides = {},
): Stripe.ProductUpdatedEvent.Data => ({
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
    metadata: {
      planKey: 'base',
      priceUsageBased: BillingUsageType.LICENSED,
      productKey: BillingProductKey.BASE_PRODUCT,
    },
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
  ...overrides,
});
