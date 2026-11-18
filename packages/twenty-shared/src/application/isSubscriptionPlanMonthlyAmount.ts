import { MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS } from '@/application/constants/MaxSubscriptionPlanMonthlyAmountCents';

export const isSubscriptionPlanMonthlyAmount = (
  value: unknown,
): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value <= MAX_SUBSCRIPTION_PLAN_MONTHLY_AMOUNT_CENTS;
