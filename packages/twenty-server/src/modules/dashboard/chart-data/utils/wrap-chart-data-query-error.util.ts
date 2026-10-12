import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

const CHART_CONFIGURATION_ERROR_CODES = new Set<CommonQueryRunnerExceptionCode>(
  [
    CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
  ],
);

export const wrapChartDataQueryError = (
  error: unknown,
  contextPrefix: string,
): ChartDataException => {
  if (error instanceof ChartDataException) {
    return error;
  }

  if (
    error instanceof PermissionsException &&
    error.code === PermissionsExceptionCode.PERMISSION_DENIED
  ) {
    return new ChartDataException(
      generateChartDataExceptionMessage(
        ChartDataExceptionCode.PERMISSION_DENIED,
        error.message,
      ),
      ChartDataExceptionCode.PERMISSION_DENIED,
    );
  }

  if (
    error instanceof CommonQueryRunnerException &&
    CHART_CONFIGURATION_ERROR_CODES.has(error.code)
  ) {
    return new ChartDataException(
      generateChartDataExceptionMessage(
        ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
        `${contextPrefix}: ${error.message}`,
      ),
      ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
    );
  }

  return new ChartDataException(
    generateChartDataExceptionMessage(
      ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
      `${contextPrefix}: ${error instanceof Error ? error.message : String(error)}`,
    ),
    ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
  );
};
