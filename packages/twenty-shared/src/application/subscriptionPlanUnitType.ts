import { type SUBSCRIPTION_PLAN_UNITS } from '@/application/constants/SubscriptionPlanUnits';

export type SubscriptionPlanUnit = (typeof SUBSCRIPTION_PLAN_UNITS)[number];
