import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { QUERY_READ_TIMEOUT_MESSAGE } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import { TwentyORMExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

// Postgres SQLSTATEs and node errnos both surface as `code`.
const SELF_SPACED_ERROR_CODES: string[] = [
  TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
  POSTGRESQL_ERROR_CODES.QUERY_CANCELED,
  POSTGRESQL_ERROR_CODES.IDLE_SESSION_TIMEOUT,
  POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
  POSTGRESQL_ERROR_CODES.TRANSACTION_TIMEOUT,
  'ETIMEDOUT',
];

const RESOLVED_BY_ANOTHER_TRANSACTION_ERROR_CODES: string[] = [
  POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE,
  POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
  POSTGRESQL_ERROR_CODES.LOCK_NOT_AVAILABLE,
];

// Lost mid-flight, which the pool replaces on the next attempt. Refusing to
// open a connection is not in here: the server is reporting that it has no
// capacity, so an immediate replay would only add load.
const LOST_CONNECTION_ERROR_CODES: string[] = [
  POSTGRESQL_ERROR_CODES.CONNECTION_EXCEPTION,
  POSTGRESQL_ERROR_CODES.CONNECTION_DOES_NOT_EXIST,
  POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
  POSTGRESQL_ERROR_CODES.PROTOCOL_VIOLATION,
  // What a failover or a restart sends to the query it kills.
  POSTGRESQL_ERROR_CODES.ADMIN_SHUTDOWN,
  POSTGRESQL_ERROR_CODES.CRASH_SHUTDOWN,
  'ECONNRESET',
  'EPIPE',
];

// node-postgres raises these itself rather than relaying a SQLSTATE, so they
// arrive with no code at all.
const RETRYABLE_CODELESS_ERROR_MESSAGES: string[] = [
  QUERY_READ_TIMEOUT_MESSAGE,
  'Connection terminated',
  'Client has encountered a connection error and is not queryable',
  'Client was closed and is not queryable',
];

const RETRYABLE_ERROR_CODES = [
  ...SELF_SPACED_ERROR_CODES,
  ...RESOLVED_BY_ANOTHER_TRANSACTION_ERROR_CODES,
  ...LOST_CONNECTION_ERROR_CODES,
];

export const isTransientStepExecutionError = (error: unknown): boolean => {
  if (!isDefined(error) || typeof error !== 'object') {
    return false;
  }

  const { code, message } = error as { code?: unknown; message?: unknown };

  if (isNonEmptyString(code)) {
    return RETRYABLE_ERROR_CODES.includes(code);
  }

  return (
    isNonEmptyString(message) &&
    RETRYABLE_CODELESS_ERROR_MESSAGES.some((retryableMessage) =>
      message.includes(retryableMessage),
    )
  );
};
