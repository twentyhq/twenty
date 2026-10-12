export type ResolveTrialPeriodDaysInput = {
  defaultTrialPeriodDays: number;
  hasPriorSubscription: boolean;
};

export function resolveTrialPeriodDays({
  defaultTrialPeriodDays,
  hasPriorSubscription,
}: ResolveTrialPeriodDaysInput): number | undefined {
  if (hasPriorSubscription) {
    return undefined;
  }

  if (defaultTrialPeriodDays < 1) {
    return undefined;
  }

  return defaultTrialPeriodDays;
}
