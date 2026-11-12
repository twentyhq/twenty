import { toPermissionsException } from 'src/engine/permissions/internal/record-permission-repository/utils/to-permissions-exception.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

describe('toPermissionsException', () => {
  it.each([
    [
      WorkspaceQueryExecutorExceptionCode.INVALID_INPUT,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_INVALID,
    ],
    [
      WorkspaceQueryExecutorExceptionCode.DUPLICATE_ENTRY_DETECTED,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_INVALID,
    ],
    [
      WorkspaceQueryExecutorExceptionCode.QUERY_READ_TIMEOUT,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED,
    ],
    [
      WorkspaceQueryExecutorExceptionCode.TRANSIENT_DATABASE_ERROR,
      PermissionsExceptionCode.RECORD_PERMISSION_QUERY_FAILED,
    ],
  ])('maps %s to %s', (code, expectedCode) => {
    const error = new WorkspaceQueryExecutorException({
      message: 'message',
      code,
    });

    const result = toPermissionsException(error);

    expect(result).toBeInstanceOf(PermissionsException);
    expect(result).toMatchObject({
      code: expectedCode,
      message: 'message',
      userFriendlyMessage: error.userFriendlyMessage,
    });
  });

  it('keeps the cause', () => {
    const cause = new Error('pg error');
    const error = Object.assign(
      new WorkspaceQueryExecutorException({
        message: 'message',
        code: WorkspaceQueryExecutorExceptionCode.INVALID_INPUT,
      }),
      { cause },
    );

    expect(toPermissionsException(error)).toHaveProperty('cause', cause);
  });

  it('returns any other error unchanged', () => {
    const error = new Error('other');

    expect(toPermissionsException(error)).toBe(error);
  });
});
