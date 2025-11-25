import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { handleDuplicateKeyError } from 'src/engine/api/graphql/workspace-query-runner/utils/handle-duplicate-key-error.util';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code?: string;
}

export const computeTwentyORMException = (
  error: Error,
  objectMetadata?: FlatObjectMetadata,
) => {
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

    if (
      error.message.includes(
        'duplicate key value violates unique constraint',
      ) &&
      isDefined(objectMetadata)
    ) {
      return handleDuplicateKeyError(error, objectMetadata);
    }

    if (error.message.includes('invalid input value for')) {
      return new TwentyORMException(
        error.message,
        TwentyORMExceptionCode.INVALID_INPUT,
      );
    }

    const errorCode = (error as QueryFailedErrorWithCode).code;

    if (isDefined(errorCode) && POSTGRESQL_ERROR_CODES.includes(errorCode)) {
      throw new PostgresException(error.message, errorCode);
    }
    throw error;
  }

  return error;
};
