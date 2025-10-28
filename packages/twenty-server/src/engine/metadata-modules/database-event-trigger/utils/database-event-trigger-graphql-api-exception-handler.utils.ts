import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  DatabaseEventTriggerException,
  DatabaseEventTriggerExceptionCode,
} from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';

export const databaseEventTriggerGraphQLApiExceptionHandler = (
  error: Error,
): void => {
  if (error instanceof DatabaseEventTriggerException) {
    switch (error.code) {
      case DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND:
        throw new NotFoundError('Database event trigger not found');
      case DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_ALREADY_EXIST:
        throw new ConflictError('Database event trigger already exists');
      default:
        throw error;
    }
  }

  throw error;
};
