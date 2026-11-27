import { MAX_APPLICATION_BILLING_PRICE_AMOUNT_CENTS } from '@/application/constants/MaxApplicationBillingPriceAmountCents';
import { isApplicationBillingPriceAmount } from '@/application/isApplicationBillingPriceAmount';

describe('isApplicationBillingPriceAmount', () => {
  it.each([[1], [1000], [MAX_APPLICATION_BILLING_PRICE_AMOUNT_CENTS]])(
    'should accept %p',
    (amount) => {
      expect(isApplicationBillingPriceAmount(amount)).toBe(true);
    },
  );

  it.each([
    [0],
    [-1],
    [9.99],
    [NaN],
    ['1000'],
    [undefined],
    [MAX_APPLICATION_BILLING_PRICE_AMOUNT_CENTS + 1],
  ])('should reject %p', (amount) => {
    expect(isApplicationBillingPriceAmount(amount)).toBe(false);
  });
});
