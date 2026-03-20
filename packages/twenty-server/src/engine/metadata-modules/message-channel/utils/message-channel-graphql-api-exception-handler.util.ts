import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
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
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION:
        throw new ForbiddenError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof ConnectedAccountException) {
    switch (error.code) {
      case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION:
      case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND:
        throw new ForbiddenError(error);
      default:
        break;
    }
  }

  throw error;
};
