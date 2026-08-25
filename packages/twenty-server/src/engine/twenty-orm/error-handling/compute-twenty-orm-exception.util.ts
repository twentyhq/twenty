import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import {
  CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES,
  DUPLICATE_ENTRY_DETECTED_MESSAGE,
  DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE,
  INVALID_INPUT_USER_FRIENDLY_MESSAGE,
  QUERY_READ_TIMEOUT_MESSAGE,
  QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE,
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

const getPostgresErrorCode = (error: Error): string | undefined => {
  const { code } = error as Error & { code?: unknown };

  return typeof code === 'string' ? code : undefined;
};

// The pg error carries the failing statement's detail; the sentry driver reads `cause`
const withCause = <TError extends Error>(
  exception: TError,
  cause: Error,
): TError => Object.assign(exception, { cause });

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

  const errorCode = getPostgresErrorCode(error);

  if (!isDefined(errorCode)) {
    return error;
  }

  if (errorCode === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION) {
    return withCause(
      new TwentyOrmException(
        DUPLICATE_ENTRY_DETECTED_MESSAGE,
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
