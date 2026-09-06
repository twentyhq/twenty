import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
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
      case MessageListExceptionCode.MESSAGE_LIST_DUPLICATION_FAILED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
