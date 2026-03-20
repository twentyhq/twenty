import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';

export const messageChannelGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof MessageChannelException) {
    switch (error.code) {
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND:
        throw new NotFoundError(error);
      case MessageChannelExceptionCode.INVALID_MESSAGE_CHANNEL_INPUT:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
