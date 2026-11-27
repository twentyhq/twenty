import { MAX_APPLICATION_BILLING_PRICE_AMOUNT_CENTS } from '@/application/constants/MaxApplicationBillingPriceAmountCents';

export const isApplicationBillingPriceAmount = (
  value: unknown,
): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value <= MAX_APPLICATION_BILLING_PRICE_AMOUNT_CENTS;
