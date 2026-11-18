import { isSubscriptionPlanCurrency } from '@/application/isSubscriptionPlanCurrency';

describe('isSubscriptionPlanCurrency', () => {
  it('should accept USD', () => {
    expect(isSubscriptionPlanCurrency('USD')).toBe(true);
  });

  it.each([['EUR'], ['usd'], [undefined]])('should reject %p', (currency) => {
    expect(isSubscriptionPlanCurrency(currency)).toBe(false);
  });
});
