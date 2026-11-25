import { msg } from '@lingui/core/macro';

import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

// TODO(@thomtrp): remove with the deprecated folderId GraphQL alias, along with its resolver calls
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
      'parentId and folderId must match',
      NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      {
        userFriendlyMessage: msg`parentId and folderId must match. folderId is deprecated, use parentId.`,
      },
    );
  }

  return { ...inputWithoutFolderId, parentId: folderId };
};
