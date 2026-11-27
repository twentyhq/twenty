import { isApplicationBillingPriceType } from '@/application/isApplicationBillingPriceType';

describe('isApplicationBillingPriceType', () => {
  it('should accept RECURRING', () => {
    expect(isApplicationBillingPriceType('RECURRING')).toBe(true);
  });

  it.each([['ONE_TIME'], ['recurring'], [undefined]])(
    'should reject %p',
    (value) => {
      expect(isApplicationBillingPriceType(value)).toBe(false);
    },
  );
});
