import { isApplicationBillingPriceType } from '@/application/isApplicationBillingPriceType';

describe('isApplicationBillingPriceType', () => {
  it('should accept recurring', () => {
    expect(isApplicationBillingPriceType('recurring')).toBe(true);
  });

  it.each([['one-time'], ['RECURRING'], [undefined]])(
    'should reject %p',
    (value) => {
      expect(isApplicationBillingPriceType(value)).toBe(false);
    },
  );
});
