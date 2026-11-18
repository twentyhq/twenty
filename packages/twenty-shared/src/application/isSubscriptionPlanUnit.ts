import { SUBSCRIPTION_PLAN_UNITS } from '@/application/constants/SubscriptionPlanUnits';
import { type SubscriptionPlanUnit } from '@/application/subscriptionPlanUnitType';

export const isSubscriptionPlanUnit = (
  value: unknown,
): value is SubscriptionPlanUnit =>
  SUBSCRIPTION_PLAN_UNITS.some((unit) => unit === value);
