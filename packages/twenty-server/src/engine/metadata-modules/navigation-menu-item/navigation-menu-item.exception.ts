import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum NavigationMenuItemExceptionCode {
  NAVIGATION_MENU_ITEM_NOT_FOUND = 'NAVIGATION_MENU_ITEM_NOT_FOUND',
  INVALID_NAVIGATION_MENU_ITEM_INPUT = 'INVALID_NAVIGATION_MENU_ITEM_INPUT',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',
}

const getNavigationMenuItemExceptionUserFriendlyMessage = (
  code: NavigationMenuItemExceptionCode,
) => {
  switch (code) {
    case NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND:
      return msg`Navigation menu item not found.`;
    case NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT:
      return msg`Invalid navigation menu item input.`;
    case NavigationMenuItemExceptionCode.CIRCULAR_DEPENDENCY:
      return msg`Circular dependency detected in navigation menu item hierarchy.`;
    case NavigationMenuItemExceptionCode.MAX_DEPTH_EXCEEDED:
      return msg`Navigation menu item hierarchy exceeds maximum depth.`;
    default:
      assertUnreachable(code);
  }
};

export class NavigationMenuItemException extends CustomException<NavigationMenuItemExceptionCode> {
  constructor(
    message: string,
    code: NavigationMenuItemExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getNavigationMenuItemExceptionUserFriendlyMessage(code),
    });
  }
}
