import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';

interface DuplicateKeyErrorWithMetadata extends TwentyOrmException {
  conflictingRecordId?: string;
  conflictingObjectNameSingular?: string;
}

export const twentyOrmGraphqlApiExceptionHandler = (
  error: TwentyOrmException,
) => {
  switch (true) {
    case error.code === TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED: {
      const duplicateKeyError: DuplicateKeyErrorWithMetadata = error;

      const extensions: Record<string, unknown> = {
        userFriendlyMessage: error.userFriendlyMessage,
        ...(isDefined(duplicateKeyError.conflictingRecordId) &&
        isDefined(duplicateKeyError.conflictingObjectNameSingular)
          ? {
              conflictingRecordId: duplicateKeyError.conflictingRecordId,
              conflictingObjectNameSingular:
                duplicateKeyError.conflictingObjectNameSingular,
            }
          : {}),
      };

      throw new UserInputError(error.message, extensions);
    }

    case isTwentyOrmUserInputError(error):
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
