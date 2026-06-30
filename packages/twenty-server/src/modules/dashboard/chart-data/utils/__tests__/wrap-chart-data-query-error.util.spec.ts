import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  ChartDataException,
  ChartDataExceptionCode,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { wrapChartDataQueryError } from 'src/modules/dashboard/chart-data/utils/wrap-chart-data-query-error.util';

describe('wrapChartDataQueryError', () => {
  it('should pass through an existing ChartDataException unchanged', () => {
    const original = new ChartDataException(
      'Object metadata not found',
      ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );

    const result = wrapChartDataQueryError(original, 'Bar chart');

    expect(result).toBe(original);
  });

  it('should map a record-level permission error to PERMISSION_DENIED', () => {
    const permissionError = new PermissionsException(
      'Entity performing the request does not have permission',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    const result = wrapChartDataQueryError(permissionError, 'Bar chart');

    expect(result).toBeInstanceOf(ChartDataException);
    expect(result.code).toBe(ChartDataExceptionCode.PERMISSION_DENIED);
  });

  it('should wrap an unknown error as QUERY_EXECUTION_FAILED with the context prefix', () => {
    const result = wrapChartDataQueryError(
      new Error('boom'),
      'Bar chart data retrieval failed',
    );

    expect(result).toBeInstanceOf(ChartDataException);
    expect(result.code).toBe(ChartDataExceptionCode.QUERY_EXECUTION_FAILED);
    expect(result.message).toContain('Bar chart data retrieval failed: boom');
  });

  it('should not map a non-permission-denied PermissionsException to PERMISSION_DENIED', () => {
    const otherPermissionError = new PermissionsException(
      'Method not allowed',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
    );

    const result = wrapChartDataQueryError(otherPermissionError, 'Bar chart');

    expect(result.code).toBe(ChartDataExceptionCode.QUERY_EXECUTION_FAILED);
  });
});
