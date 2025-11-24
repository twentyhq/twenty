import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const twentyORMGraphqlApiExceptionHandler = (
  error: TwentyORMException,
) => {
  switch (error.code) {
    case TwentyORMExceptionCode.INVALID_INPUT:
    case TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED:
    case TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case TwentyORMExceptionCode.CONNECT_NOT_ALLOWED:
    case TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
    case TwentyORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
