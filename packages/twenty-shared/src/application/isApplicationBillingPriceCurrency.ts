import { APPLICATION_BILLING_PRICE_CURRENCIES } from '@/application/constants/ApplicationBillingPriceCurrencies';

export const isApplicationBillingPriceCurrency = (
  value: unknown,
): value is (typeof APPLICATION_BILLING_PRICE_CURRENCIES)[number] =>
  APPLICATION_BILLING_PRICE_CURRENCIES.some((currency) => currency === value);
