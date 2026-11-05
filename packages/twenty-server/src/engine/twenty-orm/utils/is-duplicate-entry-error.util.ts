import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

export const isDuplicateEntryError = (error: unknown): boolean =>
  error instanceof WorkspaceQueryExecutorException &&
  error.code === WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED;
