import { type BillableOperations } from '@/application/billableOperationsType';

export const RECURRING_CHARGE_PERIODS = ['MONTH'] as const;

export type RecurringChargePeriod = (typeof RECURRING_CHARGE_PERIODS)[number];

export const isRecurringChargePeriod = (
  value: unknown,
): value is RecurringChargePeriod =>
  RECURRING_CHARGE_PERIODS.includes(value as RecurringChargePeriod);

// Omitted for a flat fee. WORKSPACE_MEMBER multiplies the amount by the number
// of members in the workspace at the moment the period is charged.
export const RECURRING_CHARGE_UNITS = ['WORKSPACE_MEMBER'] as const;

export type RecurringChargeUnit = (typeof RECURRING_CHARGE_UNITS)[number];

export const isRecurringChargeUnit = (
  value: unknown,
): value is RecurringChargeUnit =>
  RECURRING_CHARGE_UNITS.includes(value as RecurringChargeUnit);

export type RecurringCharge = {
  period: RecurringChargePeriod;
  amountMicroCredits: number;
  per?: RecurringChargeUnit;
  label: string;
};

// Keyed by a name the application chooses. Unlike operations, the platform
// raises these itself once per billing period, so the app declares the amount
// rather than calling chargeCredits.
export type RecurringCharges = Partial<Record<string, RecurringCharge>>;

export type ApplicationBilling = {
  description?: string;
  recurring?: RecurringCharges;
  operations?: BillableOperations;
};
