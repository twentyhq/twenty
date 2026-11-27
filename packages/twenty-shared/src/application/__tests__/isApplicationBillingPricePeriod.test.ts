import { isApplicationBillingPricePeriod } from '@/application/isApplicationBillingPricePeriod';

describe('isApplicationBillingPricePeriod', () => {
  it('should accept MONTHLY', () => {
    expect(isApplicationBillingPricePeriod('MONTHLY')).toBe(true);
  });

  it.each([['YEARLY'], ['monthly'], [undefined]])(
    'should reject %p',
    (value) => {
      expect(isApplicationBillingPricePeriod(value)).toBe(false);
    },
  );
});
