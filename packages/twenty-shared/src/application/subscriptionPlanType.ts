import { type SubscriptionPlanCurrency } from '@/application/subscriptionPlanCurrencyType';
import { type SubscriptionPlanUnit } from '@/application/subscriptionPlanUnitType';

export type SubscriptionPlan = {
  label: string;
  monthlyAmountCents: number;
  currency?: SubscriptionPlanCurrency;
  per?: SubscriptionPlanUnit;
};

export type SubscriptionPlans = Partial<Record<string, SubscriptionPlan>>;
