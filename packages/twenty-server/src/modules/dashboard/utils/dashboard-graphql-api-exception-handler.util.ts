import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  DashboardException,
  DashboardExceptionCode,
} from 'src/modules/dashboard/exceptions/dashboard.exception';

export const dashboardGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof DashboardException) {
    switch (error.code) {
      case DashboardExceptionCode.DASHBOARD_NOT_FOUND:
        throw new NotFoundError(error.message);
      case DashboardExceptionCode.PAGE_LAYOUT_NOT_FOUND:
        throw new NotFoundError(error.message);
      case DashboardExceptionCode.DASHBOARD_DUPLICATION_FAILED:
        throw new InternalServerError(error.message);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
