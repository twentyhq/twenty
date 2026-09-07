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

// 1 USD = 1_000_000 micro-credits. Unlike a chargeCredits call, which the app
// makes and the server validates per request, a recurring charge is raised by
// the platform from a jsonb column, so these bound what the platform is willing
// to debit on an app's behalf. PER_UNIT bounds the declared rate, which a
// WORKSPACE_MEMBER charge multiplies by the member count, and PER_PERIOD bounds
// the resulting total.
export const MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT = 100_000_000;
export const MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_PERIOD = 1_000_000_000;

export const isRecurringChargeAmount = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value <= MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT;

// The declaration reaches the raise path as untrusted jsonb, so its shape is
// checked at runtime rather than trusted from the RecurringCharge type.
export const isRecurringCharge = (value: unknown): value is RecurringCharge => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { period, amountMicroCredits, per, label } =
    value as Partial<RecurringCharge>;

  return (
    isRecurringChargePeriod(period) &&
    isRecurringChargeAmount(amountMicroCredits) &&
    (per === undefined || isRecurringChargeUnit(per)) &&
    typeof label === 'string' &&
    label.trim().length > 0
  );
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
