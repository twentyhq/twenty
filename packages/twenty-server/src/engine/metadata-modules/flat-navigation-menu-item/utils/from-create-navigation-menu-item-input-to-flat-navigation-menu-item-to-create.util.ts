import { v4 as uuidv4 } from 'uuid';

import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { isDefined } from 'twenty-shared/utils';

export const fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate =
  ({
    createNavigationMenuItemInput,
    workspaceId,
    applicationId,
    flatNavigationMenuItemMaps,
  }: {
    createNavigationMenuItemInput: CreateNavigationMenuItemInput;
    workspaceId: string;
    applicationId: string;
    flatNavigationMenuItemMaps: FlatNavigationMenuItemMaps;
  }): FlatNavigationMenuItem => {
    const id = uuidv4();
    const now = new Date().toISOString();

    let position = createNavigationMenuItemInput.position;
    if (!isDefined(position)) {
      const existingItems = Object.values(
        flatNavigationMenuItemMaps.byId,
      ).filter(
        (item) =>
          isDefined(item) &&
          item.workspaceId === workspaceId &&
          item.forWorkspaceMemberId ===
            createNavigationMenuItemInput.forWorkspaceMemberId &&
          item.favoriteFolderId ===
            createNavigationMenuItemInput.favoriteFolderId,
      );

      const maxPosition = existingItems.reduce(
        (max, item) => Math.max(max, item?.position ?? 0),
        0,
      );

      position = maxPosition + 1;
    }

    return {
      id,
      universalIdentifier: id,
      forWorkspaceMemberId:
        createNavigationMenuItemInput.forWorkspaceMemberId ?? null,
      targetRecordId: createNavigationMenuItemInput.targetRecordId,
      targetObjectMetadataId: createNavigationMenuItemInput.targetObjectMetadataId,
      favoriteFolderId: createNavigationMenuItemInput.favoriteFolderId ?? null,
      position,
      workspaceId,
      applicationId,
      createdAt: now,
      updatedAt: now,
    };
  };
