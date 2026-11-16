import { assertUnreachable } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

const computePermissionsExceptionCode = (
  code: WorkspaceQueryExecutorExceptionCode,
): PermissionsExceptionCode => {
  switch (code) {
    case WorkspaceQueryExecutorExceptionCode.INVALID_INPUT:
    case WorkspaceQueryExecutorExceptionCode.INVALID_PARAMETER:
    case WorkspaceQueryExecutorExceptionCode.UNSUPPORTED_OPERATION:
    case WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED:
      return PermissionsExceptionCode.RECORD_PERMISSION_QUERY_INVALID;
    case WorkspaceQueryExecutorExceptionCode.QUERY_READ_TIMEOUT:
    case WorkspaceQueryExecutorExceptionCode.TRANSIENT_DATABASE_ERROR:
    case WorkspaceQueryExecutorExceptionCode.MISSING_PARAMETER:
    case WorkspaceQueryExecutorExceptionCode.MALFORMED_SQL:
      return PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED;
    default:
      return assertUnreachable(code);
  }
};

export const toPermissionsException = (error: unknown): unknown => {
  if (!(error instanceof WorkspaceQueryExecutorException)) {
    return error;
  }

  const permissionsException = new PermissionsException(
    error.message,
    computePermissionsExceptionCode(error.code),
    { userFriendlyMessage: error.userFriendlyMessage },
  );

  return 'cause' in error
    ? Object.assign(permissionsException, { cause: error.cause })
    : permissionsException;
};
