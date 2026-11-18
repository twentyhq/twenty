import { isApplicationBillingPriceCurrency } from '@/application/isApplicationBillingPriceCurrency';

describe('isApplicationBillingPriceCurrency', () => {
  it('should accept USD', () => {
    expect(isApplicationBillingPriceCurrency('USD')).toBe(true);
  });

  it.each([['EUR'], ['usd'], [undefined]])('should reject %p', (value) => {
    expect(isApplicationBillingPriceCurrency(value)).toBe(false);
  });
});
