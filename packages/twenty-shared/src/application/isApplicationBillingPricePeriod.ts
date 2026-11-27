import { APPLICATION_BILLING_PRICE_PERIODS } from '@/application/constants/ApplicationBillingPricePeriods';

export const isApplicationBillingPricePeriod = (
  value: unknown,
): value is (typeof APPLICATION_BILLING_PRICE_PERIODS)[number] =>
  APPLICATION_BILLING_PRICE_PERIODS.some((period) => period === value);
