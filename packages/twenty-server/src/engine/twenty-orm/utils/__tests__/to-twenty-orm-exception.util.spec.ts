import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import {
  WorkspaceQueryExecutorException,
  WorkspaceQueryExecutorExceptionCode,
} from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';

describe('toTwentyOrmException', () => {
  it.each(Object.values(WorkspaceQueryExecutorExceptionCode))(
    'keeps the code, message and user friendly message of %s',
    (code) => {
      const error = new WorkspaceQueryExecutorException({
        message: 'message',
        code,
      });

      const result = toTwentyOrmException(error);

      expect(result).toBeInstanceOf(TwentyOrmException);
      expect(result).toMatchObject({
        code: TwentyOrmExceptionCode[code],
        message: 'message',
        userFriendlyMessage: error.userFriendlyMessage,
      });
    },
  );

  it('keeps the cause', () => {
    const cause = new Error('pg error');
    const error = Object.assign(
      new WorkspaceQueryExecutorException({
        message: 'message',
        code: WorkspaceQueryExecutorExceptionCode.INVALID_INPUT,
      }),
      { cause },
    );

    expect(toTwentyOrmException(error)).toHaveProperty('cause', cause);
  });

  it('returns any other error unchanged', () => {
    const error = new Error('other');

    expect(toTwentyOrmException(error)).toBe(error);
  });
});
