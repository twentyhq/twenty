import { CronExpressionParser } from 'cron-parser';

export const getDueTriggerTimestamp = (
  pattern: string,
  now: Date,
  rootCronIntervalMs = 60_000,
): number | null => {
  try {
    const interval = CronExpressionParser.parse(pattern, {
      currentDate: now,
    });

    const lastTriggerTimestamp = interval.prev().getTime();
    const elapsedSinceLastTrigger = now.getTime() - lastTriggerTimestamp;

    return elapsedSinceLastTrigger < rootCronIntervalMs
      ? lastTriggerTimestamp
      : null;
  } catch {
    return null;
  }
};
