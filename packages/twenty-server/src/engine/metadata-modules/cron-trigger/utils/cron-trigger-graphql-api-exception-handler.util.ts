import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CronTriggerException,
  CronTriggerExceptionCode,
} from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';

export const cronTriggerGraphQLApiExceptionHandler = (error: Error): void => {
  if (error instanceof CronTriggerException) {
    switch (error.code) {
      case CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND:
        throw new NotFoundError('Cron trigger not found');
      case CronTriggerExceptionCode.CRON_TRIGGER_ALREADY_EXIST:
        throw new ConflictError('Cron trigger already exists');
      default:
        throw error;
    }
  }

  throw error;
};
