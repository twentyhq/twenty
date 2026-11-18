import { MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS } from '@/application/constants/MaxSubscriptionPlanMonthlyAmountCents';
import { isSubscriptionPlanMonthlyAmount } from '@/application/isSubscriptionPlanMonthlyAmount';

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
