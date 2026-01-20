import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type FlatNavigationMenuItemMaps } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';

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
      const normalizedUserWorkspaceId =
        createNavigationMenuItemInput.userWorkspaceId ?? null;
      const normalizedFolderId = createNavigationMenuItemInput.folderId ?? null;

      const existingItems = Object.values(
        flatNavigationMenuItemMaps.byId,
      ).filter(
        (item) =>
          isDefined(item) &&
          item.workspaceId === workspaceId &&
          (item.userWorkspaceId ?? null) === normalizedUserWorkspaceId &&
          (item.folderId ?? null) === normalizedFolderId,
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
      userWorkspaceId: createNavigationMenuItemInput.userWorkspaceId ?? null,
      targetRecordId: createNavigationMenuItemInput.targetRecordId ?? null,
      targetObjectMetadataId:
        createNavigationMenuItemInput.targetObjectMetadataId ?? null,
      folderId: createNavigationMenuItemInput.folderId ?? null,
      name: createNavigationMenuItemInput.name ?? null,
      position,
      workspaceId,
      applicationId,
      createdAt: now,
      updatedAt: now,
    };
  };
