import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { TRANSIENT_POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/transient-postgres-error-codes.constants';
import {
  CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES,
  QUERY_READ_TIMEOUT_MESSAGE,
  QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE,
  TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE,
} from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-messages.constants';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { CustomException } from 'src/utils/custom-exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code?: string;
}

const getPostgresErrorCode = (error: Error): string | undefined =>
  'code' in error && typeof error.code === 'string' ? error.code : undefined;

export const computeTwentyORMException = async (
  error: Error,
  objectMetadata?: FlatObjectMetadata,
  entityManager?: WorkspaceEntityManager,
  internalContext?: WorkspaceInternalContext,
): Promise<Error | TwentyORMException> => {
  if (error instanceof CustomException) {
    return error;
  }

  const postgresErrorCode = getPostgresErrorCode(error);

  if (
    isDefined(postgresErrorCode) &&
    TRANSIENT_POSTGRESQL_ERROR_CODES.includes(postgresErrorCode)
  ) {
    return new TwentyORMException(
      error.message,
      TwentyORMExceptionCode.TRANSIENT_DATABASE_ERROR,
      {
        userFriendlyMessage: TRANSIENT_DATABASE_ERROR_USER_FRIENDLY_MESSAGE,
      },
    );
  }

  if (error instanceof QueryFailedError) {
    if (error.message.includes(QUERY_READ_TIMEOUT_MESSAGE)) {
      return new TwentyORMException(
        QUERY_READ_TIMEOUT_MESSAGE,
        TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
        {
          userFriendlyMessage: QUERY_READ_TIMEOUT_USER_FRIENDLY_MESSAGE,
        },
      );
    }

    const errorCode = (error as QueryFailedErrorWithCode).code;

    if (
      errorCode === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION &&
      isDefined(objectMetadata) &&
      isDefined(entityManager) &&
      isDefined(internalContext)
    ) {
      return await handleDuplicateKeyError(
        error,
        objectMetadata,
        internalContext,
        entityManager,
      );
    }

    if (errorCode === POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
      );
    }

    if (
      isDefined(errorCode) &&
      errorCode in CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES
    ) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage:
            CONSTRAINT_VIOLATION_USER_FRIENDLY_MESSAGES[errorCode],
        },
      );
    }

    if (
      isDefined(errorCode) &&
      Object.values(POSTGRESQL_ERROR_CODES).includes(errorCode)
    ) {
      throw new PostgresException('Data validation error.', errorCode);
    }
    throw error;
  }

  return error;
};
