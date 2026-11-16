import { msg } from '@lingui/core/macro';

import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

export const resolveNavigationMenuItemParentIdAlias = <
  TInput extends { parentId?: string | null; folderId?: string | null },
>(
  input: TInput,
): Omit<TInput, 'folderId'> => {
  const { folderId, ...inputWithoutFolderId } = input;

  if (folderId === undefined) {
    return inputWithoutFolderId;
  }

  if (
    inputWithoutFolderId.parentId !== undefined &&
    inputWithoutFolderId.parentId !== folderId
  ) {
    throw new NavigationMenuItemException(
      'parentId and folderId must not differ',
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      {
        userFriendlyMessage: msg`Pass parentId only, folderId is deprecated.`,
      },
    );
  }

  return { ...inputWithoutFolderId, parentId: folderId };
};
