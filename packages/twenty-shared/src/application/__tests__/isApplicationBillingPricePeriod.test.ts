import { isApplicationBillingPricePeriod } from '@/application/isApplicationBillingPricePeriod';

describe('isApplicationBillingPricePeriod', () => {
  it('should accept monthly', () => {
    expect(isApplicationBillingPricePeriod('monthly')).toBe(true);
  });

  it.each([['yearly'], ['MONTH'], [undefined]])('should reject %p', (value) => {
    expect(isApplicationBillingPricePeriod(value)).toBe(false);
  });
});
