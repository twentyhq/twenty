import {
  getSubscriptionPlanYearlyAmountCents,
  isSubscriptionPlanAmount,
  MAX_SUBSCRIPTION_PLAN_AMOUNT_CENTS,
} from '@/application/applicationBillingType';

describe('getSubscriptionPlanYearlyAmountCents', () => {
  it('should return the declared yearly amount', () => {
    expect(
      getSubscriptionPlanYearlyAmountCents({
        monthlyAmountCents: 1000,
        yearlyAmountCents: 10_000,
      }),
    ).toBe(10_000);
  });

  it('should return twelve months when no yearly amount is declared', () => {
    expect(
      getSubscriptionPlanYearlyAmountCents({ monthlyAmountCents: 1000 }),
    ).toBe(12_000);
  });
});

describe('isSubscriptionPlanAmount', () => {
  it.each([[1], [1000], [MAX_SUBSCRIPTION_PLAN_AMOUNT_CENTS]])(
    'should accept %p',
    (amount) => {
      expect(isSubscriptionPlanAmount(amount)).toBe(true);
    },
  );

  it.each([
    [0],
    [-1],
    [9.99],
    [NaN],
    ['1000'],
    [undefined],
    [MAX_SUBSCRIPTION_PLAN_AMOUNT_CENTS + 1],
  ])('should reject %p', (amount) => {
    expect(isSubscriptionPlanAmount(amount)).toBe(false);
  });
});
