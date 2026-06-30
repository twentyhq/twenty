import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

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

  return new ChartDataException(
    generateChartDataExceptionMessage(
      ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
      `${contextPrefix}: ${error instanceof Error ? error.message : String(error)}`,
    ),
    ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
  );
};
