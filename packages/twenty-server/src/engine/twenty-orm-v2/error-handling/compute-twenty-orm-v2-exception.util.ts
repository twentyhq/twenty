import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { CustomException } from 'src/utils/custom-exception';

const QUERY_READ_TIMEOUT_MESSAGE = 'Query read timeout';

const KNOWN_POSTGRES_ERROR_CODES: string[] = Object.values(
  POSTGRESQL_ERROR_CODES,
);

const CONSTRAINT_VIOLATION_MESSAGES: Record<string, MessageDescriptor> = {
  [POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION]: msg`A required field is missing. Please provide all required values and try again.`,
  [POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION]: msg`This operation references a record that does not exist or cannot be modified due to existing relationships.`,
  [POSTGRESQL_ERROR_CODES.RESTRICT_VIOLATION]: msg`This record cannot be deleted because it is still referenced by other records.`,
};

const getPostgresErrorCode = (error: Error): string | undefined => {
  const { code } = error as Error & { code?: unknown };

  return typeof code === 'string' ? code : undefined;
};

// The pg error carries the failing statement's detail; the sentry driver reads `cause`
const withCause = <TError extends Error>(
  exception: TError,
  cause: Error,
): TError => Object.assign(exception, { cause });

export const computeTwentyOrmV2Exception = (error: Error): Error => {
  if (error instanceof CustomException) {
    return error;
  }

  if (error.message.includes(QUERY_READ_TIMEOUT_MESSAGE)) {
    return withCause(
      new TwentyOrmV2Exception(
        QUERY_READ_TIMEOUT_MESSAGE,
        TwentyOrmV2ExceptionCode.QUERY_READ_TIMEOUT,
        msg`We are experiencing a temporary issue with our database. Please try again later.`,
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
      new TwentyOrmV2Exception(
        'A duplicate entry was detected',
        TwentyOrmV2ExceptionCode.DUPLICATE_ENTRY_DETECTED,
        msg`This record already exists. Please check your data and try again.`,
      ),
      error,
    );
  }

  if (errorCode === POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION) {
    return withCause(
      new TwentyOrmV2Exception(
        error.message,
        TwentyOrmV2ExceptionCode.INVALID_INPUT,
        msg`Invalid input provided.`,
      ),
      error,
    );
  }

  const constraintViolationMessage = CONSTRAINT_VIOLATION_MESSAGES[errorCode];

  if (isDefined(constraintViolationMessage)) {
    return withCause(
      new TwentyOrmV2Exception(
        error.message,
        TwentyOrmV2ExceptionCode.INVALID_INPUT,
        constraintViolationMessage,
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
