import { APPLICATION_BILLING_PRICE_TYPES } from '@/application/constants/ApplicationBillingPriceTypes';

export const isApplicationBillingPriceType = (
  value: unknown,
): value is (typeof APPLICATION_BILLING_PRICE_TYPES)[number] =>
  APPLICATION_BILLING_PRICE_TYPES.some((type) => type === value);
