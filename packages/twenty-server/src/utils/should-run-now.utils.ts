import { CronExpressionParser } from 'cron-parser';

/**
 * Returns the epoch-ms of the most recent scheduled trigger when it falls within
 * the current root-cron window (i.e. the pattern is "due" now), or null otherwise.
 *
 * The returned timestamp is stable for a given trigger regardless of when, within
 * the window, the per-minute root job actually runs, so callers can use it as an
 * idempotency key to dispatch a trigger exactly once even if the root job fires
 * twice across a minute boundary.
 */
export const getMatchingTriggerTimestamp = (
  pattern: string,
  now: Date,
  rootCronIntervalMs = 60_000,
): number | null => {
  try {
    const interval = CronExpressionParser.parse(pattern, {
      currentDate: now,
    });

    const prevTriggerTimestamp = interval.prev().getTime();
    const diff = Math.abs(prevTriggerTimestamp - now.getTime());

    return diff < rootCronIntervalMs ? prevTriggerTimestamp : null;
  } catch {
    return null;
  }
};

export const shouldRunNow = (
  pattern: string,
  now: Date,
  rootCronIntervalMs = 60_000,
) => getMatchingTriggerTimestamp(pattern, now, rootCronIntervalMs) !== null;
