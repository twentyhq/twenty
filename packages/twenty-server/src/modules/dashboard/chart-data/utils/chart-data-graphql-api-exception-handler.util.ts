import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

export const chartDataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ChartDataException) {
    switch (error.code) {
      case ChartDataExceptionCode.WIDGET_NOT_FOUND:
      case ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION:
        throw new UserInputError(error.message);
      case ChartDataExceptionCode.QUERY_EXECUTION_FAILED:
      case ChartDataExceptionCode.TRANSFORMATION_FAILED:
        throw new InternalServerError(error.message);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
