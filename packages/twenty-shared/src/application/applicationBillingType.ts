import { type BillableOperations } from '@/application/billableOperationsType';
import { type ApplicationBillingPrice } from '@/application/applicationBillingPriceType';

/** @deprecated Use `billing.prices` */
export const RECURRING_CHARGE_PERIODS = ['MONTH'] as const;

/** @deprecated Use `billing.prices` */
export type RecurringChargePeriod = (typeof RECURRING_CHARGE_PERIODS)[number];

/** @deprecated Use `billing.prices` */
export const isRecurringChargePeriod = (
  value: unknown,
): value is RecurringChargePeriod =>
  RECURRING_CHARGE_PERIODS.includes(value as RecurringChargePeriod);

// Omitted for a flat fee; WORKSPACE_MEMBER multiplies by the member count when the period is charged.
/** @deprecated Use `billing.prices` */
export const RECURRING_CHARGE_UNITS = ['WORKSPACE_MEMBER'] as const;

/** @deprecated Use `billing.prices` */
export type RecurringChargeUnit = (typeof RECURRING_CHARGE_UNITS)[number];

/** @deprecated Use `billing.prices` */
export const isRecurringChargeUnit = (
  value: unknown,
): value is RecurringChargeUnit =>
  RECURRING_CHARGE_UNITS.includes(value as RecurringChargeUnit);

/** @deprecated Use `billing.prices` */
export type RecurringCharge = {
  period: RecurringChargePeriod;
  amountMicroCredits: number;
  per?: RecurringChargeUnit;
  label: string;
};

// 1 USD = 1_000_000 micro-credits; these bound what the platform debits on an app's unvalidated declaration.
// PER_UNIT bounds the declared rate (multiplied by member count for WORKSPACE_MEMBER), PER_PERIOD the total.
/** @deprecated Use `billing.prices` */
export const MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT = 100_000_000;
/** @deprecated Use `billing.prices` */
export const MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_PERIOD = 1_000_000_000;

/** @deprecated Use `billing.prices` */
export const isRecurringChargeAmount = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0 &&
  value <= MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT;

// Reaches the raise path as untrusted jsonb, so its shape is checked at runtime.
/** @deprecated Use `billing.prices` */
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

// Raised by the platform once per billing period, unlike operations the app charges via chargeCredits.
/** @deprecated Use `billing.prices` */
export type RecurringCharges = Partial<Record<string, RecurringCharge>>;

export type ApplicationBilling = {
  description?: string;
  /** @deprecated Use `prices` */
  recurring?: RecurringCharges;
  prices?: ApplicationBillingPrice[];
  operations?: BillableOperations;
};
