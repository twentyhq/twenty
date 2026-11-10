import { Temporal } from 'temporal-polyfill';

let evaluationNow: string | undefined;

// Date functions read the evaluation's now, so a batch keeps one clock across midnight
export const runWithValidationRuleNow = <TResult>(
  now: string,
  run: () => TResult,
): TResult => {
  const previousNow = evaluationNow;

  evaluationNow = now;

  try {
    return run();
  } finally {
    evaluationNow = previousNow;
  }
};

export const getValidationRuleNowInUtc = (): Temporal.ZonedDateTime =>
  evaluationNow === undefined
    ? Temporal.Now.zonedDateTimeISO('UTC')
    : Temporal.Instant.from(evaluationNow).toZonedDateTimeISO('UTC');
