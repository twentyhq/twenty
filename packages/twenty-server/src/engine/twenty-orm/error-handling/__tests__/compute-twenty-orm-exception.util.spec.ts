import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const buildPostgresError = (message: string, code: string): Error =>
  Object.assign(new Error(message), { code });

describe('computeTwentyOrmException', () => {
  it('should map the pg client query timeout to QUERY_READ_TIMEOUT when the error carries no code', () => {
    const error = new Error('Query read timeout');

    const result = computeTwentyOrmException(error);

    expect(result).toBeInstanceOf(TwentyOrmException);
    expect((result as TwentyOrmException).code).toBe(
      TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
    );
    expect(result.message).toBe('Query read timeout');
  });

  it('should map a unique violation to DUPLICATE_ENTRY_DETECTED', () => {
    const error = buildPostgresError(
      'duplicate key value violates unique constraint "IDX_person_email"',
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );

    const result = computeTwentyOrmException(error);

    expect(result).toBeInstanceOf(TwentyOrmException);
    expect((result as TwentyOrmException).code).toBe(
      TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
    );
  });

  it('should name the violated constraint and its table when the driver reports them', () => {
    const error = Object.assign(
      new Error('duplicate key value violates unique constraint'),
      {
        code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
        constraint: 'IDX_UNIQUE_9f2b1a',
        table: 'messageThreadTarget',
      },
    );

    const result = computeTwentyOrmException(error);

    expect(result.message).toBe(
      'A duplicate entry was detected: unique constraint messageThreadTarget.IDX_UNIQUE_9f2b1a was violated',
    );
  });

  it('should keep the bare duplicate message when the driver reports no constraint', () => {
    const error = buildPostgresError(
      'duplicate key value violates unique constraint',
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );

    const result = computeTwentyOrmException(error);

    expect(result.message).toBe('A duplicate entry was detected');
  });

  it('should map an invalid text representation to INVALID_INPUT', () => {
    const error = buildPostgresError(
      'invalid input syntax for type uuid: "not-a-uuid"',
      POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
    );

    const result = computeTwentyOrmException(error);

    expect(result).toBeInstanceOf(TwentyOrmException);
    expect((result as TwentyOrmException).code).toBe(
      TwentyOrmExceptionCode.INVALID_INPUT,
    );
    expect(result.message).toBe(
      'invalid input syntax for type uuid: "not-a-uuid"',
    );
  });

  it.each([
    POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
    POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
    POSTGRESQL_ERROR_CODES.RESTRICT_VIOLATION,
  ])('should map the constraint violation %s to INVALID_INPUT', (code) => {
    const result = computeTwentyOrmException(
      buildPostgresError('constraint violation', code),
    );

    expect(result).toBeInstanceOf(TwentyOrmException);
    expect((result as TwentyOrmException).code).toBe(
      TwentyOrmExceptionCode.INVALID_INPUT,
    );
  });

  it.each([
    POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
    POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
    POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
  ])(
    'should map the transient failure %s to TRANSIENT_DATABASE_ERROR',
    (code) => {
      const result = computeTwentyOrmException(
        buildPostgresError(
          'terminating connection due to idle-in-transaction timeout',
          code,
        ),
      );

      expect(result).toBeInstanceOf(TwentyOrmException);
      expect((result as TwentyOrmException).code).toBe(
        TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
      );
    },
  );

  it('should map any other known postgres code to a PostgresException carrying that code', () => {
    const error = buildPostgresError(
      'cannot execute UPDATE in a read-only transaction',
      POSTGRESQL_ERROR_CODES.READ_ONLY_SQL_TRANSACTION,
    );

    const result = computeTwentyOrmException(error);

    expect(result).toBeInstanceOf(PostgresException);
    expect((result as PostgresException).code).toBe(
      POSTGRESQL_ERROR_CODES.READ_ONLY_SQL_TRANSACTION,
    );
    expect(result.message).toBe('Data validation error.');
  });

  it('should return a TRANSIENT_DATABASE_ERROR exception when the socket dies before postgres reports a code', () => {
    const error = new Error('Connection terminated unexpectedly');

    const result = computeTwentyOrmException(error);

    expect(result).toBeInstanceOf(TwentyOrmException);
    expect((result as TwentyOrmException).code).toBe(
      TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
    );
  });

  it('should return an unrecognised driver error untouched', () => {
    const error = new Error('some driver failure nobody maps');

    expect(computeTwentyOrmException(error)).toBe(error);
  });

  it('should return an error carrying an unknown code untouched', () => {
    const error = buildPostgresError('some driver failure', 'NOT_A_PG_CODE');

    expect(computeTwentyOrmException(error)).toBe(error);
  });

  it('should leave an exception the query builder already computed untouched', () => {
    const error = new TwentyOrmException(
      'Join path "person.tasks" is to-many',
      TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
    );

    expect(computeTwentyOrmException(error)).toBe(error);
  });

  it('should wrap a non-Error throw rather than reading message off it', () => {
    const result = computeTwentyOrmException('connection lost');

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('connection lost');
  });

  it('should keep the original driver error as cause so its detail survives', () => {
    const error = buildPostgresError(
      'duplicate key value violates unique constraint "IDX_person_email"',
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );

    const result = computeTwentyOrmException(error);

    expect((result as Error & { cause?: Error }).cause).toBe(error);
  });
});
