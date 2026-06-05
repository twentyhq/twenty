import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code?: string;
}

export const computeTwentyORMException = async (
  error: Error,
  objectMetadata?: FlatObjectMetadata,
  entityManager?: WorkspaceEntityManager,
  internalContext?: WorkspaceInternalContext,
): Promise<Error | TwentyORMException> => {
  if (error instanceof QueryFailedError) {
    if (error.message.includes('Query read timeout')) {
      return new TwentyORMException(
        'Query read timeout',
        TwentyORMExceptionCode.QUERY_READ_TIMEOUT,
        {
          userFriendlyMessage: msg`We are experiencing a temporary issue with our database. Please try again later.`,
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
        error.message, // safe and useful
        TwentyORMExceptionCode.INVALID_INPUT,
      );
    }

    // NOT NULL constraint — a required field was missing
    if (errorCode === POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A required field is missing. Please provide all required values and try again.`,
        },
      );
    }

    // FOREIGN KEY constraint — referenced record doesn't exist or can't be deleted
    if (errorCode === POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`This operation references a record that does not exist or cannot be modified due to existing relationships.`,
        },
      );
    }

    // RESTRICT constraint — deletion blocked by a dependent record
    if (errorCode === POSTGRESQL_ERROR_CODES.RESTRICT_VIOLATION) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`This record cannot be deleted because it is still referenced by other records.`,
        },
      );
    }

    // CHECK constraint — a field value did not satisfy a database check
    if (errorCode === POSTGRESQL_ERROR_CODES.CHECK_VIOLATION) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`One or more field values are invalid. Please check your input and try again.`,
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

