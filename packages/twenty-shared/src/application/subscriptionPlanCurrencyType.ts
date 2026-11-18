import { type SUBSCRIPTION_PLAN_CURRENCIES } from '@/application/constants/SubscriptionPlanCurrencies';

export type SubscriptionPlanCurrency =
  (typeof SUBSCRIPTION_PLAN_CURRENCIES)[number];
