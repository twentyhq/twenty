import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RouteException,
  RouteExceptionCode,
} from 'src/engine/metadata-modules/route/exceptions/route.exception';

export const routeGraphQLApiExceptionHandler = (error: Error): void => {
  if (error instanceof RouteException) {
    switch (error.code) {
      case RouteExceptionCode.ROUTE_NOT_FOUND:
        throw new NotFoundError('Route not found');
      case RouteExceptionCode.ROUTE_ALREADY_EXIST:
        throw new ConflictError('Route already exists');
      default:
        throw error;
    }
  }

  throw error;
};
