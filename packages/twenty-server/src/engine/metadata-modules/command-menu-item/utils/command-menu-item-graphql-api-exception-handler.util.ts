import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CommandMenuItemException,
  CommandMenuItemExceptionCode,
} from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';

export const commandMenuItemGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof CommandMenuItemException) {
    switch (error.code) {
      case CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND:
        throw new NotFoundError(error);
      case CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
