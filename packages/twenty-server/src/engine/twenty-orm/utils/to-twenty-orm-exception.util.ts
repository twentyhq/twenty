import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

const TWENTY_ORM_CODE_BY_EXECUTOR_CODE: Record<
  WorkspaceQueryExecutorExceptionCode,
  TwentyOrmExceptionCode
> = {
  [WorkspaceQueryExecutorExceptionCode.QUERY_READ_TIMEOUT]:
    TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
  [WorkspaceQueryExecutorExceptionCode.TRANSIENT_DATABASE_ERROR]:
    TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
  [WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED]:
    TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
  [WorkspaceQueryExecutorExceptionCode.INVALID_INPUT]:
    TwentyOrmExceptionCode.INVALID_INPUT,
  [WorkspaceQueryExecutorExceptionCode.MISSING_PARAMETER]:
    TwentyOrmExceptionCode.MISSING_PARAMETER,
  [WorkspaceQueryExecutorExceptionCode.INVALID_PARAMETER]:
    TwentyOrmExceptionCode.INVALID_PARAMETER,
  [WorkspaceQueryExecutorExceptionCode.MALFORMED_SQL]:
    TwentyOrmExceptionCode.MALFORMED_SQL,
  [WorkspaceQueryExecutorExceptionCode.UNSUPPORTED_OPERATION]:
    TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
};

export const toTwentyOrmException = (error: unknown): unknown => {
  if (!(error instanceof WorkspaceQueryExecutorException)) {
    return error;
  }

  const twentyOrmException = new TwentyOrmException(
    error.message,
    TWENTY_ORM_CODE_BY_EXECUTOR_CODE[error.code],
    { userFriendlyMessage: error.userFriendlyMessage },
  );

  return 'cause' in error
    ? Object.assign(twentyOrmException, { cause: error.cause })
    : twentyOrmException;
};
