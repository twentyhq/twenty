import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';

export const routeTriggerGraphQLApiExceptionHandler = (error: Error): void => {
  if (error instanceof RouteTriggerException) {
    switch (error.code) {
      case RouteTriggerExceptionCode.ROUTE_NOT_FOUND:
        throw new NotFoundError('Route not found');
      case RouteTriggerExceptionCode.ROUTE_ALREADY_EXIST:
        throw new ConflictError('Route already exists');
      default:
        throw error;
    }
  }

  throw error;
};
