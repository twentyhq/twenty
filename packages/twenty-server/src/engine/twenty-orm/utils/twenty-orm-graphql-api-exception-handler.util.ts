import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';

export const twentyOrmGraphqlApiExceptionHandler = (
  error: TwentyOrmException,
) => {
  if (!isTwentyOrmUserInputError(error)) {
    throw error;
  }

  const { userFriendlyMessage, conflictingRecord } = error;

  if (!isDefined(conflictingRecord)) {
    throw new UserInputError(error.message, { userFriendlyMessage });
  }

  throw new UserInputError(error.message, {
    userFriendlyMessage,
    conflictingRecordId: conflictingRecord.id,
    conflictingObjectNameSingular: conflictingRecord.objectNameSingular,
  });
};
