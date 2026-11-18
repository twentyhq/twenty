import { isSubscriptionPlanUnit } from '@/application/isSubscriptionPlanUnit';

describe('isSubscriptionPlanUnit', () => {
  it('should accept WORKSPACE_MEMBER', () => {
    expect(isSubscriptionPlanUnit('WORKSPACE_MEMBER')).toBe(true);
  });

  it.each([['CONNECTION'], [undefined]])('should reject %p', (unit) => {
    expect(isSubscriptionPlanUnit(unit)).toBe(false);
  });
});
