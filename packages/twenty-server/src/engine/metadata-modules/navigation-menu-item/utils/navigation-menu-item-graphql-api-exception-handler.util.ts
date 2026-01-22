import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

export const navigationMenuItemGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof NavigationMenuItemException) {
    switch (error.code) {
      case NavigationMenuItemExceptionCode.NAVIGATION_MENU_ITEM_NOT_FOUND:
        throw new NotFoundError(error);
      case NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT:
      case NavigationMenuItemExceptionCode.CIRCULAR_DEPENDENCY:
      case NavigationMenuItemExceptionCode.MAX_DEPTH_EXCEEDED:
        throw new UserInputError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
