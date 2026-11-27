import { isApplicationBillingPriceUnit } from '@/application/isApplicationBillingPriceUnit';

describe('isApplicationBillingPriceUnit', () => {
  it.each([['WORKSPACE_MEMBER'], ['CONNECTED_ACCOUNT']])(
    'should accept %p',
    (value) => {
      expect(isApplicationBillingPriceUnit(value)).toBe(true);
    },
  );

  it.each([['CONNECTION'], ['workspace_member'], [undefined]])(
    'should reject %p',
    (value) => {
      expect(isApplicationBillingPriceUnit(value)).toBe(false);
    },
  );
});
