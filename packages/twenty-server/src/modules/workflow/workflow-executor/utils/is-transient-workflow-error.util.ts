import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

const TRANSIENT_ORM_EXCEPTION_CODES: TwentyORMExceptionCode[] = [
  TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
];

const TRANSIENT_POSTGRES_ERROR_CODES: string[] = [
  POSTGRESQL_ERROR_CODES.CONNECTION_EXCEPTION,
  POSTGRESQL_ERROR_CODES.CONNECTION_DOES_NOT_EXIST,
  POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
  POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE,
  POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
  POSTGRESQL_ERROR_CODES.TOO_MANY_CONNECTIONS,
  POSTGRESQL_ERROR_CODES.LOCK_NOT_AVAILABLE,
  POSTGRESQL_ERROR_CODES.QUERY_CANCELED,
  POSTGRESQL_ERROR_CODES.CANNOT_CONNECT_NOW,
];

export const isTransientWorkflowError = (error: unknown): boolean => {
  if (
    error instanceof TwentyORMException &&
    TRANSIENT_ORM_EXCEPTION_CODES.includes(error.code)
  ) {
    return true;
  }

  if (error instanceof QueryFailedError) {
    const errorCode = (error as QueryFailedError & { code?: string }).code;

    if (isDefined(errorCode) && TRANSIENT_POSTGRES_ERROR_CODES.includes(errorCode)) {
      return true;
    }
  }

  // The raw DB read-timeout surfaces as a message match before it is wrapped
  // into a TwentyORMException, so match it here too.
  return (
    error instanceof Error && error.message.includes('Query read timeout')
  );
};
