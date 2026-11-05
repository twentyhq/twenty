import {
  type WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

export const isWorkspaceQueryExecutorUserInputError = (
  error: WorkspaceQueryExecutorException,
): boolean => {
  switch (error.code) {
    case WorkspaceQueryExecutorExceptionCode.INVALID_INPUT:
    case WorkspaceQueryExecutorExceptionCode.INVALID_PARAMETER:
    case WorkspaceQueryExecutorExceptionCode.UNSUPPORTED_OPERATION:
    case WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED:
      return true;
    default:
      return false;
  }
};
