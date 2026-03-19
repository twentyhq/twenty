import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
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
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
