import { isSubscriptionPlanUnit } from '@/application/isSubscriptionPlanUnit';

describe('isSubscriptionPlanUnit', () => {
  it.each([['WORKSPACE_MEMBER'], ['CONNECTED_ACCOUNT']])(
    'should accept %p',
    (unit) => {
      expect(isSubscriptionPlanUnit(unit)).toBe(true);
    },
  );

  it.each([['CONNECTION'], [undefined]])('should reject %p', (unit) => {
    expect(isSubscriptionPlanUnit(unit)).toBe(false);
  });
});
