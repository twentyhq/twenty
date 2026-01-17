import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CommandMenuItemExceptionCode {
  COMMAND_MENU_ITEM_NOT_FOUND = 'COMMAND_MENU_ITEM_NOT_FOUND',
  INVALID_COMMAND_MENU_ITEM_INPUT = 'INVALID_COMMAND_MENU_ITEM_INPUT',
}

const getCommandMenuItemExceptionUserFriendlyMessage = (
  code: CommandMenuItemExceptionCode,
) => {
  switch (code) {
    case CommandMenuItemExceptionCode.COMMAND_MENU_ITEM_NOT_FOUND:
      return msg`Command menu item not found.`;
    case CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT:
      return msg`Invalid command menu item input.`;
    default:
      assertUnreachable(code);
  }
};

export class CommandMenuItemException extends CustomException<CommandMenuItemExceptionCode> {
  constructor(
    message: string,
    code: CommandMenuItemExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getCommandMenuItemExceptionUserFriendlyMessage(code),
    });
  }
}
