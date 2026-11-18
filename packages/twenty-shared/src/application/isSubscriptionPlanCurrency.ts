import { SUBSCRIPTION_PLAN_CURRENCIES } from '@/application/constants/SubscriptionPlanCurrencies';
import { type SubscriptionPlanCurrency } from '@/application/subscriptionPlanCurrencyType';

export const isSubscriptionPlanCurrency = (
  value: unknown,
): value is SubscriptionPlanCurrency =>
  SUBSCRIPTION_PLAN_CURRENCIES.some((currency) => currency === value);
