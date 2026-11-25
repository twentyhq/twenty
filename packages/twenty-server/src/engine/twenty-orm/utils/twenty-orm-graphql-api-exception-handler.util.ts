import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';

export const twentyOrmGraphqlApiExceptionHandler = (
  error: TwentyOrmException,
) => {
  if (isTwentyOrmUserInputError(error)) {
    throw new UserInputError(error.message, {
      userFriendlyMessage: error.userFriendlyMessage,
    });
  }

  throw error;
};
