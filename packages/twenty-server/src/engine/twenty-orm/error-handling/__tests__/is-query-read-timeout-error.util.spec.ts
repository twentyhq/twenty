import { QueryFailedError } from 'typeorm';

import {
  QUERY_READ_TIMEOUT_ERROR_MESSAGE,
  isQueryReadTimeoutError,
} from 'src/engine/twenty-orm/error-handling/is-query-read-timeout-error.util';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const buildQueryFailedError = (message: string): QueryFailedError =>
  new QueryFailedError('SELECT 1', [], new Error(message));

describe('isQueryReadTimeoutError', () => {
  it('should return true for a QueryFailedError caused by a query read timeout', () => {
    const error = buildQueryFailedError(QUERY_READ_TIMEOUT_ERROR_MESSAGE);

    expect(isQueryReadTimeoutError(error)).toBe(true);
  });

  it('should return true for a TwentyORMException with the QUERY_READ_TIMEOUT code', () => {
    const error = new TwentyORMException(
      QUERY_READ_TIMEOUT_ERROR_MESSAGE,
      TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
    );

    expect(isQueryReadTimeoutError(error)).toBe(true);
  });

  it('should return false for a QueryFailedError with another driver error', () => {
    const error = buildQueryFailedError('duplicate key value');

    expect(isQueryReadTimeoutError(error)).toBe(false);
  });

  it('should return false for a TwentyORMException with another code', () => {
    const error = new TwentyORMException(
      'Workspace not found',
      TwentyORMExceptionCode.WORKSPACE_NOT_FOUND,
    );

    expect(isQueryReadTimeoutError(error)).toBe(false);
  });

  it('should return false for a generic error that merely mentions a timeout', () => {
    const error = new Error(QUERY_READ_TIMEOUT_ERROR_MESSAGE);

    expect(isQueryReadTimeoutError(error)).toBe(false);
  });
});
