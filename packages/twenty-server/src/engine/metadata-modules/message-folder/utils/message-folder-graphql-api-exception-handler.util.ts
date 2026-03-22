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
import {
  MessageFolderException,
  MessageFolderExceptionCode,
} from 'src/engine/metadata-modules/message-folder/message-folder.exception';

export const messageFolderGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof MessageFolderException) {
    switch (error.code) {
      case MessageFolderExceptionCode.MESSAGE_FOLDER_NOT_FOUND:
        throw new NotFoundError(error);
      case MessageFolderExceptionCode.INVALID_MESSAGE_FOLDER_INPUT:
        throw new UserInputError(error);
      case MessageFolderExceptionCode.MESSAGE_FOLDER_OWNERSHIP_VIOLATION:
        throw new ForbiddenError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  if (error instanceof MessageChannelException) {
    switch (error.code) {
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_OWNERSHIP_VIOLATION:
      case MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND:
        throw new ForbiddenError(error);
      default:
        break;
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
