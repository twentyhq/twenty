import { CronTriggerException } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';

export const cronTriggerGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof CronTriggerException) {
    throw error;
  }

  throw error;
};
