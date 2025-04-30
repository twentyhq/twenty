import { CronExpressionParser } from 'cron-parser';

export const shouldRunNow = (
  pattern: string,
  now: Date,
  rootCronIntervalMs = 60_000,
) => {
  try {
    const interval = CronExpressionParser.parse(pattern, {
      currentDate: now,
    });

    const prevTriggerDate = interval.prev();
    const diff = Math.abs(prevTriggerDate.getTime() - now.getTime());

    return diff < rootCronIntervalMs;
  } catch {
    return false;
  }
};
