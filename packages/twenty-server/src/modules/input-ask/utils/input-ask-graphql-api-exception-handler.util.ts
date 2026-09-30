import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type InputAskException,
  InputAskExceptionCode,
} from 'src/modules/input-ask/input-ask.exception';

export const inputAskGraphqlApiExceptionHandler = (
  exception: InputAskException,
): never => {
  switch (exception.code) {
    case InputAskExceptionCode.ASK_NOT_FOUND:
      throw new NotFoundError(exception);
    case InputAskExceptionCode.ASK_NOT_PENDING:
    case InputAskExceptionCode.INVALID_ASK_RESPONSE:
      throw new UserInputError(exception);
    case InputAskExceptionCode.ASK_ANSWER_FORBIDDEN:
      throw new ForbiddenError(exception);
    case InputAskExceptionCode.INPUT_ASK_OBJECT_MISSING:
      throw new InternalServerError(exception);
    default:
      return assertUnreachable(exception.code);
  }
};
