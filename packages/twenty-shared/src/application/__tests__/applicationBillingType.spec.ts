import {
  isSubscriptionPlanCurrency,
  isSubscriptionPlanMonthlyAmount,
  isSubscriptionPlanUnit,
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

describe('isSubscriptionPlanCurrency', () => {
  it('should accept USD', () => {
    expect(isSubscriptionPlanCurrency('USD')).toBe(true);
  });

  it.each([['EUR'], ['usd'], [undefined]])('should reject %p', (currency) => {
    expect(isSubscriptionPlanCurrency(currency)).toBe(false);
  });
});
