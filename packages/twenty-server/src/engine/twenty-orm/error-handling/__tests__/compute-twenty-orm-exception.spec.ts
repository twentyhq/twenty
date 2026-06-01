import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

import { computeTwentyORMException } from '../compute-twenty-orm-exception';

const createQueryFailedError = ({
  message,
  code,
}: {
  message: string;
  code: string;
}) => {
  const queryFailedError = new QueryFailedError(
    'SELECT 1',
    [],
    new Error(message),
  );

  Object.assign(queryFailedError, { code });

  return queryFailedError;
};

describe('computeTwentyORMException', () => {
  it('should map invalid text representation to INVALID_INPUT', async () => {
    const queryFailedError = createQueryFailedError({
      message: 'invalid input value for enum "task_status_enum": "NOT_A_STATUS"',
      code: POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
    });

    const exception = await computeTwentyORMException(queryFailedError);

    expect(exception).toBeInstanceOf(TwentyORMException);
    expect((exception as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
  });

  it('should keep a generic data validation message for validation postgres errors', async () => {
    const queryFailedError = createQueryFailedError({
      message: 'insert or update on table "person" violates foreign key constraint',
      code: POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
    });

    await expect(computeTwentyORMException(queryFailedError)).rejects.toMatchObject(
      new PostgresException(
        'Data validation error.',
        POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
      ),
    );
  });

  it('should preserve transient postgres error messages', async () => {
    const queryFailedError = createQueryFailedError({
      message: 'deadlock detected',
      code: POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
    });

    await expect(computeTwentyORMException(queryFailedError)).rejects.toMatchObject(
      new PostgresException(
        'deadlock detected',
        POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
      ),
    );
  });
});
