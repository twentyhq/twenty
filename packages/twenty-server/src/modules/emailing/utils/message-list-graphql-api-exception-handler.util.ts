import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';

export const messageListGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof MessageListException) {
    switch (error.code) {
      case MessageListExceptionCode.MESSAGE_LIST_NOT_FOUND:
        throw new NotFoundError(error);
      case MessageListExceptionCode.MESSAGE_LIST_TOO_MANY_PEOPLE_TO_ADD:
        throw new UserInputError(error);
      case MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_IN_PROGRESS:
        throw new ConflictError(error);
      case MessageListExceptionCode.MESSAGE_LIST_DUPLICATION_FAILED:
      case MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_FAILED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
