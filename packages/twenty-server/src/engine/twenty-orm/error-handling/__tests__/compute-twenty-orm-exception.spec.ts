import { msg } from '@lingui/core/macro';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { UnknownException } from 'src/utils/custom-exception';

jest.mock(
  'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util',
  () => ({
    handleDuplicateKeyError: jest.fn(),
  }),
);

const handleDuplicateKeyErrorMock = handleDuplicateKeyError as jest.Mock;

const buildQueryFailedError = (
  code: string | undefined,
  message = 'query failed',
): QueryFailedError => {
  const driverError = new Error(message);

  if (code !== undefined) {
    Object.assign(driverError, { code });
  }

  return new QueryFailedError('SELECT 1', [], driverError);
};

describe('computeTwentyORMException', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an INVALID_INPUT exception with a missing-field message when error is a NOT_NULL_VIOLATION', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
    );

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
    expect((result as TwentyORMException).userFriendlyMessage).toEqual(
      msg`A required field is missing. Please provide all required values and try again.`,
    );
  });

  it('should return an INVALID_INPUT exception with a relationship message when error is a FOREIGN_KEY_VIOLATION', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
    );

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
    expect((result as TwentyORMException).userFriendlyMessage).toEqual(
      msg`This operation references a record that does not exist or cannot be modified due to existing relationships.`,
    );
  });

  it('should return an INVALID_INPUT exception with a still-referenced message when error is a RESTRICT_VIOLATION', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.RESTRICT_VIOLATION,
    );

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
    expect((result as TwentyORMException).userFriendlyMessage).toEqual(
      msg`This record cannot be deleted because it is still referenced by other records.`,
    );
  });

  it('should preserve the original message when surfacing a constraint violation as INVALID_INPUT', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
      'null value in column "name" violates not-null constraint',
    );

    const result = await computeTwentyORMException(error);

    expect((result as TwentyORMException).message).toBe(
      'null value in column "name" violates not-null constraint',
    );
  });

  it('should throw the generic PostgresException when error is a CHECK_VIOLATION (handled by the catch-all)', async () => {
    const error = buildQueryFailedError(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION);

    await expect(computeTwentyORMException(error)).rejects.toThrow(
      PostgresException,
    );
    await expect(computeTwentyORMException(error)).rejects.toMatchObject({
      message: 'Data validation error.',
      code: POSTGRESQL_ERROR_CODES.CHECK_VIOLATION,
    });
  });

  it('should return an INVALID_INPUT exception with the original message when error is an INVALID_TEXT_REPRESENTATION', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
      'invalid input syntax for type uuid',
    );

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.INVALID_INPUT,
    );
    expect((result as TwentyORMException).message).toBe(
      'invalid input syntax for type uuid',
    );
  });

  it('should return a QUERY_READ_TIMEOUT exception when error message mentions a query read timeout', async () => {
    const error = buildQueryFailedError(undefined, 'Query read timeout');

    const result = await computeTwentyORMException(error);

    expect(result).toBeInstanceOf(TwentyORMException);
    expect((result as TwentyORMException).code).toBe(
      TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
    );
  });

  it('should delegate to handleDuplicateKeyError when error is a UNIQUE_VIOLATION and metadata context is provided', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );
    const objectMetadata = { nameSingular: 'person' } as never;
    const entityManager = {} as never;
    const internalContext = {} as never;
    const duplicateException = new TwentyORMException(
      'A duplicate entry was detected',
      TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
    );

    handleDuplicateKeyErrorMock.mockResolvedValue(duplicateException);

    const result = await computeTwentyORMException(
      error,
      objectMetadata,
      entityManager,
      internalContext,
    );

    expect(handleDuplicateKeyErrorMock).toHaveBeenCalledWith(
      error,
      objectMetadata,
      internalContext,
      entityManager,
    );
    expect(result).toBe(duplicateException);
  });

  it('should throw the generic PostgresException when error is a known postgres code without dedicated handling', async () => {
    const error = buildQueryFailedError(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR);

    await expect(computeTwentyORMException(error)).rejects.toThrow(
      PostgresException,
    );
    await expect(computeTwentyORMException(error)).rejects.toMatchObject({
      message: 'Data validation error.',
      code: POSTGRESQL_ERROR_CODES.SYNTAX_ERROR,
    });
  });

  it('should return a TRANSIENT_DATABASE_ERROR exception when the transaction is killed by the idle-in-transaction timeout', async () => {
    const error = buildQueryFailedError(
      POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
      'terminating connection due to idle-in-transaction timeout',
    );

    const result = await computeTwentyORMException(error);

    expect(result).toMatchObject({
      code: TwentyORMExceptionCode.TRANSIENT_DATABASE_ERROR,
      message: 'terminating connection due to idle-in-transaction timeout',
    });
  });

  it('should return a TRANSIENT_DATABASE_ERROR exception for a connection error that is not a QueryFailedError', async () => {
    const error = Object.assign(new Error('Connection terminated'), {
      code: POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
    });

    const result = await computeTwentyORMException(error);

    expect(result).toMatchObject({
      code: TwentyORMExceptionCode.TRANSIENT_DATABASE_ERROR,
    });
  });

  it.each([
    POSTGRESQL_ERROR_CODES.CONNECTION_DOES_NOT_EXIST,
    POSTGRESQL_ERROR_CODES.SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION,
    POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE,
    POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
    POSTGRESQL_ERROR_CODES.QUERY_CANCELED,
    POSTGRESQL_ERROR_CODES.ADMIN_SHUTDOWN,
  ])(
    'should return a TRANSIENT_DATABASE_ERROR exception when the transaction fails with the transient code %s',
    async (code) => {
      const result = await computeTwentyORMException(
        buildQueryFailedError(code),
      );

      expect(result).toBeInstanceOf(TwentyORMException);
      expect((result as TwentyORMException).code).toBe(
        TwentyORMExceptionCode.TRANSIENT_DATABASE_ERROR,
      );
    },
  );

  it('should leave a non-transient postgres code on a plain error untouched', async () => {
    const error = Object.assign(
      new Error('duplicate key value violates unique constraint'),
      { code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION },
    );

    const result = await computeTwentyORMException(error);

    expect(result).toBe(error);
  });

  it('should return a domain exception untouched when its own code collides with a transient postgres sqlstate', async () => {
    const alreadyComputed = new UnknownException(
      'A deadlock was detected',
      POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
      { userFriendlyMessage: msg`Please try again later.` },
    );

    const result = await computeTwentyORMException(alreadyComputed);

    expect(result).toBe(alreadyComputed);
  });

  it('should rethrow the original error when error is a QueryFailedError with an unknown code', async () => {
    const error = buildQueryFailedError('99999');

    await expect(computeTwentyORMException(error)).rejects.toBe(error);
  });

  it('should return the error unchanged when error is not a QueryFailedError', async () => {
    const error = new Error('some unrelated error');

    const result = await computeTwentyORMException(error);

    expect(result).toBe(error);
  });
});
