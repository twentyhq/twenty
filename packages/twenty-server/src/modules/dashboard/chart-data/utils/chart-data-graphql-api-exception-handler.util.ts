import { Logger } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

const logger = new Logger('ChartDataGraphqlApiExceptionHandler');

export const chartDataGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof ChartDataException) {
    switch (error.code) {
      case ChartDataExceptionCode.WIDGET_NOT_FOUND:
      case ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      case ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND:
        logger.warn(error.message);
        throw new NotFoundError(error.message);
      case ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION:
        logger.warn(error.message);
        throw new UserInputError(error.message);
      case ChartDataExceptionCode.PERMISSION_DENIED:
        logger.warn(error.message);
        throw new ForbiddenError(error.message);
      case ChartDataExceptionCode.QUERY_EXECUTION_FAILED:
      case ChartDataExceptionCode.TRANSFORMATION_FAILED:
        logger.error(error.message, error.stack);
        throw new InternalServerError(error.message);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  logger.error(error.message, error.stack);
  throw error;
};
