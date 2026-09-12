import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { TRANSIENT_POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/transient-postgres-error-codes.constants';
import {
  CONNECTION_TERMINATED_MESSAGE,
  CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES,
  DUPLICATE_ENTRY_DETECTED_MESSAGE,
  DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE,
  INVALID_INPUT_USER_FRIENDLY_MESSAGE,
  QUERY_READ_TIMEOUT_MESSAGE,
  QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE,
  TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE,
} from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { CustomException } from 'src/utils/custom-exception';

const KNOWN_POSTGRES_ERROR_CODES: string[] = Object.values(
  POSTGRESQL_ERROR_CODES,
);

// The pg error carries the failing statement's detail; the sentry driver reads `cause`
const withCause = <TError extends Error>(
  exception: TError,
  cause: Error,
): TError => Object.assign(exception, { cause });

const computeDuplicateEntryMessage = (error: Error): string => {
  const constraint =
    'constraint' in error && typeof error.constraint === 'string'
      ? error.constraint
      : undefined;

  if (!isDefined(constraint)) {
    return DUPLICATE_ENTRY_DETECTED_MESSAGE;
  }

  const table =
    'table' in error && typeof error.table === 'string'
      ? error.table
      : undefined;

  const qualifiedConstraintName = isDefined(table)
    ? `${table}.${constraint}`
    : constraint;

  return `${DUPLICATE_ENTRY_DETECTED_MESSAGE}: unique constraint ${qualifiedConstraintName} was violated`;
};

export const computeTwentyOrmException = (error: unknown): Error => {
  if (!(error instanceof Error)) {
    return new Error(String(error));
  }

  if (error instanceof CustomException) {
    return error;
  }

  if (error.message.includes(QUERY_READ_TIMEOUT_MESSAGE)) {
    return withCause(
      new TwentyOrmException(
        QUERY_READ_TIMEOUT_MESSAGE,
        TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
        { userFriendlyMessage: QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE },
      ),
      error,
    );
  }

  const errorCode =
    'code' in error && typeof error.code === 'string' ? error.code : undefined;

  if (
    error.message.includes(CONNECTION_TERMINATED_MESSAGE) ||
    (isDefined(errorCode) &&
      TRANSIENT_POSTGRESQL_ERROR_CODES.includes(errorCode))
  ) {
    return withCause(
      new TwentyOrmException(
        error.message,
        TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
        { userFriendlyMessage: TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE },
      ),
      error,
    );
  }

  if (!isDefined(errorCode)) {
    return error;
  }

  if (errorCode === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION) {
    return withCause(
      new TwentyOrmException(
        computeDuplicateEntryMessage(error),
        TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
        { userFriendlyMessage: DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE },
      ),
      error,
    );
  }

  if (errorCode === POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION) {
    return withCause(
      new TwentyOrmException(
        error.message,
        TwentyOrmExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: INVALID_INPUT_USER_FRIENDLY_MESSAGE },
      ),
      error,
    );
  }

  const constraintViolationMessage =
    CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES[errorCode];

  if (isDefined(constraintViolationMessage)) {
    return withCause(
      new TwentyOrmException(
        error.message,
        TwentyOrmExceptionCode.INVALID_INPUT,
        { userFriendlyMessage: constraintViolationMessage },
      ),
      error,
    );
  }

  if (KNOWN_POSTGRES_ERROR_CODES.includes(errorCode)) {
    return withCause(
      new PostgresException('Data validation error.', errorCode),
      error,
    );
  }

  return error;
};
