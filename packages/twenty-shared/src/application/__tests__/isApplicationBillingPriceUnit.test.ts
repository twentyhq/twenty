import { isApplicationBillingPriceUnit } from '@/application/isApplicationBillingPriceUnit';

describe('isApplicationBillingPriceUnit', () => {
  it('should accept WORKSPACE_MEMBER', () => {
    expect(isApplicationBillingPriceUnit('WORKSPACE_MEMBER')).toBe(true);
  });

  it.each([['CONNECTION'], ['workspace_member'], [undefined]])(
    'should reject %p',
    (value) => {
      expect(isApplicationBillingPriceUnit(value)).toBe(false);
    },
  );
});
