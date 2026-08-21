import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { QUERY_READ_TIMEOUT_MESSAGE } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { computeTwentyORMException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTransientStepExecutionError } from 'src/modules/workflow/workflow-executor/utils/is-transient-step-execution-error.util';

const buildErrorWithCode = (code: string) =>
  Object.assign(new Error('Something went wrong'), { code });

// Spelled out rather than imported from the util, so dropping a code from it
// fails here instead of silently narrowing what gets replayed.
const RETRYABLE_CODES = [
  TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
  POSTGRESQL_ERROR_CODES.QUERY_CANCELED,
  POSTGRESQL_ERROR_CODES.IDLE_SESSION_TIMEOUT,
  POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
  POSTGRESQL_ERROR_CODES.TRANSACTION_TIMEOUT,
  POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE,
  POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
  POSTGRESQL_ERROR_CODES.LOCK_NOT_AVAILABLE,
  POSTGRESQL_ERROR_CODES.CONNECTION_EXCEPTION,
  POSTGRESQL_ERROR_CODES.CONNECTION_DOES_NOT_EXIST,
  POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
  POSTGRESQL_ERROR_CODES.PROTOCOL_VIOLATION,
  POSTGRESQL_ERROR_CODES.ADMIN_SHUTDOWN,
  POSTGRESQL_ERROR_CODES.CRASH_SHUTDOWN,
  'ETIMEDOUT',
  'ECONNRESET',
  'EPIPE',
];

const TERMINAL_CODES = [
  POSTGRESQL_ERROR_CODES.TOO_MANY_CONNECTIONS,
  POSTGRESQL_ERROR_CODES.OUT_OF_MEMORY,
  POSTGRESQL_ERROR_CODES.INSUFFICIENT_RESOURCES,
  POSTGRESQL_ERROR_CODES.CANNOT_CONNECT_NOW,
  POSTGRESQL_ERROR_CODES.SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION,
  POSTGRESQL_ERROR_CODES.SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION,
  POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
  POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
  POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION,
  'ECONNREFUSED',
  'EAI_AGAIN',
];

describe('isTransientStepExecutionError', () => {
  it.each(RETRYABLE_CODES)('replays %s', (code) => {
    expect(isTransientStepExecutionError(buildErrorWithCode(code))).toBe(true);
  });

  it.each(TERMINAL_CODES)('does not replay %s', (code) => {
    expect(isTransientStepExecutionError(buildErrorWithCode(code))).toBe(false);
  });

  it('replays the read timeout as the orm reports it, which is the shape a step receives', () => {
    expect(
      isTransientStepExecutionError(
        new TwentyORMException(
          QUERY_READ_TIMEOUT_MESSAGE,
          TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
        ),
      ),
    ).toBe(true);
  });

  it('replays the read timeout the postgres client raises without a code', () => {
    expect(
      isTransientStepExecutionError(
        new QueryFailedError(
          'select 1',
          [],
          new Error(QUERY_READ_TIMEOUT_MESSAGE),
        ),
      ),
    ).toBe(true);
  });

  it('does not replay an error that only quotes the read timeout in its message', () => {
    expect(
      isTransientStepExecutionError(
        Object.assign(
          new Error(
            `invalid input syntax for type uuid: "${QUERY_READ_TIMEOUT_MESSAGE}"`,
          ),
          { code: POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION },
        ),
      ),
    ).toBe(false);
  });

  it.each([
    'Connection terminated unexpectedly',
    'Connection terminated',
    'Client has encountered a connection error and is not queryable',
    'Client was closed and is not queryable',
  ])('replays the codeless connection loss "%s"', async (message) => {
    const error = await computeTwentyORMException(
      new QueryFailedError('select 1', [], new Error(message)),
    ).catch((thrownError) => thrownError);

    expect(isTransientStepExecutionError(error)).toBe(true);
  });

  it('replays what the orm builds from a read timeout', async () => {
    const error = await computeTwentyORMException(
      new QueryFailedError(
        'select 1',
        [],
        new Error(QUERY_READ_TIMEOUT_MESSAGE),
      ),
    ).catch((thrownError) => thrownError);

    expect(isTransientStepExecutionError(error)).toBe(true);
  });

  it('does not replay a constraint violation raised by the query runner', () => {
    expect(
      isTransientStepExecutionError(
        new PostgresException(
          'Data validation error.',
          POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
        ),
      ),
    ).toBe(false);
  });

  it('does not replay an ordinary error', () => {
    expect(
      isTransientStepExecutionError(
        new Error('Cannot read properties of undefined'),
      ),
    ).toBe(false);
  });

  it('does not replay when there is no error', () => {
    expect(isTransientStepExecutionError(undefined)).toBe(false);
  });
});
