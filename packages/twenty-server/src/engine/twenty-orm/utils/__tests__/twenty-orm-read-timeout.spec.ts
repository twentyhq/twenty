import { TimeoutError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { twentyOrmGraphqlApiExceptionHandler } from 'src/engine/twenty-orm/utils/twenty-orm-graphql-api-exception-handler.util';

describe('read timeout API classification', () => {
  it('exposes a typed timeout so clients can omit an expensive exact count', () => {
    const exception = new TwentyOrmException(
      'Read exceeded its deadline',
      TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
    );
    expect(() => twentyOrmGraphqlApiExceptionHandler(exception)).toThrow(
      TimeoutError,
    );
    try {
      twentyOrmGraphqlApiExceptionHandler(exception);
    } catch (error) {
      expect(error).toMatchObject({
        extensions: { code: 'TIMEOUT', subCode: 'QUERY_READ_TIMEOUT' },
      });
    }
  });
});
