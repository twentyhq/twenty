import {
  isRecurringChargeUnit,
  isSubscriptionPlanMonthlyAmount,
  MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS,
} from '@/application/applicationBillingType';

describe('isSubscriptionPlanMonthlyAmount', () => {
  it.each([[1], [1000], [MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS]])(
    'should accept %p',
    (amount) => {
      expect(isSubscriptionPlanMonthlyAmount(amount)).toBe(true);
    },
  );

  it.each([
    [0],
    [-1],
    [9.99],
    [NaN],
    ['1000'],
    [undefined],
    [MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS + 1],
  ])('should reject %p', (amount) => {
    expect(isSubscriptionPlanMonthlyAmount(amount)).toBe(false);
  });
});

describe('isRecurringChargeUnit', () => {
  it('should accept WORKSPACE_MEMBER', () => {
    expect(isRecurringChargeUnit('WORKSPACE_MEMBER')).toBe(true);
  });

  it.each([['CONNECTION'], [undefined]])('should reject %p', (unit) => {
    expect(isRecurringChargeUnit(unit)).toBe(false);
  });
});
