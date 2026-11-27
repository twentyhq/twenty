import { APPLICATION_BILLING_PRICE_UNITS } from '@/application/constants/ApplicationBillingPriceUnits';

export const isApplicationBillingPriceUnit = (
  value: unknown,
): value is (typeof APPLICATION_BILLING_PRICE_UNITS)[number] =>
  APPLICATION_BILLING_PRICE_UNITS.some((unit) => unit === value);
