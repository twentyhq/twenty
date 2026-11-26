import { CRON_TRIGGER_MAX_SPREAD_MS } from './constants/CronTriggerMaxSpreadMs';
import { CRON_TRIGGER_MIN_SPREAD_MS } from './constants/CronTriggerMinSpreadMs';

export const isValidCronTriggerSpreadMs = (
  spreadMs: unknown,
): spreadMs is number =>
  typeof spreadMs === 'number' &&
  Number.isInteger(spreadMs) &&
  spreadMs >= CRON_TRIGGER_MIN_SPREAD_MS &&
  spreadMs <= CRON_TRIGGER_MAX_SPREAD_MS;
