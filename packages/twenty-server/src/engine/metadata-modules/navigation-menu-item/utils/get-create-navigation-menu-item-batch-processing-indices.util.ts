import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import {
  NavigationMenuItemException,
  NavigationMenuItemExceptionCode,
} from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';

export const getCreateNavigationMenuItemBatchProcessingIndices = ({
  inputs,
  existingIds,
}: {
  inputs: CreateNavigationMenuItemInput[];
  existingIds: Set<string>;
}): number[] => {
  const folderIndices: number[] = [];
  const nonFolderIndices: number[] = [];

  inputs.forEach((input, index) => {
    if (input.type === NavigationMenuItemType.FOLDER) {
      if (!isDefined(input.id)) {
        throw new NavigationMenuItemException(
          'Folder navigation menu items in a batch create must include an id',
          NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
        );
      }
      folderIndices.push(index);
    } else {
      nonFolderIndices.push(index);
    }
  });

  if (folderIndices.length <= 1) {
    return [...folderIndices, ...nonFolderIndices];
  }

  // Topological sort: process parent folders before children
  const ordered: number[] = [];
  const remaining = [...folderIndices];

  while (remaining.length > 0) {
    const readyIndex = remaining.findIndex((inputIndex) => {
      const folder = inputs[inputIndex];

      if (!isDefined(folder.folderId)) {
        return true;
      }

      return (
        existingIds.has(folder.folderId) ||
        ordered.some(
          (orderedIndex) => inputs[orderedIndex].id === folder.folderId,
        )
      );
    });

    if (readyIndex === -1) {
      throw new NavigationMenuItemException(
        'Invalid folder hierarchy in batch create (missing parent folder or cycle)',
        NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      );
    }

    ordered.push(remaining.splice(readyIndex, 1)[0]);
  }

  return [...ordered, ...nonFolderIndices];
};
