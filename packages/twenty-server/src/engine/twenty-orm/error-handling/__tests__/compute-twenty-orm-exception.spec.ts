import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const makeQueryFailedError = (code: string) => {
  const error = new QueryFailedError('query', [], new Error('driver error'));

  (error as unknown as { code: string }).code = code;

  return error;
};

describe('computeTwentyORMException', () => {
  it('classifies an integrity-constraint violation as a client INVALID_INPUT error', async () => {
    const result = await computeTwentyORMException(
      makeQueryFailedError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION),
    );

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
  });

  it('keeps a connection failure as a server-side PostgresException', async () => {
    await expect(
      computeTwentyORMException(
        makeQueryFailedError(POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE),
      ),
    ).rejects.toBeInstanceOf(PostgresException);
  });
});
