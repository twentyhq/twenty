import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

interface DuplicateKeyErrorWithMetadata extends TwentyORMException {
  conflictingRecordId?: string;
  conflictingObjectNameSingular?: string;
}

export const twentyORMGraphqlApiExceptionHandler = (
  error: TwentyORMException,
) => {
  switch (error.code) {
    case TwentyORMExceptionCode.INVALID_INPUT:
    case TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED:
    case TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case TwentyORMExceptionCode.CONNECT_NOT_ALLOWED:
    case TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
    case TwentyORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE: {
      const errorWithMetadata = error as DuplicateKeyErrorWithMetadata;
      const extensions: Record<string, unknown> = {
        userFriendlyMessage: error.userFriendlyMessage,
      };

      if (
        error.code === TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED &&
        isDefined(errorWithMetadata.conflictingRecordId) &&
        isDefined(errorWithMetadata.conflictingObjectNameSingular)
      ) {
        extensions.conflictingRecordId = errorWithMetadata.conflictingRecordId;
        extensions.conflictingObjectNameSingular =
          errorWithMetadata.conflictingObjectNameSingular;
      }

      throw new UserInputError(error.message, extensions);
    }
    default: {
      throw error;
    }
  }
};
