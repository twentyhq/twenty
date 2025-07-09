import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const twentyORMGraphqlApiExceptionHandler = (
  error: TwentyORMException,
) => {
  switch (error.code) {
    case TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case TwentyORMExceptionCode.CONNECT_NOT_ALLOWED:
    case TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
