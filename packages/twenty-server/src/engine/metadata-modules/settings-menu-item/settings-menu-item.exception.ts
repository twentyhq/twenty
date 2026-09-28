import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SettingsMenuItemExceptionCode {
  SETTINGS_MENU_ITEM_NOT_FOUND = 'SETTINGS_MENU_ITEM_NOT_FOUND',
  INVALID_SETTINGS_MENU_ITEM_INPUT = 'INVALID_SETTINGS_MENU_ITEM_INPUT',
  SETTINGS_MENU_ITEM_FRONT_COMPONENT_NOT_FOUND = 'SETTINGS_MENU_ITEM_FRONT_COMPONENT_NOT_FOUND',
  SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN = 'SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN',
  RESERVED_SETTINGS_MENU_ITEM_TITLE = 'RESERVED_SETTINGS_MENU_ITEM_TITLE',
}

const getSettingsMenuItemExceptionUserFriendlyMessage = (
  code: SettingsMenuItemExceptionCode,
) => {
  switch (code) {
    case SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_NOT_FOUND:
      return msg`Settings menu item not found.`;
    case SettingsMenuItemExceptionCode.INVALID_SETTINGS_MENU_ITEM_INPUT:
      return msg`Invalid settings menu item input.`;
    case SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_FRONT_COMPONENT_NOT_FOUND:
      return msg`The front component this settings menu item renders was not found.`;
    case SettingsMenuItemExceptionCode.SETTINGS_MENU_ITEM_POSITION_ALREADY_TAKEN:
      return msg`Another settings menu item of this application already uses this position.`;
    case SettingsMenuItemExceptionCode.RESERVED_SETTINGS_MENU_ITEM_TITLE:
      return msg`This settings menu item title is reserved.`;
    default:
      assertUnreachable(code);
  }
};

export class SettingsMenuItemException extends CustomException<SettingsMenuItemExceptionCode> {
  constructor(
    message: string,
    code: SettingsMenuItemExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getSettingsMenuItemExceptionUserFriendlyMessage(code),
    });
  }
}
