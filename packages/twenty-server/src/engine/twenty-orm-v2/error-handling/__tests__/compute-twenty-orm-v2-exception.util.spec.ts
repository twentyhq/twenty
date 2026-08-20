import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { computeTwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/error-handling/compute-twenty-orm-v2-exception.util';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';

const buildPostgresError = (message: string, code: string): Error =>
  Object.assign(new Error(message), { code });

describe('computeTwentyOrmV2Exception', () => {
  it('should map the pg client query timeout to QUERY_READ_TIMEOUT when the error carries no code', () => {
    const error = new Error('Query read timeout');

    const result = computeTwentyOrmV2Exception(error);

    expect(result).toBeInstanceOf(TwentyOrmV2Exception);
    expect((result as TwentyOrmV2Exception).code).toBe(
      TwentyOrmV2ExceptionCode.QUERY_READ_TIMEOUT,
    );
    expect(result.message).toBe('Query read timeout');
  });

  it('should map a unique violation to DUPLICATE_ENTRY_DETECTED', () => {
    const error = buildPostgresError(
      'duplicate key value violates unique constraint "IDX_person_email"',
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );

    const result = computeTwentyOrmV2Exception(error);

    expect(result).toBeInstanceOf(TwentyOrmV2Exception);
    expect((result as TwentyOrmV2Exception).code).toBe(
      TwentyOrmV2ExceptionCode.DUPLICATE_ENTRY_DETECTED,
    );
  });

  it('should map an invalid text representation to INVALID_INPUT', () => {
    const error = buildPostgresError(
      'invalid input syntax for type uuid: "not-a-uuid"',
      POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
    );

    const result = computeTwentyOrmV2Exception(error);

    expect(result).toBeInstanceOf(TwentyOrmV2Exception);
    expect((result as TwentyOrmV2Exception).code).toBe(
      TwentyOrmV2ExceptionCode.INVALID_INPUT,
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
    const result = computeTwentyOrmV2Exception(
      buildPostgresError('constraint violation', code),
    );

    expect(result).toBeInstanceOf(TwentyOrmV2Exception);
    expect((result as TwentyOrmV2Exception).code).toBe(
      TwentyOrmV2ExceptionCode.INVALID_INPUT,
    );
  });

  it('should map any other known postgres code to a PostgresException carrying that code', () => {
    const error = buildPostgresError(
      'cannot execute UPDATE in a read-only transaction',
      POSTGRESQL_ERROR_CODES.READ_ONLY_SQL_TRANSACTION,
    );

    const result = computeTwentyOrmV2Exception(error);

    expect(result).toBeInstanceOf(PostgresException);
    expect((result as PostgresException).code).toBe(
      POSTGRESQL_ERROR_CODES.READ_ONLY_SQL_TRANSACTION,
    );
    expect(result.message).toBe('Data validation error.');
  });

  it('should return an unrecognised driver error untouched', () => {
    const error = new Error('Connection terminated unexpectedly');

    expect(computeTwentyOrmV2Exception(error)).toBe(error);
  });

  it('should return an error carrying an unknown code untouched', () => {
    const error = buildPostgresError('some driver failure', 'NOT_A_PG_CODE');

    expect(computeTwentyOrmV2Exception(error)).toBe(error);
  });

  it('should leave an exception the query builder already computed untouched', () => {
    const error = new TwentyOrmV2Exception(
      'Join path "person.tasks" is to-many',
      TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
    );

    expect(computeTwentyOrmV2Exception(error)).toBe(error);
  });

  it('should wrap a non-Error throw rather than reading message off it', () => {
    const result = computeTwentyOrmV2Exception('connection lost');

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('connection lost');
  });

  it('should keep the original driver error as cause so its detail survives', () => {
    const error = buildPostgresError(
      'duplicate key value violates unique constraint "IDX_person_email"',
      POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
    );

    const result = computeTwentyOrmV2Exception(error);

    expect((result as Error & { cause?: Error }).cause).toBe(error);
  });
});
